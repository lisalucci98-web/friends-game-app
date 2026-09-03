---
name: League member visibility
description: The safe read path for showing every participant in an authenticated league.
---

Use the existing authenticated league-members RPC as the source of all participant identities. A direct `league_members` read can be restricted by RLS to only `auth.uid()`, even after the user has been confirmed as a league member.

**Why:** The league page must authorize the current user without accidentally reducing the visible participant set to that user; the direct table query was observed returning a single member while the RPC returned the full league.

**How to apply:** Check membership with the current user's `league_id`/`user_id` query, then load all participant `user_id` values through the authorized RPC. Join prediction rows by `predictions.user_id` and `predictions.grand_prix_id`, never by current user alone.