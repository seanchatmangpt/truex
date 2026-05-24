# OTP Supervisor Restart Budget & Poison Quarantine Stress Report

This report lists the breaking point thresholds and behavior under various restart budgets, poison rates, and stress patterns.

## Stress Testing Matrix Results

| Budget | Poison Rate | Scenario | Period (ms) | Crashes In Period | Restart Attempts | Halted At Msg | Expected Halt Crash | Actual Halt Crash | Quarantine Limit | Backpressure Refusals | Sibling Survival % | Refusal % |
|--------|-------------|----------|-------------|-------------------|------------------|---------------|---------------------|-------------------|------------------|-----------------------|--------------------|-----------|
| 0 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 1.000% | one crashing process | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 1.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 1.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 1.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 5.000% | one crashing process | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 5.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 5.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 5.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 25.000% | one crashing process | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 25.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 25.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 25.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 1 | N/A | None | 0 | 100.00% | 0.00% |
| 0 | 50.000% | one crashing process | 10000000 | 1 | 0 | 41 | 1 | 1 | None | 0 | 100.00% | 60.00% |
| 0 | 50.000% | many crashing processes | 10000000 | 1 | 0 | 41 | 1 | 1 | None | 0 | 0.00% | 60.00% |
| 0 | 50.000% | crashing sibling among stable siblings | 10000000 | 1 | 0 | 41 | 1 | 1 | None | 0 | 100.00% | 30.00% |
| 0 | 50.000% | cascading supervisor restart storms | 10000000 | 1 | 0 | 41 | 1 | 1 | None | 0 | 0.00% | 60.00% |
| 0 | 100.000% | one crashing process | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 100.00% | 100.00% |
| 0 | 100.000% | many crashing processes | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 0.00% | 100.00% |
| 0 | 100.000% | crashing sibling among stable siblings | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 100.00% | 50.00% |
| 0 | 100.000% | cascading supervisor restart storms | 10000000 | 1 | 0 | 1 | 1 | 1 | None | 0 | 0.00% | 100.00% |
| 1 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 1.000% | one crashing process | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 1.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 1.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 1.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 5.000% | one crashing process | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 5.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 5.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 5.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 25.000% | one crashing process | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 25.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 25.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 25.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 2 | N/A | None | 0 | 100.00% | 0.00% |
| 1 | 50.000% | one crashing process | 10000000 | 2 | 1 | 42 | 2 | 2 | None | 0 | 100.00% | 60.00% |
| 1 | 50.000% | many crashing processes | 10000000 | 2 | 1 | 46 | 2 | 2 | None | 0 | 0.00% | 60.00% |
| 1 | 50.000% | crashing sibling among stable siblings | 10000000 | 2 | 1 | 43 | 2 | 2 | None | 0 | 100.00% | 30.00% |
| 1 | 50.000% | cascading supervisor restart storms | 10000000 | 2 | 1 | 46 | 2 | 2 | None | 0 | 0.00% | 60.00% |
| 1 | 100.000% | one crashing process | 10000000 | 2 | 1 | 2 | 2 | 2 | None | 0 | 100.00% | 100.00% |
| 1 | 100.000% | many crashing processes | 10000000 | 2 | 1 | 6 | 2 | 2 | None | 0 | 0.00% | 100.00% |
| 1 | 100.000% | crashing sibling among stable siblings | 10000000 | 2 | 1 | 3 | 2 | 2 | None | 0 | 100.00% | 50.00% |
| 1 | 100.000% | cascading supervisor restart storms | 10000000 | 2 | 1 | 6 | 2 | 2 | None | 0 | 0.00% | 100.00% |
| 2 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 1.000% | one crashing process | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 1.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 1.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 1.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 5.000% | one crashing process | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 5.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 5.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 5.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 25.000% | one crashing process | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 25.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 25.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 25.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 3 | N/A | None | 0 | 100.00% | 0.00% |
| 2 | 50.000% | one crashing process | 10000000 | 3 | 2 | 43 | 3 | 3 | None | 0 | 100.00% | 60.00% |
| 2 | 50.000% | many crashing processes | 10000000 | 3 | 2 | 51 | 3 | 3 | None | 0 | 0.00% | 60.00% |
| 2 | 50.000% | crashing sibling among stable siblings | 10000000 | 3 | 2 | 45 | 3 | 3 | None | 0 | 100.00% | 30.00% |
| 2 | 50.000% | cascading supervisor restart storms | 10000000 | 3 | 2 | 51 | 3 | 3 | None | 0 | 0.00% | 60.00% |
| 2 | 100.000% | one crashing process | 10000000 | 3 | 2 | 3 | 3 | 3 | None | 0 | 100.00% | 100.00% |
| 2 | 100.000% | many crashing processes | 10000000 | 3 | 2 | 11 | 3 | 3 | None | 0 | 0.00% | 100.00% |
| 2 | 100.000% | crashing sibling among stable siblings | 10000000 | 3 | 2 | 5 | 3 | 3 | None | 0 | 100.00% | 50.00% |
| 2 | 100.000% | cascading supervisor restart storms | 10000000 | 3 | 2 | 11 | 3 | 3 | None | 0 | 0.00% | 100.00% |
| 5 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 1.000% | one crashing process | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 1.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 1.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 1.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 5.000% | one crashing process | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 5.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 5.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 5.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 25.000% | one crashing process | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 25.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 25.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 25.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 6 | N/A | None | 0 | 100.00% | 0.00% |
| 5 | 50.000% | one crashing process | 10000000 | 6 | 5 | 46 | 6 | 6 | None | 0 | 100.00% | 60.00% |
| 5 | 50.000% | many crashing processes | 10000000 | 6 | 5 | 66 | 6 | 6 | None | 0 | 0.00% | 60.00% |
| 5 | 50.000% | crashing sibling among stable siblings | 10000000 | 6 | 5 | 51 | 6 | 6 | None | 0 | 100.00% | 30.00% |
| 5 | 50.000% | cascading supervisor restart storms | 10000000 | 6 | 5 | 66 | 6 | 6 | None | 0 | 0.00% | 60.00% |
| 5 | 100.000% | one crashing process | 10000000 | 6 | 5 | 6 | 6 | 6 | None | 0 | 100.00% | 100.00% |
| 5 | 100.000% | many crashing processes | 10000000 | 6 | 5 | 26 | 6 | 6 | None | 0 | 0.00% | 100.00% |
| 5 | 100.000% | crashing sibling among stable siblings | 10000000 | 6 | 5 | 11 | 6 | 6 | None | 0 | 100.00% | 50.00% |
| 5 | 100.000% | cascading supervisor restart storms | 10000000 | 6 | 5 | 26 | 6 | 6 | None | 0 | 0.00% | 100.00% |
| 10 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 1.000% | one crashing process | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 1.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 1.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 1.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 5.000% | one crashing process | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 5.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 5.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 5.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 25.000% | one crashing process | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 25.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 25.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 25.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 11 | N/A | None | 0 | 100.00% | 0.00% |
| 10 | 50.000% | one crashing process | 10000000 | 11 | 10 | 51 | 11 | 11 | None | 0 | 100.00% | 60.00% |
| 10 | 50.000% | many crashing processes | 10000000 | 11 | 10 | 91 | 11 | 11 | None | 0 | 0.00% | 60.00% |
| 10 | 50.000% | crashing sibling among stable siblings | 10000000 | 11 | 10 | 61 | 11 | 11 | None | 0 | 100.00% | 30.00% |
| 10 | 50.000% | cascading supervisor restart storms | 10000000 | 11 | 10 | 91 | 11 | 11 | None | 0 | 0.00% | 60.00% |
| 10 | 100.000% | one crashing process | 10000000 | 11 | 10 | 11 | 11 | 11 | None | 0 | 100.00% | 100.00% |
| 10 | 100.000% | many crashing processes | 10000000 | 11 | 10 | 51 | 11 | 11 | None | 0 | 0.00% | 100.00% |
| 10 | 100.000% | crashing sibling among stable siblings | 10000000 | 11 | 10 | 21 | 11 | 11 | None | 0 | 100.00% | 50.00% |
| 10 | 100.000% | cascading supervisor restart storms | 10000000 | 11 | 10 | 51 | 11 | 11 | None | 0 | 0.00% | 100.00% |
| 100 | 0.000% | one crashing process | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 0.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 0.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 0.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 1.000% | one crashing process | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 1.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 1.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 1.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 5.000% | one crashing process | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 5.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 5.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 5.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 25.000% | one crashing process | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 25.000% | many crashing processes | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 25.000% | crashing sibling among stable siblings | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 25.000% | cascading supervisor restart storms | 10000000 | 0 | 0 | N/A | 101 | N/A | None | 0 | 100.00% | 0.00% |
| 100 | 50.000% | one crashing process | 10000000 | 60 | 60 | N/A | 101 | N/A | None | 0 | 100.00% | 60.00% |
| 100 | 50.000% | many crashing processes | 10000000 | 12 | 12 | N/A | 101 | N/A | None | 0 | 100.00% | 60.00% |
| 100 | 50.000% | crashing sibling among stable siblings | 10000000 | 30 | 30 | N/A | 101 | N/A | None | 0 | 100.00% | 30.00% |
| 100 | 50.000% | cascading supervisor restart storms | 10000000 | 12 | 12 | N/A | 101 | N/A | None | 0 | 100.00% | 60.00% |
| 100 | 100.000% | one crashing process | 10000000 | 100 | 100 | N/A | 101 | N/A | None | 0 | 100.00% | 100.00% |
| 100 | 100.000% | many crashing processes | 10000000 | 20 | 20 | N/A | 101 | N/A | None | 0 | 100.00% | 100.00% |
| 100 | 100.000% | crashing sibling among stable siblings | 10000000 | 50 | 50 | N/A | 101 | N/A | None | 0 | 100.00% | 50.00% |
| 100 | 100.000% | cascading supervisor restart storms | 10000000 | 20 | 20 | N/A | 101 | N/A | None | 0 | 100.00% | 100.00% |
