# Schema Overview

The baseline schema is implemented in:
- `supabase/migrations/20260414160000_initial_schema.sql`

## Data groups

- **Identity and tenancy**: `profiles`, `families`, `family_members`, `invitations`, `children`
- **Inbox and extraction**: `content_items`, `content_attachments`, `extraction_runs`, `extracted_items`
- **Confirmed family ops**: `tasks`, `events`, `payments`, `documents`
- **Family memory**: `memory_nodes`, `memory_embeddings`
- **Notifications**: `notification_preferences`, `device_tokens`, `notification_jobs`

## Security strategy

- RLS on all family-owned tables
- Membership helper functions under `private` schema
- Admin role checks (`owner` and `parent`) for write-sensitive tables
- No client-side direct vector querying in mobile app
