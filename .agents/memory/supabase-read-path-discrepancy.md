---
name: Supabase read path discrepancy
description: A connected Supabase proxy can return empty PostgREST arrays while the project’s existing service-role REST path sees the data.
---

When a Supabase connector returns HTTP 200 with empty arrays for known rows, do not conclude that the tables are empty. Compare the connector’s visibility with the project’s already-configured read-only REST path, and keep the distinction explicit in the report.

**Why:** The connector context may use a different credential, RLS visibility, project binding, or account context. An empty 200 response does not identify which of these caused the discrepancy.

**How to apply:** Query a known season ID and a small explicit-column sample, never print credentials, and use only the path that demonstrably exposes the project data for verification. Keep `DATABASE_URL` separate because it points to the workspace database.