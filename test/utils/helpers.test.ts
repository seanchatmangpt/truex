import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { faker } from '@faker-js/faker'
import { isFunction, isPrimitive, isObject, isPlainObject, getType } from '../../packages/membrane/src/utils/type.ts'
import { deepMerge, deepClone } from '../../packages/membrane/src/utils/object.ts'
import { flatten, unique, intersection } from '../../packages/membrane/src/utils/array.ts'
import { camelToKebab, sanitizeString } from '../../packages/membrane/src/utils/string.ts'

describe('Helper utilities', () => {
  describe('Object utilities', () => {
    it('should merge objects deeply', () => {
      const obj1 = { a: 1, b: { c: 2 } }
      const obj2 = { b: { d: 3 }, e: 4 }
      const result = deepMerge(obj1, obj2)
      expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 })
    })

    it('should clone objects without mutation', () => {
      const obj = { a: 1, b: { c: 2 } }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.b).not.toBe(obj.b)
    })

    it('should check if value is plain object', () => {
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject(new Object())).toBe(true)
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(undefined)).toBe(false)
    })
  })

  describe('Type checking utilities', () => {
    const symbolArb = fc.string().map(Symbol)
    const regexpArb = fc.string().map((s) => {
      try {
        return new RegExp(s)
      } catch {
        return /abc/
      }
    })

    it('should identify function types (property-based)', () => {
      fc.assert(
        fc.property(fc.func(fc.anything()), (fn) => {
          expect(isFunction(fn)).toBe(true)
        })
      )
      
      fc.assert(
        fc.property(fc.anything().filter(v => typeof v !== 'function'), (nonFn) => {
          expect(isFunction(nonFn)).toBe(false)
        })
      )
    })

    it('should identify primitive types (property-based)', () => {
      const primitiveArb = fc.oneof(
        fc.string(),
        fc.double(),
        fc.integer(),
        fc.boolean(),
        symbolArb,
        fc.bigInt(),
        fc.constant(null),
        fc.constant(undefined)
      )

      fc.assert(
        fc.property(primitiveArb, (val) => {
          expect(isPrimitive(val)).toBe(true)
        })
      )

      const nonPrimitiveArb = fc.oneof(
        fc.object(),
        fc.array(fc.anything()),
        fc.func(fc.anything()),
        fc.date(),
        fc.map(fc.anything(), fc.anything()),
        fc.set(fc.anything())
      )

      fc.assert(
        fc.property(nonPrimitiveArb, (val) => {
          expect(isPrimitive(val)).toBe(false)
        })
      )
    })

    it('should identify object types correctly (property-based)', () => {
      // isObject: val !== null && typeof val === 'object'
      const objectArb = fc.oneof(
        fc.object(),
        fc.array(fc.anything()),
        fc.date(),
        fc.map(fc.anything(), fc.anything()),
        fc.set(fc.anything()),
        regexpArb
      )

      fc.assert(
        fc.property(objectArb, (val) => {
          expect(isObject(val)).toBe(true)
        })
      )

      const nonObjectArb = fc.oneof(
        fc.string(),
        fc.double(),
        fc.boolean(),
        fc.func(fc.anything()),
        fc.constant(null),
        fc.constant(undefined)
      )

      fc.assert(
        fc.property(nonObjectArb, (val) => {
          expect(isObject(val)).toBe(false)
        })
      )
    })

    it('should identify plain objects (property-based)', () => {
      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.anything()), (val) => {
          expect(isPlainObject(val)).toBe(true)
        })
      )

      const nonPlainObjectArb = fc.oneof(
        fc.array(fc.anything()),
        fc.date(),
        fc.func(fc.anything()),
        fc.map(fc.anything(), fc.anything()),
        fc.set(fc.anything()),
        regexpArb,
        fc.constant(null),
        fc.constant(undefined)
      )

      fc.assert(
        fc.property(nonPlainObjectArb, (val) => {
          expect(isPlainObject(val)).toBe(false)
        })
      )
    })

    it('should return correct type string from getType (property-based)', () => {
      const typeMappings = [
        { arb: fc.string(), expected: 'string' },
        { arb: fc.integer(), expected: 'number' },
        { arb: fc.boolean(), expected: 'boolean' },
        { arb: fc.constant(null), expected: 'null' },
        { arb: fc.constant(undefined), expected: 'undefined' },
        { arb: fc.array(fc.anything()), expected: 'array' },
        { arb: fc.date(), expected: 'date' },
        { arb: fc.regexp || regexpArb, expected: 'regexp' },
        { arb: fc.dictionary(fc.string(), fc.anything()), expected: 'object' },
        { arb: fc.func(fc.anything()), expected: 'function' },
        { arb: fc.bigInt(), expected: 'bigint' },
        { arb: symbolArb, expected: 'symbol' }
      ]

      for (const { arb, expected } of typeMappings) {
        fc.assert(
          fc.property(arb, (val) => {
            expect(getType(val)).toBe(expected)
          })
        )
      }
    })
  })

  describe('Array utilities', () => {
    it('should flatten nested arrays (property based)', () => {
      fc.assert(
        fc.property(
          fc.letrec(tie => ({
            array: fc.array(fc.oneof(fc.integer(), tie('array')), { maxLength: 10 })
          })).array,
          (arr) => {
            const result = flatten(arr)
            // Invariant: No element in the result should be an array
            expect(result.every(item => !Array.isArray(item))).toBe(true)

            // Invariant: All leaf elements are present in order
            const getLeaves = (a) => {
              const leaves = []
              for (const item of a) {
                if (Array.isArray(item)) {
                  leaves.push(...getLeaves(item))
                } else {
                  leaves.push(item)
                }
              }
              return leaves
            }
            expect(result).toEqual(getLeaves(arr))
          }
        )
      )
    })

    it('should deduplicate array elements (property based)', () => {
      fc.assert(
        fc.property(fc.array(fc.integer()), (arr) => {
          const result = unique(arr)
          // Invariant 1: Result contains no duplicates
          expect(new Set(result).size).toBe(result.length)
          // Invariant 2: Result size matches Set size of original
          expect(result.length).toBe(new Set(arr).size)
          // Invariant 3: All elements in result were in original
          for (const x of result) {
            expect(arr).toContain(x)
          }
        })
      )
    })

    it('should find common elements between multiple arrays (property based)', () => {
      fc.assert(
        fc.property(fc.array(fc.array(fc.integer()), { minLength: 1, maxLength: 5 }), (arrays) => {
          const result = intersection(...arrays)

          // Invariant 1: Every element in result must be in every input array
          for (const item of result) {
            for (const arr of arrays) {
              expect(arr).toContain(item)
            }
          }

          // Invariant 2: Every element that is in every input array must be in the result
          const firstArr = arrays[0]
          for (const item of firstArr) {
            if (arrays.every(a => a.includes(item))) {
              expect(result).toContain(item)
            }
          }
        })
      )
    })
  })

  describe('String utilities', () => {
    it('should convert camelCase to kebab-case (property based)', () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = camelToKebab(str)
          // Invariant: Result should always be lowercase
          expect(result).toBe(result.toLowerCase())
        })
      )
    })

    it('should handle faker-generated camelCase strings', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 5 }), (numWords) => {
          const words = Array.from({ length: numWords }, () => {
            const word = faker.string.alpha({ length: { min: 2, max: 8 } })
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          })
          
          const camelCase = words.join('')
          const result = camelToKebab(camelCase)
          
          expect(result).toBe(result.toLowerCase())
          // For multi-word strings, it should have hyphens between words
          if (numWords > 1) {
            expect(result).toContain('-')
            expect(result.split('-').length).toBeGreaterThanOrEqual(numWords)
          }
        })
      )
    })

    it('should sanitize strings for security (property based)', () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = sanitizeString(str)
          const unsafeChars = ['<', '>', '"', "'"]
          for (const char of unsafeChars) {
            expect(result).not.toContain(char)
          }
          
          // Verify that all occurrences of special characters are escaped
          if (str.includes('<')) expect(result).toContain('&lt;')
          if (str.includes('>')) expect(result).toContain('&gt;')
          if (str.includes('"')) expect(result).toContain('&quot;')
          if (str.includes("'")) expect(result).toContain('&#39;')
          if (str.includes('&')) expect(result).toContain('&amp;')
          if (str.includes('/')) expect(result).toContain('&#x2F;')
          
          expect(result.length).toBeGreaterThanOrEqual(str.length)
        })
      )
    })
  })
})
