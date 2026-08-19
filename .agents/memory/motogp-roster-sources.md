---
name: MotoGP roster sources
description: Verified public MotoGP API endpoints and identifiers for rider and team profiles.
---

Use the content API for roster data: rider list/detail and team list/detail expose the usable profiles. Team requests require `seasonYear` and the MotoGP UUID from the content categories endpoint; this is distinct from the UUID returned by the results categories endpoint. Rider list filtering should not be trusted: the response contains multiple categories, so filter the current career step client- or server-side by category after retrieval.

**Why:** The result-service category UUID is rejected by the team endpoint, while the content category UUID succeeds. The riders endpoint returned a multi-category roster despite season/category query parameters.

**How to apply:** Resolve the content category first, query the team list with `seasonYear`, and retain rider/team IDs for their respective detail calls. Derive constructor identity from the nested team data; no separate verified public constructors endpoint exists.