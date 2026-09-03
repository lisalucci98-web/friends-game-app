---
name: Historical apply source
description: Historical scoring applies must use the persisted Task 38 report as their authorization gate.
---

The persisted Task 38 report is the authorization gate and source of truth for a historical scoring apply; temporary workbook files are supporting evidence only and may disappear between sessions.

**Why:** Workbook paths under `/tmp` are ephemeral, so regenerating a previously approved mapping can fail even when the approved report is still available.

**How to apply:** Validate the report's candidate IDs, statuses, totals, entry points, and malus rows before writing; do not block an authorized apply solely because the temporary source files are gone.