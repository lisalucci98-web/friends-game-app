---
name: MotoGP calendar dates
description: Calendar event dates can be inconsistent with official session timestamps in the results API.
---

For FantamotoGP timing and scheduling, treat the timestamp on each session as the authoritative source. Do not assume an event's `date_start` and `date_end` always contain its sessions.

**Why:** In the 2026 results feed, Qatar, Portugal, and Valencia reported event weekends later than several or all linked session timestamps. Importing deadline logic from event metadata alone would create incorrect lock times.

**How to apply:** Retain event dates as calendar metadata, flag any mismatch during ingestion, and calculate session-specific availability, deadlines, and ordering from the session records.