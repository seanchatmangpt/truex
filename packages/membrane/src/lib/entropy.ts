import { Faker, en } from '@faker-js/faker';
import * as fc from 'fast-check';
import type { TruexContext } from '../context.js';

/**
 * @module entropy
 * @description Centralized deterministic entropy provider.
 * Wraps faker and fast-check to ensure all "random" generation is derived from TruexContext.
 * Adheres to the Entropy Law: no Math.random(), only seeded admissible entropy.
 */
export class TruexEntropy {
  /**
   * Seeded faker instance.
   * Use this for generating deterministic mock data (names, emails, etc.).
   */
  public readonly faker: Faker;

  /**
   * Fast-check instance.
   * Use this for property-based testing and generative sequences.
   */
  public readonly fc = typeof fc === 'object' && 'default' in fc ? (fc as any).default as typeof fc : fc;

  constructor(private context: TruexContext) {
    this.faker = new Faker({ locale: [en] });
    this.faker.seed(context.seed);
  }

  /**
   * Executes a fast-check assertion using the context seed.
   * Ensures that property tests are perfectly reproducible.
   */
  public assert<T>(property: fc.IProperty<T> | fc.IAsyncProperty<T>, options?: fc.Parameters<T>): void | Promise<void> {
    return this.fc.assert(property as any, {
      ...options,
      seed: this.context.seed,
    });
  }

  /**
   * Executes a fast-check check using the context seed.
   */
  public check<T>(property: fc.IProperty<T> | fc.IAsyncProperty<T>, options?: fc.Parameters<T>): fc.RunDetails<T> | Promise<fc.RunDetails<T>> {
    return this.fc.check(property as any, {
      ...options,
      seed: this.context.seed,
    });
  }

  /**
   * Re-seeds the faker instance. Use sparingly, typically when resetting a sequence.
   */
  public reseed(seed: number): void {
    this.faker.seed(seed);
  }

  /**
   * Generates a deterministic UUID based on the context.
   * This delegates to the context's own deterministic UUID generator.
   */
  public uuid(): string {
    return this.context.uuid();
  }

  /**
   * Generates a deterministic timestamp based on the context clock.
   */
  public now(): number {
    return this.context.clock();
  }

  /**
   * Returns the underlying TruexContext.
   */
  public getContext(): TruexContext {
    return this.context;
  }
}
