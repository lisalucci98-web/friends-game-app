---
name: Authenticated results verification
description: Durable approach for checking authenticated result pages against server-side values.
---

Authenticated UI checks should use a temporary, isolated test account with explicit cleanup, and compare the rendered values against REST responses made with that account's access token. Never impersonate an existing participant or place credentials in the repository.

**Why:** The preview can prove the anonymous guard but cannot prove RLS-scoped reads, and the result pages must be checked without exposing real users or changing their passwords.

**How to apply:** Pass test credentials through environment variables, inject only the resulting session into an isolated browser context, assert score breakdowns, season totals, league ranking, and official session counts, then remove all temporary records in a `finally` path.

Browser-driven checks should normalize rendered text for case and use the native select value setter before dispatching input/change events; CSS text transforms otherwise create false failures.

**Why:** The results UI intentionally uppercases labels with CSS, and React-controlled selects do not reliably update from a plain property assignment in the DevTools protocol.

**How to apply:** Keep DOM assertions semantic and case-insensitive, and treat fully closed historical seasons as valid for closed-detail checks without requiring an open GP there.