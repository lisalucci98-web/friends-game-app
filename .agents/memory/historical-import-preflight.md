---
name: Historical import preflight
description: Required identity, roster, and entry-integrity checks before a historical import writes data.
---

Existing predictions must be classified before any historical import using both the deterministic import ID and the natural key `(user, grand prix, league)`. A matching GP alone is not evidence that the existing prediction came from Google Sheets.

**Why:** A user can already have a normal prediction for the same GP without an import marker; treating it as historical or overwriting it risks data loss and duplicate history.

**How to apply:** Preserve non-deterministic existing predictions, skip deterministic historical IDs, and create only missing authorized records after season/date/session checks. Confirm idempotence with before/after counts and duplicate-key checks.

An idempotent rerun invoked in import mode is still a no-op when no new prediction or entry rows are prepared; report database modification from prepared rows, not from the CLI mode alone.

**Why:** Treating every import-mode invocation as a write makes a successful idempotency check look like an additional mutation.

**How to apply:** Calculate the write flag from the pending prediction and entry batches, then verify the target counts are unchanged on the rerun.

Before importing official session results, compare every official rider identifier with the
project roster. A verified substitute or wildcard may need an inactive roster record before
the result batch can satisfy its foreign keys.

**Why:** A complete official classification can contain a rider absent from the season roster;
discovering that during the result insert aborts the entire batch.

**How to apply:** Validate full rider-ID coverage during preflight. Add only a rider verified
against the official classification/profile, otherwise block the import before any write.

A prediction cannot contain the same rider twice within one prediction type, even in different
positions. Require a corrected rider or exclude that prediction from the apply.

**Why:** The database enforces uniqueness on prediction, type, and rider; a duplicate in a
single batch rejects all entries for that batch.

**How to apply:** Detect duplicate riders separately in Sprint and Race before creating any
records. Never silently replace, remove, or merge a user-confirmed duplicate.