---
name: PostgREST read-filter syntax
description: REST audit queries must use explicit PostgREST operators for scalar filters.
---

Read-only queries against the project REST endpoint require scalar filters in
PostgREST form, such as `year=eq.2026` and `invite_code=eq.TEST01`; bare
`year=2026` or `invite_code=TEST01` is rejected as an invalid filter.

**Why:** A live audit initially failed at request parsing even though the
underlying endpoint and data were available. Local scorer tests cannot detect
this REST grammar error.

**How to apply:** Use explicit operators for every scalar REST filter in
analysis scripts, and include at least one live query check when validating a
new read-only data path.