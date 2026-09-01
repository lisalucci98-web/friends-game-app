---
name: Prediction UI schema mismatch
description: The live predictions schema stores pole and OUT in prediction_entries while the results UI selects missing prediction columns.
---

The live `predictions` table does not expose `qualifying_pole_rider_id` or `race_out_rider_id`; pole and OUT are represented by `POLE` and `RACE_OUT` rows in `prediction_entries`. Results and existing-prediction loaders must use that entry-level source.

**Why:** Selecting either missing column from `predictions` causes a 400 before otherwise valid historical scores can render. The submit-prediction RPC still accepts the normal pole and OUT inputs, so this is a read-model contract rather than a write-model problem.

**How to apply:** Derive both display values from entries and resolve rider names from `riders`; keep the existing RPC and historical rows unchanged. A schema migration is unnecessary for the display path and must not be introduced just to mirror the UI.