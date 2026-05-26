/**
 * @module context
 * @description Execution context for the Storehouse Stewardship Infrastructure.
 */
import { useContext } from '@truex/membrane';
import type { StorehouseManager } from './storehouse.js';

export const useStorehouse = useContext<StorehouseManager>('storehouse');
