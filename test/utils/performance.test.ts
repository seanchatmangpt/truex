import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  measureProxyCreationTime,
  measureTrapOverhead,
  compareTrapImplementations,
  identifyBottlenecks,
  runBenchmarks,
  generateReport
} from '../../packages/truex-core/src/utils/proxy-overhead.ts'
import { measureTime, measureTimeAsync, OperationTracker } from '../../packages/truex-core/src/utils/timing.ts'
import { estimateMemoryUsage, MemoryLeakDetector, MemoryMonitor } from '../../packages/truex-core/src/utils/memory.ts'

describe('Performance utilities', () => {
  describe('Proxy performance', () => {
    it('should measure proxy creation time for varying iterations', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (iterations) => {
          const result = measureProxyCreationTime(iterations)
          expect(result.name).toBe('Proxy Creation')
          expect(result.duration).toBeGreaterThanOrEqual(0)
          expect(result.opsPerSecond).toBeGreaterThan(0)
        })
      )
    })

    it('should measure trap execution overhead for varying iterations', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 1000 }), (iterations) => {
          const result = measureTrapOverhead(iterations)
          expect(result.get.name).toContain('GET')
          expect(result.set.name).toContain('SET')
          expect(result.get.opsPerSecond).toBeGreaterThan(0)
          expect(result.set.opsPerSecond).toBeGreaterThan(0)
        })
      )
    })

    it('should compare performance of random trap implementations', () => {
      fc.assert(
        fc.property(
          fc.dictionary(
            fc.string({ minLength: 1 }),
            fc.constant(() => { /* noop */ return undefined })
          ),
          fc.integer({ min: 1, max: 100 }),
          (traps, iterations) => {
            const results = compareTrapImplementations(traps, iterations)
            expect(results).toHaveLength(Object.keys(traps).length)
            for (const r of results) {
              expect(r.name).toContain('Trap Implementation:')
              expect(r.duration).toBeGreaterThanOrEqual(0)
            }
          }
        )
      )
    })

    it('should identify performance bottlenecks in random interceptors', () => {
      fc.assert(
        fc.property(
          fc.object(),
          fc.array(
            fc.record({
              name: fc.string({ minLength: 1 }).filter(s => s !== '__proto__' && s !== 'constructor' && s !== 'toString'),
              fn: fc.constant(() => undefined)
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.integer({ min: 1, max: 100 }),
          (target, interceptors, iterations) => {
            const results = identifyBottlenecks(target, interceptors, iterations)
            // Use Object.getOwnPropertyNames to include non-enumerable properties if any, 
            // though here we just want to check if all interceptors are present.
            // Actually, if multiple interceptors have the same name, results will have fewer keys.
            // So I should ensure names are unique OR adjust the expectation.
            const uniqueNames = new Set(interceptors.map(i => i.name))
            expect(Object.keys(results)).toHaveLength(uniqueNames.size)
            for (const v of Object.values(results)) {
              expect(typeof v).toBe('number')
            }
          }
        )
      )
    })
  })

  describe('Benchmark utilities', () => {
    it('should run performance benchmarks', async () => {
      const report = await runBenchmarks()
      expect(report.timestamp).toBeDefined()
      expect(report.results.length).toBeGreaterThan(0)
    })

    it('should generate performance reports from random results', () => {
      fc.assert(
        fc.property(
          fc.record({
            timestamp: fc.date().filter(d => !isNaN(d.getTime())).map(d => d.toISOString()),
            results: fc.array(
              fc.record({
                name: fc.string(),
                duration: fc.float(),
                opsPerSecond: fc.float()
              })
            )
          }),
          (report) => {
            const output = generateReport(report)
            expect(typeof output).toBe('string')
            expect(output).toContain('Performance Report')
            expect(output).toContain(report.timestamp)
            for (const r of report.results) {
              expect(output).toContain(r.name)
            }
          }
        )
      )
    })
  })

  describe('Timing measurements', () => {
    it('should measure function execution time for random functions', () => {
      fc.assert(
        fc.property(fc.anything(), (val) => {
          const { result, duration } = measureTime(() => val)
          expect(result).toBe(val)
          expect(duration).toBeGreaterThanOrEqual(0)
        })
      )
    })

    it('should measure async function execution time', async () => {
      await fc.assert(
        fc.asyncProperty(fc.anything(), async (val) => {
          const { result, duration } = await measureTimeAsync(async () => {
            await new Promise(resolve => setTimeout(resolve, 1))
            return val
          })
          expect(result).toBe(val)
          expect(duration).toBeGreaterThan(0)
        })
      )
    })

    it('should track cumulative operation duration for random durations', () => {
      fc.assert(
        fc.property(fc.array(fc.double({ min: 0, max: 1000, noNaN: true, noDefaultInfinity: true })), (durations) => {
          const tracker = new OperationTracker()
          let expectedTotal = 0
          for (const d of durations) {
            tracker.track(d)
            expectedTotal += d
          }
          expect(tracker.total).toBeCloseTo(expectedTotal, 5)
          expect(tracker.operationCount).toBe(durations.length)
          if (durations.length > 0) {
            expect(tracker.average).toBeCloseTo(expectedTotal / durations.length, 5)
          } else {
            expect(tracker.average).toBe(0)
          }
        })
      )
    })

    it('should throw error for negative durations', () => {
      fc.assert(
        fc.property(fc.double({ max: -0.000_01, noNaN: true }), (negativeDuration) => {
          const tracker = new OperationTracker()
          expect(() => tracker.track(negativeDuration)).toThrow('Duration cannot be negative')
        })
      )
    })
  })

  describe('Memory profiling', () => {
    it('should estimate memory usage of random objects', () => {
      fc.assert(
        fc.property(fc.anything(), (obj) => {
          const usage = estimateMemoryUsage(obj)
          expect(usage).toBeGreaterThanOrEqual(0)
          expect(typeof usage).toBe('number')
        })
      )
    })

    it('should handle circular references in memory estimation', () => {
      const obj: any = { a: 1 }
      obj.self = obj
      const usage = estimateMemoryUsage(obj)
      expect(usage).toBeGreaterThan(0)
    })

    it('should detect leaks for tracked objects', () => {
      const detector = new MemoryLeakDetector()
      const obj = { data: 'test' }
      detector.track(obj, 'test-obj')
      
      const leaks = detector.checkLeaks()
      expect(leaks).toContain('test-obj')
    })

    it('should report memory growth over time', () => {
      const monitor = new MemoryMonitor()
      monitor.snapshot()
      // Simulate some work/allocation
      const _ = Array.from({length: 100}).fill(0)
      monitor.snapshot()
      const report = monitor.getGrowthReport()
      expect(report.snapshots).toBe(2)
      expect(typeof report.totalHeapGrowth).toBe('number')
    })
  })
})
