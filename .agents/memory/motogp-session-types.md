---
name: MotoGP session types
description: How the results API represents the second race-like session at the 2026 Catalonia Grand Prix.
---

Preserve the session `type` exactly as returned by the results API and retain its `number` separately. Do not infer or rewrite a type such as `RAC2`.

**Why:** The current 2026 Catalonia feed exposes two sessions whose raw type is `RAC`; the second has `number: 2` and `RAC2` only appears in result-file paths. Converting it would replace source data with a derived label.

**How to apply:** Accept `RAC2` unchanged when an API response actually supplies it, but keep a raw `RAC` with number 2 as `RAC` plus its original number.

For a restarted race, preserve every closed race session. Use the final numbered session for finishing-order positions, but build the official OUT set from the deduplicated union of all race-session results, including `NOT ON RESTART GRID`.

**Why:** Catalonia Part 1 and Part 2 contain different non-classified riders, while Part 2 also repeats riders who never reached the restart grid; selecting one session produces incomplete malus data.

**How to apply:** Pair API and DB sessions by their number, never by result-row count, and pass the full race-session coverage to malus audits and scoring.