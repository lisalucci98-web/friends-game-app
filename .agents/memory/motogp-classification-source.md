---
name: MotoGP classification source
description: Outcome of the public MotoGP API classification endpoint research.
---

The public `motogp/v1` API exposes session metadata and the official classification PDF URL, but no verified JSON endpoint for a single session's race classification. The verified `/results/standings` endpoint returns a season leaderboard, even when supplied with an event UUID; it must not be treated as race results.

**Why:** A targeted probe of plausible classification/session/result routes returned HTTP 400, while the official `session_files.classification.url` PDF downloaded successfully and `pdftotext -layout` extracted position, points, rider number/name, team, motorcycle, total time, gap, and non-classified riders.

**How to apply:** Use a server-side PDF parsing pipeline for historical session classifications. Keep it defensive: retain the source PDF URL, distinguish classified from “Not classified” rows, and do not substitute season standings for a GP result.