---
name: Partial prediction scoring RPC behavior
description: Live score_prediction behavior for historical predictions with missing qualifying time entries.
---

The live scoring RPC cannot evaluate a prediction that lacks a `QUALIFYING_TIME` entry when the GP has complete official results: it attempts to persist `qualifying_points` as NULL and the database rejects the row with `23502`. Complete predictions still score normally through the same RPC.

**Why:** Historical rows intentionally preserve missing cells, and the current task forbids changing the scoring function, schema, or imported entries.

**How to apply:** Keep these predictions explicitly unscored and report them; do not fill or alter their entries. Revisit only in a separately approved scoring/RPC maintenance task.

Eligibility must be recomputed after official results are imported. A prediction can move from “not evaluable because results are missing” to “RPC-blocked because `QUALIFYING_TIME` is missing” without any change to the prediction itself.

**Why:** Result coverage is independent from prediction completeness, so an audit made before a results import can undercount the partial predictions that the live RPC will reject.

**How to apply:** Run the read-only audit again after each results import and classify blocked rows by prediction ID before any scoring apply.