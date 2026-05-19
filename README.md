# Soothe MVP

Soothe is an AI-first family operations app for busy parents.

This repository contains:
- `apps/mobile`: Expo React Native app (mobile-first UI)
- `supabase`: Postgres schema, RLS policies, and Edge Functions
- `services/n8n`: AI pipeline contracts and workflow templates
- `docs`: Architecture and implementation docs

## MVP Principles

- Multi-tenant family isolation at DB, API, and retrieval layers
- Review-first AI (no silent auto-finalization of critical data)
- Structured + semantic family memory with source-grounded answers
- Pragmatic, maintainable architecture for a small startup team
