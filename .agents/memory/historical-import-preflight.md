---
name: Historical import preflight
description: How to distinguish prior historical imports from unrelated pre-existing predictions before completing an import.
---

Existing predictions must be classified before any historical import using both the deterministic import ID and the natural key `(user, grand prix, league)`. A matching GP alone is not evidence that the existing prediction came from Google Sheets.

**Why:** A user can already have a normal prediction for the same GP without an import marker; treating it as historical or overwriting it risks data loss and duplicate history.

**How to apply:** Preserve non-deterministic existing predictions, skip deterministic historical IDs, and create only missing authorized records after season/date/session checks. Confirm idempotence with before/after counts and duplicate-key checks.