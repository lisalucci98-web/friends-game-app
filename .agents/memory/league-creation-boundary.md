---
name: League creation boundary
description: The required server-side creation path for leagues and their first membership.
---

Create a league only through the `create_league` Supabase RPC, never through frontend inserts into `leagues` or `league_members`.

**Why:** The database function creates both the league and the creator's membership as one operation, preserving the one-step authorization boundary.

**How to apply:** Validate client input before the RPC call, pass the approved name and normalized invite code, then refresh user-scoped memberships after success.