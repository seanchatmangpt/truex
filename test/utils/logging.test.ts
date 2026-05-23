import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fc from 'fast-check'
import { faker } from '@faker-js/faker'
import { createLoggingProxy } from '../../packages/truex-core/src/utils/proxy-log.ts'
import { LogLevel, setLogLevel, formatLog, log } from '../../packages/truex-core/src/utils/log-format.ts'
import { logError, sanitize, DEFAULT_REDACTED_KEYS } from '../../packages/truex-core/src/utils/error-log.ts'
import { measureTime } from '../../packages/truex-core/src/utils/timing.ts'

describe('Logging utilities property tests', () => {
  let originalConsole: any

  beforeEach(() => {
    originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug
    }
    console.log = vi.fn()
    console.warn = vi.fn()
    console.error = vi.fn()
    console.debug = vi.fn()
    setLogLevel(LogLevel.INFO)
  })

  afterEach(() => {
    console.log = originalConsole.log
    console.warn = originalConsole.warn
    console.error = originalConsole.error
    console.debug = originalConsole.debug
    vi.clearAllMocks()
  })

  const logLevelArb = fc.constantFrom(
    LogLevel.DEBUG,
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
    LogLevel.NONE
  )

  const messageArb = fc.string().map(() => faker.lorem.sentence())
  
  const contextArb = fc.oneof(fc.anything(), fc.bigInt()).map(val => {
    if (val !== null && typeof val === 'object') {
      try {
        (val as any).self = val
        const child = { parent: val }
        ;(val as any).child = child
      } catch {
        // Handle non-extensible objects
      }
    }
    return val
  })

  describe('formatLog property tests', () => {
    it('should handle arbitrary messages and context without crashing', () => {
      fc.assert(
        fc.property(logLevelArb, messageArb, contextArb, (level, message, context) => {
          setLogLevel(LogLevel.DEBUG) // Ensure everything logs
          const formatted = formatLog(level, message, context as any)
          
          if (level !== LogLevel.NONE) {
            expect(typeof formatted).toBe('string')
            expect(formatted).toContain(message)
            const levelName = LogLevel[level]
            expect(formatted).toContain(levelName)
          } else {
            // NONE level should probably not log anything or be handled
            // Based on code: if (level < currentLogLevel) return undefined
            // If currentLogLevel is DEBUG (0), and level is NONE (4), it will log.
            // Wait, LogLevel.NONE is 4. If currentLogLevel is DEBUG(0), 4 > 0, so it logs.
            expect(typeof formatted).toBe('string')
          }
        })
      )
    })

    it('should respect log level filtering', () => {
      fc.assert(
        fc.property(logLevelArb, logLevelArb, messageArb, (currentLevel, msgLevel, message) => {
          setLogLevel(currentLevel)
          const formatted = formatLog(msgLevel, message)
          
          if (msgLevel < currentLevel) {
            expect(formatted).toBeUndefined()
          } else {
            expect(formatted).toBeDefined()
          }
        })
      )
    })
  })

  describe('sanitize property tests', () => {
    it('should redact sensitive keys in arbitrary objects', () => {
      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.anything()), (obj) => {
          // Inject some sensitive keys
          const sensitiveKey = faker.helpers.arrayElement(DEFAULT_REDACTED_KEYS)
          const sensitiveValue = faker.internet.password()
          obj[sensitiveKey] = sensitiveValue
          obj['nested'] = { [sensitiveKey]: sensitiveValue }

          const sanitized = sanitize(obj)
          
          expect(sanitized[sensitiveKey]).toBe('[REDACTED]')
          expect(sanitized.nested[sensitiveKey]).toBe('[REDACTED]')
        })
      )
    })

    // This test will likely fail if sanitize doesn't handle circularity
    it('should handle circular references in sanitize without crashing', () => {
      fc.assert(
        fc.property(contextArb, (obj) => {
          if (obj !== null && typeof obj === 'object') {
            const sanitized = sanitize(obj)
            expect(sanitized).toBeDefined()
          }
        })
      )
    })
  })

  describe('logError property tests', () => {
    it('should handle arbitrary errors and context', () => {
      fc.assert(
        fc.property(fc.anything(), contextArb, (errVal, context) => {
          let errStr = '';
          try {
            errStr = String(errVal);
          } catch {
            errStr = '[unstringable object]';
          }
          const error = errVal instanceof Error ? errVal : new Error(errStr);
          const payload = logError(error, context as any)
          
          expect(payload).toBeDefined()
          expect(payload.error.message).toBe(error.message)
          expect(console.error).toHaveBeenCalled()
        })
      )
    })
  })

  describe('createLoggingProxy property tests', () => {
    it('should log operations on arbitrary objects', () => {
      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.anything()), fc.string(), (target, name) => {
          const proxy = createLoggingProxy(target, { name })
          const keys = Object.keys(target)
          if (keys.length > 0) {
            const key = faker.helpers.arrayElement(keys)
            
            // Test GET
            const _val = proxy[key]
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${name}: GET ${key}`))
            
            // Test SET
            const newVal = faker.string.alphanumeric()
            proxy[key] = newVal
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${name}: SET ${key}`))
            expect(target[key]).toBe(newVal)
            
            // Test DELETE
            delete proxy[key]
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining(`${name}: DELETE ${key}`))
            expect(Object.prototype.hasOwnProperty.call(target, key)).toBe(false)
          }
        })
      )
    })
  })

  describe('Performance timing', () => {
    it('should measure duration for arbitrary operations', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 20 }), (delay) => {
          const { duration } = measureTime(() => {
            const start = performance.now()
            while (performance.now() - start < delay) {}
          })
          expect(duration).toBeGreaterThanOrEqual(delay - 1) // Small buffer for timing jitter
        })
      )
    })
  })
})
