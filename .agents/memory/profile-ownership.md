---
name: Profile ownership model
description: The chosen relationship between Supabase Auth users and application profiles.
---

Use `profiles.user_id` as the authenticated owner rather than replacing the existing profile primary key.

**Why:** The app began with anonymous demo profiles whose existing IDs do not reliably map to future authenticated users. Keeping those IDs avoids a destructive migration.

**How to apply:** During the later RLS migration, scope profile access with `auth.uid() = user_id`; do not infer ownership of legacy rows from their names.