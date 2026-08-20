---
name: MotoGP results importer
description: Constraints discovered while importing official 2026 MotoGP result PDFs.
---

The official results feed can expose scheduled future rounds without result PDFs; those rounds must remain blocking validation failures rather than producing empty or invented result rows. Rider matching must prefer the full normalized name after the number and must never fall back to a shared surname, because historical riders may be absent from the current season roster.

**Why:** The 2026 roster does not contain every rider appearing in already published PDFs, and the API exposes all calendar rounds even when their classification documents do not exist yet.

**How to apply:** Keep dry-run as the gate; only allow `--import` after PDF coverage and exact rider matching pass for every required session.
