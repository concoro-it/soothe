# Soothe MVP Architecture

## High-level boundaries

- **Expo mobile app**: capture, review, CRUD, search UI
- **Supabase Postgres**: tenant-safe source of truth
- **Supabase Storage**: private family-scoped file storage
- **Supabase Edge Functions**: trusted orchestration and retrieval gateway
- **n8n**: async AI extraction workflow

## Family tenancy invariant

Every family-owned table has `family_id`; RLS enforces active membership. Edge Functions always verify membership before privileged actions.

## Core execution path

1. Parent uploads content to Inbox.
2. `start-extraction` creates run and triggers n8n.
3. n8n processes OCR/transcription/LLM extraction.
4. `ingest-extraction-result` stores candidates and review-ready artifacts.
5. Parent confirms/edits via review UI.
6. `confirm-extracted-items` writes tasks/events/payments/documents and memory nodes.
7. `family-search` combines structured + semantic retrieval and returns grounded sources.
