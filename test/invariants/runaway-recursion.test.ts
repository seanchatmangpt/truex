import { describe, it, expect } from 'vitest'
import { createProxy } from '../../src/proxy/create-proxy.js'
import {
  createInvariantContext,
  createInvariantSetInterceptor,
  CircularDependencyError,
  RecursionRefusalError
} from '../../src/invariants/invariant-context.js'
import {
  createVirtualContext,
  registerVirtualInterceptors
} from '../../src/virtualization/virtual-context.js'
import {
  createTransactionContext,
} from '../../src/transactions/transaction-context.js'
import { createReceipt } from '../../packages/truex-core/src/receipt.js'
import { createDeterministicContext } from '../../packages/truex-core/src/context.js'

describe('Runaway & Recursion Controller', () => {
  describe('Circular Invariants Cycle Detection', () => {
    it('should refuse circular invariants safely before RangeError stack overflow occurs', () => {
      const target = { value: 0 }
      const { proxy, defineSetInterceptor } = createProxy(target)

      const invCtx = createInvariantContext(target, {
        circularInv: (t, op) => {
          if (op.trap === 'set' && op.property === 'value') {
            // Mutate property again to trigger circular check on stack
            proxy.value = op.value + 1
          }
          return true
        }
      })

      defineSetInterceptor(createInvariantSetInterceptor(invCtx))

      expect(() => {
        invCtx.call(() => {
          proxy.value = 1
        })
      }).toThrow(CircularDependencyError)
    })

    it('should refuse mutual circular invariants safely', () => {
      const target = { a: 0, b: 0 }
      const { proxy, defineSetInterceptor } = createProxy(target)

      const invCtx = createInvariantContext(target, {
        invA: (t, op) => {
          if (op.trap === 'set' && op.property === 'a') {
            proxy.b = op.value
          }
          return true
        },
        invB: (t, op) => {
          if (op.trap === 'set' && op.property === 'b') {
            proxy.a = op.value + 1
          }
          return true
        }
      })

      defineSetInterceptor(createInvariantSetInterceptor(invCtx))

      expect(() => {
        invCtx.call(() => {
          proxy.a = 1
        })
      }).toThrow(CircularDependencyError)
    })
  })

  describe('Circular Virtual Dependencies & Limits', () => {
    it('should catch circular virtual dependencies via visited sets', () => {
      const target = {} as any
      const vSpec = {
        virtualFields: {
          vA: {
            compute: () => proxy.vB
          },
          vB: {
            compute: () => proxy.vA
          }
        }
      }
      const vCtx = createVirtualContext(target, vSpec)
      const proxyInterface = createProxy(target)
      registerVirtualInterceptors(proxyInterface, vCtx)
      const proxy = proxyInterface.proxy as any

      expect(() => {
        vCtx.call(() => {
          const _val = proxy.vA
        })
      }).toThrow(CircularDependencyError)
    })

    it('should enforce maxDepth limit for virtual dependencies', () => {
      const target = {} as any
      const vSpec = {
        virtualFields: {
          v1: { compute: () => proxy.v2 },
          v2: { compute: () => proxy.v3 },
          v3: { compute: () => 'done' }
        }
      }
      const vCtx = createVirtualContext(target, vSpec, { maxDepth: 2 })
      const proxyInterface = createProxy(target)
      registerVirtualInterceptors(proxyInterface, vCtx)
      const proxy = proxyInterface.proxy as any

      expect(() => {
        vCtx.call(() => {
          const _val = proxy.v1
        })
      }).toThrow(RecursionRefusalError)
    })

    it('should enforce fuel limit for virtual dependencies', () => {
      const target = {} as any
      const vSpec = {
        virtualFields: {
          v1: { compute: () => proxy.v2 },
          v2: { compute: () => proxy.v3 },
          v3: { compute: () => 'done' }
        }
      }
      const vCtx = createVirtualContext(target, vSpec, { fuel: 2 })
      const proxyInterface = createProxy(target)
      registerVirtualInterceptors(proxyInterface, vCtx)
      const proxy = proxyInterface.proxy as any

      expect(() => {
        vCtx.call(() => {
          const _val = proxy.v1
        })
      }).toThrow(RecursionRefusalError)
    })
  })

  describe('Transaction Depth Limits & Budget', () => {
    it('should enforce transaction depth budgets and refuse nesting that exceeds limit', () => {
      const target = { x: 1 }
      const tx = createTransactionContext(target, { maxDepth: 3 })

      let errorThrown: any = null
      try {
        tx.call(() => {
          tx.call(() => {
            tx.call(() => {
              tx.call(() => {
                // Exceeds limit of 3
              })
            })
          })
        })
      } catch (e) {
        errorThrown = e
      }

      expect(errorThrown).toBeInstanceOf(Error)
      expect(errorThrown.name).toBe('RecursionRefusalError')

      // Create a refused receipt to verify receipt lineage and causality
      const ctx = createDeterministicContext(42)
      const receipt = createReceipt(
        ctx,
        ctx.uuid(),
        'delta-nested-tx',
        'input-hash',
        'output-hash',
        null,
        'refused',
        undefined,
        { reason: errorThrown.message }
      )

      expect(receipt.status).toBe('refused')
      expect(receipt.reason).toContain('Transaction nesting limit')
    })
  })
})
