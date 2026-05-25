import { describe, it, expect } from 'vitest'
import { createProxy } from '../../src/proxy/create-proxy.js'
import {
  createPowlContext,
  createPowlApplyInterceptor,
  createPowlConstructInterceptor,
  registerPowlInterceptors,
  PowlStateMachine,
} from '../../src/contracts/powl-context.js'

describe('POWL Context & State Machine Governor', () => {
  describe('PowlStateMachine Traversal Logic', () => {
    it('should validate linear execution sequence', () => {
      // Sequence: cp_init -> cp_map -> cp_plan
      const workflow = {
        type: 'partial_order',
        id: 'linear_po',
        nodes: [
          { type: 'activity', id: 'cp_init', label: 'Init' },
          { type: 'activity', id: 'cp_map', label: 'Map' },
          { type: 'activity', id: 'cp_plan', label: 'Plan' }
        ],
        edges: [
          { from: 'cp_init', to: 'cp_map' },
          { from: 'cp_map', to: 'cp_plan' }
        ]
      }

      const sm = new PowlStateMachine(workflow)
      expect(sm.isAdmissible('cp_init')).toBe(true)
      expect(sm.isAdmissible('cp_map')).toBe(false)
      expect(sm.isAdmissible('cp_plan')).toBe(false)

      sm.executeActivity('cp_init')
      expect(sm.isAdmissible('cp_init')).toBe(false)
      expect(sm.isAdmissible('cp_map')).toBe(true)
      expect(sm.isAdmissible('cp_plan')).toBe(false)

      sm.executeActivity('cp_map')
      expect(sm.isAdmissible('cp_init')).toBe(false)
      expect(sm.isAdmissible('cp_map')).toBe(false)
      expect(sm.isAdmissible('cp_plan')).toBe(true)

      sm.executeActivity('cp_plan')
      expect(sm.isNodeCompleted('linear_po')).toBe(true)
    })

    it('should validate concurrent/parallel execution in partial orders', () => {
      // cp_init -> (cp_forge || cp_bind) -> cp_handoff
      const workflow = {
        type: 'partial_order',
        id: 'concurrent_po',
        nodes: [
          { type: 'activity', id: 'cp_init', label: 'Init' },
          {
            type: 'partial_order',
            id: 'parallel_block',
            nodes: [
              { type: 'activity', id: 'cp_forge', label: 'Forge' },
              { type: 'activity', id: 'cp_bind', label: 'Bind' }
            ],
            edges: [] // No edges between forge and bind = concurrent
          },
          { type: 'activity', id: 'cp_handoff', label: 'Handoff' }
        ],
        edges: [
          { from: 'cp_init', to: 'parallel_block' },
          { from: 'parallel_block', to: 'cp_handoff' }
        ]
      }

      const sm = new PowlStateMachine(workflow)
      expect(sm.isAdmissible('cp_init')).toBe(true)
      expect(sm.isAdmissible('cp_forge')).toBe(false)
      expect(sm.isAdmissible('cp_bind')).toBe(false)

      sm.executeActivity('cp_init')
      // Both forge and bind are now enabled in parallel
      expect(sm.isAdmissible('cp_forge')).toBe(true)
      expect(sm.isAdmissible('cp_bind')).toBe(true)
      expect(sm.isAdmissible('cp_handoff')).toBe(false)

      // Execute bind first
      sm.executeActivity('cp_bind')
      expect(sm.isAdmissible('cp_forge')).toBe(true)
      expect(sm.isAdmissible('cp_bind')).toBe(false)
      expect(sm.isAdmissible('cp_handoff')).toBe(false)

      // Execute forge next
      sm.executeActivity('cp_forge')
      // Once both are done, parallel_block is completed, enabling handoff
      expect(sm.isAdmissible('cp_handoff')).toBe(true)

      sm.executeActivity('cp_handoff')
      expect(sm.isNodeCompleted('concurrent_po')).toBe(true)
    })

    it('should validate choice graph branching and looping', () => {
      // Choice Graph: cp_prove -> cp_harden -> cp_prove (loop)
      // Or cp_prove -> cp_handoff
      const workflow = {
        type: 'choice_graph',
        id: 'cg_loop',
        start: 'cp_prove',
        end: 'cp_handoff',
        nodes: [
          { type: 'activity', id: 'cp_prove', label: 'Prove' },
          { type: 'activity', id: 'cp_harden', label: 'Harden' },
          { type: 'activity', id: 'cp_handoff', label: 'Handoff' }
        ],
        edges: [
          { from: 'cp_prove', to: 'cp_harden' },
          { from: 'cp_harden', to: 'cp_prove' },
          { from: 'cp_prove', to: 'cp_handoff' }
        ]
      }

      const sm = new PowlStateMachine(workflow)
      expect(sm.isAdmissible('cp_prove')).toBe(true)
      expect(sm.isAdmissible('cp_harden')).toBe(false)
      expect(sm.isAdmissible('cp_handoff')).toBe(false)

      sm.executeActivity('cp_prove')
      // Now either cp_harden or cp_handoff is allowed
      expect(sm.isAdmissible('cp_harden')).toBe(true)
      expect(sm.isAdmissible('cp_handoff')).toBe(true)

      // Loop back via cp_harden
      sm.executeActivity('cp_harden')
      expect(sm.isAdmissible('cp_prove')).toBe(true)
      expect(sm.isAdmissible('cp_harden')).toBe(false)
      expect(sm.isAdmissible('cp_handoff')).toBe(false)

      // Execute cp_prove again
      sm.executeActivity('cp_prove')
      expect(sm.isAdmissible('cp_harden')).toBe(true)
      expect(sm.isAdmissible('cp_handoff')).toBe(true)

      // Finish choice graph
      sm.executeActivity('cp_handoff')
      expect(sm.isNodeCompleted('cg_loop')).toBe(true)
    })

    it('should propagate silent steps automatically', () => {
      // cp_init -> cp_silent (silent) -> cp_done
      const workflow = {
        type: 'partial_order',
        id: 'silent_po',
        nodes: [
          { type: 'activity', id: 'cp_init', label: 'Init' },
          { type: 'silent', id: 'cp_silent' },
          { type: 'activity', id: 'cp_done', label: 'Done' }
        ],
        edges: [
          { from: 'cp_init', to: 'cp_silent' },
          { from: 'cp_silent', to: 'cp_done' }
        ]
      }

      const sm = new PowlStateMachine(workflow)
      expect(sm.isAdmissible('cp_init')).toBe(true)
      expect(sm.isAdmissible('cp_done')).toBe(false)

      sm.executeActivity('cp_init')
      // cp_silent should be completed automatically by propagation, enabling cp_done
      expect(sm.isNodeCompleted('cp_silent')).toBe(true)
      expect(sm.isAdmissible('cp_done')).toBe(true)

      sm.executeActivity('cp_done')
      expect(sm.isNodeCompleted('silent_po')).toBe(true)
    })
  })

  describe('createPowlContext & Interceptor Enforcement', () => {
    it('should enforce execution sequencing through createProxy traps', () => {
      const target = {
        cp_init: function cp_init() { return 'init_done' },
        cp_map: function cp_map() { return 'map_done' },
        cp_plan: function cp_plan() { return 'plan_done' }
      }

      const workflow = {
        type: 'partial_order',
        id: 'linear_po',
        nodes: [
          { type: 'activity', id: 'cp_init', label: 'Init' },
          { type: 'activity', id: 'cp_map', label: 'Map' },
          { type: 'activity', id: 'cp_plan', label: 'Plan' }
        ],
        edges: [
          { from: 'cp_init', to: 'cp_map' },
          { from: 'cp_map', to: 'cp_plan' }
        ]
      }

      const { proxy, defineApplyInterceptor } = createProxy(target)
      const powlCtx = createPowlContext(target, workflow)

      defineApplyInterceptor(createPowlApplyInterceptor(powlCtx))

      powlCtx.call(() => {
        // Valid first call
        expect(proxy.cp_init()).toBe('init_done')

        // Invalid: calling cp_plan before cp_map
        expect(() => {
          proxy.cp_plan()
        }).toThrow(/POWL state machine violation: transition to 'cp_plan' is mathematically inadmissible/)

        // Valid second call
        expect(proxy.cp_map()).toBe('map_done')

        // Valid third call
        expect(proxy.cp_plan()).toBe('plan_done')
      })
    })
  })
})
