---
name: MotoGP results importer
description: Constraints discovered while importing official 2026 MotoGP result PDFs.
---

The official results feed can expose scheduled future rounds without result PDFs; those rounds must remain blocking validation failures rather than producing empty or invented result rows. Rider matching must prefer the full normalized name after the number and must never fall back to a shared surname, because historical riders may be absent from the current season roster.

**Why:** The 2026 roster does not contain every rider appearing in already published PDFs, and the API exposes all calendar rounds even when their classification documents do not exist yet.

**How to apply:** Keep dry-run as the gate; only allow `--import` after PDF coverage and exact rider matching pass for every required session.

When official results are imported for a round that was previously scheduled, the database session statuses may still be `NOT-STARTED`. Before scoring or relying on the results-page closing gate, mark the round's Q sessions, Sprint, and Race sessions `FINISHED` after result verification; preserve the separate Q1/Q2 records even when only Q2 has classification rows.

**Why:** The results upsert and session calendar status are separate data paths, and both the scoring preflight and the UI require closed statuses.

**How to apply:** For a newly completed round, use the importer’s scoped GP mode, verify all result rows, then close only that round’s relevant sessions before running historical scoring.
