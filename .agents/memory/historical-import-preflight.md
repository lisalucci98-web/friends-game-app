---
name: Historical import preflight
description: How to distinguish prior historical imports from unrelated pre-existing predictions before completing an import.
---

Existing predictions must be classified before any historical import using both the deterministic import ID and the natural key `(user, grand prix, league)`. A matching GP alone is not evidence that the existing prediction came from Google Sheets.

**Why:** A user can already have a normal prediction for the same GP without an import marker; treating it as historical or overwriting it risks data loss and duplicate history.

**How to apply:** Preserve non-deterministic existing predictions, skip deterministic historical IDs, and create only missing authorized records after season/date/session checks. Confirm idempotence with before/after counts and duplicate-key checks.

An idempotent rerun invoked in import mode is still a no-op when no new prediction or entry rows are prepared; report database modification from prepared rows, not from the CLI mode alone.

**Why:** Treating every import-mode invocation as a write makes a successful idempotency check look like an additional mutation.

**How to apply:** Calculate the write flag from the pending prediction and entry batches, then verify the target counts are unchanged on the rerun.