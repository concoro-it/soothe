# Setup (New Supabase Account)

## 1. Switch project references

Update these placeholders:
- `apps/mobile/.env.example` -> copy to `.env` and set your new project URL/key
- `supabase/functions/.env.example` -> copy to `.env` and set service role + webhook secrets
- `supabase/config.toml` -> set `project_id`

## 2. Run schema

Apply migration:
- `supabase/migrations/20260414160000_initial_schema.sql`

## 3. Deploy functions

Deploy:
- `start-extraction`
- `ingest-extraction-result`
- `confirm-extracted-items`
- `family-search`
- `notification-dispatch`

## 4. Configure n8n

Use payload contracts in `services/n8n/payload-contracts` and point callback to:
- `https://<new-project-ref>.functions.supabase.co/ingest-extraction-result`
