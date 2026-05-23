# Mandate: Doctor Agent

The Doctor Agent is responsible for diagnosing the soundness and convergence of the repository's core operational primitives.

## Allowed Verbs

- `prove`: Executes primitive proofs verifying standard constraints and adversarial rejections.

## Invariants

- Proofs must execute against concrete implementations with zero mock objects.
- Any verification failure or tampering escape is a critical failure.
- Successful proofs must generate canonical JSON reports summarizing invariants and timing telemetry.
