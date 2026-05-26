/**
 * @module types
 * @description Core types for the Storehouse Stewardship Infrastructure.
 */

/**
 * A Field is a domain of responsibility and cultivation.
 */
export type Field = {
  readonly id: string;
  readonly name: string;
  readonly owner: string;
};

/**
 * Increase represents the overflow or growth from a field.
 */
export type Increase = {
  readonly amount: number;
  readonly currency: string;
  readonly timestamp: number;
};

/**
 * The First Portion is exactly 10% of the increase.
 * This is structurally enforced.
 */
export type FirstPortion = {
  readonly amount: number;
  readonly currency: string;
  readonly increaseId: string;
};

/**
 * A Receiver is the appointed destination for a provision.
 */
export type Receiver = {
  readonly id: string;
  readonly name: string;
};

/**
 * Provision is the first portion routed to a receiver.
 */
export type Provision = {
  readonly amount: number;
  readonly receiver: Receiver;
  readonly fieldId: string;
};

/**
 * StorehouseReceipt is the record of stewardship.
 * It MUST have a receiver to be valid stewardship.
 * 'Hoarding' is the absence of a receiver, which is malformed.
 */
export interface StorehouseReceipt {
  readonly id: string;
  readonly provision: Provision;
  readonly stewardshipConfirmed: true;
}

/**
 * 'Extraction' is not a valid type in this system.
 * By not providing a type for it, we make it structurally unrepresentable
 * in functions that expect Storehouse types.
 */
export type ValidMotion = Provision | StorehouseReceipt;

// We use a unique symbol to ensure that only valid motions can be processed.
const MotionBrand = Symbol('MotionBrand');

export interface BrandedMotion {
  readonly [MotionBrand]: true;
}

export type StewardshipMotion = (Provision | StorehouseReceipt) & BrandedMotion;

export function brandMotion<T extends ValidMotion>(motion: T): T & BrandedMotion {
  return {
    ...motion,
    [MotionBrand]: true as const,
  };
}
