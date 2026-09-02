---
name: Authenticated results verification
description: Durable approach for checking authenticated result pages against server-side values.
---

Authenticated UI checks should use a temporary, isolated test account with explicit cleanup, and compare the rendered values against REST responses made with that account's access token. Never impersonate an existing participant or place credentials in the repository.

**Why:** The preview can prove the anonymous guard but cannot prove RLS-scoped reads, and the result pages must be checked without exposing real users or changing their passwords.

**How to apply:** Pass test credentials through environment variables, inject only the resulting session into an isolated browser context, assert score breakdowns, season totals, league ranking, and official session counts, then remove all temporary records in a `finally` path.