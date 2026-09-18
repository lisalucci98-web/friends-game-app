---
name: Sprint Top 3 scoring audit
description: Live scoring behavior for Sprint predictions and the required post-scoring check.
---

The live scoring RPC can award a Sprint point to a rider who finished fourth, even though the
Sprint rule only scores riders in the official Top 3. After every San Marino-style scoring
apply, compare each Sprint entry point with the official Top 3 and correct affected aggregates.

**Why:** A live San Marino scoring run awarded one point to Fabio Di Giannantonio at P4 in four
predictions, while the offline scoring specification correctly returned zero.

**How to apply:** Treat the official Top 3 as the only eligible Sprint positions. Audit stored
entry points and `sprint_points`/`total_points` after calling the live RPC; do not rerun the
unfixed RPC after a manual correction.