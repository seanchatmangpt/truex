import { createProxy } from '../../src/proxy/create-proxy.js';

/**
 * Validates a POWL model for structural integrity (e.g., cycle refusal).
 */
export function validatePowlModel(powlModel) {
  if (powlModel.type === 'partial_order') {
    // Cycle detection using DFS
    const adj = new Map();
    for (const node of powlModel.nodes) {
      adj.set(node.id, []);
    }
    for (const edge of powlModel.edges) {
      if (adj.has(edge.from)) {
        adj.get(edge.from).push(edge.to);
      }
    }

    const visited = new Set();
    const stack = new Set();

    function hasCycle(curr) {
      visited.add(curr);
      stack.add(curr);

      for (const neighbor of adj.get(curr) || []) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (stack.has(neighbor)) {
          return true; // Cycle detected
        }
      }

      stack.delete(curr);
      return false;
    }

    for (const node of powlModel.nodes) {
      if (!visited.has(node.id) && hasCycle(node.id)) {
        throw new Error('Refuse: POWL model configuration rejected. Cyclic partial order detected.');
      }
    }
  }
}

/**
 * POWL VKG Hook Implementation
 * Demonstrates the Truex Grammar of Consequence:
 * Substrate, Membrane, Attempt, Admit, Refuse, Receipt.
 */
export function createPowlContext(powlModel) {
  // Validate model before accepting configuration
  validatePowlModel(powlModel);

  const executed = new Set();
  const receipts = [];

  // Helper to find a node by ID or label
  const isNode = (op) => powlModel.nodes.some(n => n.id === op || n.label === op);

  return {
    // Attempt: Evaluate the operation against the POWL rules
    attempt(operation) {
      if (!isNode(operation)) {
        throw new Error(`Refuse: Operation '${operation}' is not defined in the POWL model.`);
      }

      if (executed.has(operation)) {
        throw new Error(`Refuse: Operation '${operation}' has already been executed.`);
      }

      if (powlModel.type === 'partial_order') {
        // Check partial order dependencies
        const incomingEdges = powlModel.edges.filter(e => e.to === operation);
        for (const edge of incomingEdges) {
          if (!executed.has(edge.from)) {
            throw new Error(`Refuse: POWL sequence violation. Cannot execute '${operation}' before '${edge.from}'.`);
          }
        }
      } else if (powlModel.type === 'choice_graph') {
        if (executed.size === 0) {
          if (operation !== powlModel.start) {
            throw new Error(`Refuse: Choice graph must start at '${powlModel.start}'. Attempted '${operation}'.`);
          }
        } else {
          const lastExecuted = Array.from(executed).pop();
          const validEdge = powlModel.edges.find(e => e.from === lastExecuted && e.to === operation);
          if (!validEdge) {
            throw new Error(`Refuse: Invalid choice. No POWL edge from '${lastExecuted}' to '${operation}'.`);
          }
        }
      }
      
      // If we reach here, we Admit the operation.
    },
    
    // Receipt: Record the Consequence of the execution
    receipt(operation, status, error) {
      if (status === 'Admitted') {
        executed.add(operation);
      }
      receipts.push({ operation, status, error: error?.message, timestamp: new Date().toISOString() });
    },

    getReceipts() {
      return receipts;
    },

    getExecuted() {
      return Array.from(executed);
    }
  };
}

export function registerPowlInterceptors(proxyInterface, powlContext) {
  proxyInterface.defineGetInterceptor((target, prop, receiver) => {
    const value = Reflect.get(target, prop, receiver);
    
    // We only intercept function calls for this workflow example
    if (typeof value === 'function') {
      return function (...args) {
        const operation = String(prop);
        
        try {
          // 1. Attempt
          powlContext.attempt(operation);
        } catch (error) {
          // 2. Refuse
          powlContext.receipt(operation, 'Refused', error);
          throw error;
        }

        try {
          // 3. Admit / Execute Substrate
          const result = value.apply(this === receiver ? target : this, args);
          
          // 4. Receipt (Success)
          powlContext.receipt(operation, 'Admitted');
          return result;
        } catch (error) {
          // 4. Receipt (Execution Error)
          powlContext.receipt(operation, 'Execution Error', error);
          throw error;
        }
      };
    }
    return undefined; // Let default behavior handle non-functions
  });
}
