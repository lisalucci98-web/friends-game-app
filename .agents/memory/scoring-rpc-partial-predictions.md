---
name: Partial prediction scoring RPC behavior
description: Live score_prediction behavior for historical predictions with missing qualifying time entries.
---

The live scoring RPC cannot evaluate a prediction that lacks a `QUALIFYING_TIME` entry when the GP has complete official results: it attempts to persist `qualifying_points` as NULL and the database rejects the row with `23502`. Complete predictions still score normally through the same RPC.

**Why:** Historical rows intentionally preserve missing cells, and the current task forbids changing the scoring function, schema, or imported entries.

**How to apply:** Keep these predictions explicitly unscored and report them; do not fill or alter their entries. Revisit only in a separately approved scoring/RPC maintenance task.