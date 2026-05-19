# n8n Extraction Workflow (Outline)

1. Receive webhook payload from `start-extraction`.
2. Fetch content record + attachment URL from Supabase.
3. Branch by `input_type`:
   - image/screenshot/pdf -> OCR + text extraction
   - voice -> transcription
   - note -> passthrough raw text
4. Run LLM extraction into typed candidates (`task/event/payment/document/summary`).
5. Produce family-safe memory chunks.
6. POST callback to `ingest-extraction-result` with:
   - `run_id`
   - `idempotency_key`
   - `status`
   - `candidates[]`
   - `memory_nodes[]`
7. Retry callback with exponential backoff on transient failures.
