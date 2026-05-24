# Explanation: Operational Field Physics

Traditional software operates under a Newtonian model: there is a single shared database state, and actors read or write to it. Truex discards this model entirely.

In Truex, we implement **Operational Field Physics**. State is not a fixed table; it is a **Virtual Knowledge Graph (VKG)**. Truth is relative to the observer's position, authority, and receipt lineage.

## The Field Primitives

- A **Hook** is a reflex within this field. It is a bounded transformation law.
- A **Receipt** is the memory spine, proving the causality of that transformation.
- The **Observatory** is the sensory cortex, constantly extracting facts to shape the environment.
- The **AGY Bridge** is the motor cortex, actuating changes back into the agent swarm.

## Projection Over Materialization

A traditional Knowledge Graph accumulates state. The Truex VKG accumulates *operational projection capability*.

Because hooks use lazy evaluation (Kanban pull) and bitset filtering, the cost to project reality is $O(HookField + DeltaWindow)$, not $O(MaterializedGraphState)$. This allows Truex to evaluate millions of hooks per second (as proven in the Million Hook Church benchmark) without suffering from traditional database bloat. The application is no longer the system; the application is just one avatar's projection of the operational field.