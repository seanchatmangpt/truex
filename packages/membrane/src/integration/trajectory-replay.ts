/**
 * @module trajectory-replay
 * @description Isolated context and utilities for trajectory replay execution.
 * Gall Classification: S1 (replay primitives) / S2 (engine primitives).
 */
import { createContext } from 'unctx';

/**
 * Isolated context for trajectory replay execution.
 */
export const trajectoryContext = createContext<any>();

/**
 * Helper to retrieve the current trajectory replay state.
 * Throws an error if called outside a replay execution.
 */
export function useTrajectoryContext() {
  return trajectoryContext.use();
}

/**
 * Helper to try retrieving the current trajectory replay state.
 * Returns undefined if called outside a replay execution.
 */
export function tryUseTrajectoryContext() {
  return trajectoryContext.tryUse();
}

function setNestedProperty(obj: any, path: string, value: any) {
  if (path in obj || !path.includes('.')) {
    obj[path] = value;
    return;
  }
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!(part in current) || current[part] === null || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  current[parts.at(-1)!] = value;
}

function deleteNestedProperty(obj: any, path: string) {
  if (path in obj || !path.includes('.')) {
    delete obj[path];
    return;
  }
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]!;
    if (!(part in current) || current[part] === null || typeof current[part] !== 'object') {
      return;
    }
    current = current[part];
  }
  delete current[parts.at(-1)!];
}

/**
 * Deterministically replays an agent execution log (trapped property sets and deletes)
 * against a structuredClone of the initialState, returning the final converged state.
 * Runs within a clean, isolated context boundary.
 */
export function replayTrajectory(
  initialState: Record<string, any>,
  journal: { trap: 'set' | 'deleteProperty'; property: string; value?: any }[]
): Record<string, any> {
  const clonedState = structuredClone(initialState);

  return trajectoryContext.call(clonedState, () => {
    const activeState = trajectoryContext.use();
    for (const entry of journal) {
      if (entry.trap === 'set') {
        setNestedProperty(activeState, entry.property, entry.value);
      } else if (entry.trap === 'deleteProperty') {
        deleteNestedProperty(activeState, entry.property);
      }
    }
    return activeState;
  });
}
