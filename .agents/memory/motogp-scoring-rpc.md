---
name: MotoGP scoring RPC
description: Supabase scoring functions and the qualifying tolerance discrepancy found by read-only RPC tests.
---

The Supabase REST catalog exposes `calculate_qualifying_time_points` and `score_prediction`. The qualifying RPC currently returns 10 for an exact time and for +0.010 seconds, but returns 5 for -0.010 seconds against the same actual time.

**Why:** The regulation says the absolute error threshold is inclusive on both sides; the asymmetry must be corrected in the authoritative database function, not hidden by changing tests.

**How to apply:** Keep the read-only scoring test as a regression guard. Do not alter Supabase functions from this repository unless an authorized migration/SQL connection is provided; do not create production predictions to exercise `score_prediction`.