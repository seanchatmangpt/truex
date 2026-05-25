# OTP Supervisor Restart Budget & Poison Quarantine Stress Report

This report lists the breaking point thresholds and behavior under various restart budgets, poison rates, and stress patterns.

## Stress Testing Matrix Results

| Budget | Poison Rate | Scenario | Period (ms) | Crashes In Period | Restart Attempts | Halted At Msg | Expected Halt Crash | Actual Halt Crash | Quarantine Limit | Backpressure Refusals | Sibling Survival % | Refusal % |
|--------|-------------|----------|-------------|-------------------|------------------|---------------|---------------------|-------------------|------------------|-----------------------|--------------------|-----------|
| 0 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 10.000% | one crashing process | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 10.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 10.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 10.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 100.000% | one crashing process | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 100.00% | 100.00% |
| 0 | 100.000% | many crashing processes | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 0.00% | 100.00% |
| 0 | 100.000% | crashing sibling among stable siblings | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 100.00% | 53.33% |
| 0 | 100.000% | cascading supervisor restart storms | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 0.00% | 100.00% |
| 2 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 10.000% | one crashing process | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 10.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 10.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 10.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 100.000% | one crashing process | 10000000 | 3 | 2 | 3 | 3 | 3 | None | 0 | 100.00% | 100.00% |
| 2 | 100.000% | many crashing processes | 10000000 | 3 | 2 | 11 | 3 | 3 | None | 0 | 0.00% | 100.00% |
| 2 | 100.000% | crashing sibling among stable siblings | 10000000 | 3 | 2 | 5 | 3 | 3 | None | 0 | 100.00% | 53.33% |
| 2 | 100.000% | cascading supervisor restart storms | 10000000 | 3 | 2 | 11 | 3 | 3 | None | 0 | 0.00% | 100.00% |
| 10 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 10.000% | one crashing process | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 10.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 10.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 10.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 100.000% | one crashing process | 10000000 | 11 | 10 | 11 | 11 | 11 | None | 0 | 100.00% | 100.00% |
| 10 | 100.000% | many crashing processes | 10000000 | 3 | 3 | N/A | 11 | N/A | None | 0 | 100.00% | 100.00% |
| 10 | 100.000% | crashing sibling among stable siblings | 10000000 | 8 | 8 | N/A | 11 | N/A | None | 0 | 100.00% | 53.33% |
| 10 | 100.000% | cascading supervisor restart storms | 10000000 | 3 | 3 | N/A | 11 | N/A | None | 0 | 100.00% | 100.00% |
