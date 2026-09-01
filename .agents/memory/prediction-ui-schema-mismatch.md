---
name: Prediction UI schema mismatch
description: The live predictions schema stores pole and OUT in prediction_entries while the results UI selects missing prediction columns.
---

The live `predictions` table does not expose `qualifying_pole_rider_id` or `race_out_rider_id`; pole and OUT are represented by `POLE` and `RACE_OUT` rows in `prediction_entries`.

**Why:** Task21Results includes both missing columns in its prediction select, so an authenticated results load can fail with a 400 before it renders otherwise valid historical scores.

**How to apply:** Treat this as a schema/UI contract that must be reconciled before declaring authenticated results verified. Either derive both values from entries in the UI or perform an explicitly approved schema migration; do not auto-correct during read-only verification.