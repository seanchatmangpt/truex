import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
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
    it('should identify function types', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(function() {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
      expect(isFunction({})).toBe(false)
      expect(isFunction(undefined)).toBe(false)
      expect(isFunction(123)).toBe(false)
    })

    it('should identify primitive types', () => {
      expect(isPrimitive('string')).toBe(true)
      expect(isPrimitive(123)).toBe(true)
      expect(isPrimitive(true)).toBe(true)
      expect(isPrimitive(undefined)).toBe(true)
      expect(isPrimitive(Symbol('test'))).toBe(true)
      expect(isPrimitive(123n)).toBe(true)
      
      expect(isPrimitive({})).toBe(false)
      expect(isPrimitive([])).toBe(false)
      expect(isPrimitive(() => {})).toBe(false)
    })

    it('should distinguish between different object types', () => {
      expect(isObject({})).toBe(true)
      expect(isObject([])).toBe(true)
      expect(isObject(new Date())).toBe(true)
      expect(isObject(undefined)).toBe(false)
      
      expect(isPlainObject({})).toBe(true)
      expect(isPlainObject(new Object())).toBe(true)
      expect(isPlainObject([])).toBe(false)
      expect(isPlainObject(new Date())).toBe(false)
      
      expect(getType([])).toBe('array')
      expect(getType({})).toBe('object')
      expect(getType(new Date())).toBe('date')
      expect(getType(/abc/)).toBe('regexp')
      expect(getType(new Map())).toBe('map')
      expect(getType(new Set())).toBe('set')
      expect(getType(undefined)).toBe('undefined')
    })
  })

  describe('Array utilities', () => {
    it('should flatten nested arrays', () => {
      expect(flatten([1, [2, [3, 4]], 5])).toEqual([1, 2, 3, 4, 5])
    })
    it('should deduplicate array elements', () => {
      expect(unique([1, 2, 2, 3, 1])).toEqual([1, 2, 3])
    })
    it('should find common elements between arrays', () => {
      expect(intersection([1, 2, 3], [2, 3, 4], [3, 4, 5])).toEqual([3])
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
