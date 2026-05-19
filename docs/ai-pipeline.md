# AI Pipeline

## Async extraction lifecycle

1. Client uploads content + attachment metadata.
2. Edge function starts extraction run.
3. n8n executes parsing:
   - OCR for image/PDF
   - transcription for voice
   - text normalization
4. n8n extracts typed candidates with confidence.
5. n8n callbacks result with idempotency key.
6. Backend stores candidates and ingestion memory nodes.
7. Parent reviews and confirms edits.
8. Backend creates final objects and confirmation memory nodes.
9. Embedding pipeline updates memory vectors.
10. Family search uses structured + semantic retrieval with strict family filter.

## Failure handling

- `extraction_runs.status` tracks `queued/running/succeeded/failed/retryable`
- callback idempotency via `idempotency_key`
- content status transitions to `failed` on extraction failure
