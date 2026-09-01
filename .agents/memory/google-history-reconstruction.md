---
name: Google history reconstruction
description: Rules for separating duplicated Sheets summaries from genuine participant submissions during historical reconstruction.
---

When reconstructing historical predictions across multiple Google workbooks, treat repeated aggregate summaries as source copies rather than participant submissions. Coalesce identical aggregate values, preserve every source, and flag differing aggregate values as `AGGREGATE_CONFLICT`; only repeated participant session rows are `MULTIPLE SUBMISSIONS`.

**Why:** Per-GP workbooks, global classification tabs, and unnamed summary sheets can repeat the same historical row. Counting those copies as submissions creates false duplicate alerts and can cause an unsafe automatic choice.

**How to apply:** Group participant rows by GP and session, never select a row when more than one exists, and select an aggregate representative only when all populated aggregate values are identical. Keep uncertain app/database matching as `REVIEW`.