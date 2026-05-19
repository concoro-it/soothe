# Edge Function Contracts

## `start-extraction`

Request:
```json
{
  "family_id": "uuid",
  "content_item_id": "uuid"
}
```

Response:
```json
{
  "extraction_run_id": "uuid",
  "status": "running"
}
```

## `ingest-extraction-result`

Auth: `x-soothe-callback-secret`

Request payload contract is under:
- `services/n8n/payload-contracts/ingest-extraction-result.payload.json`

## `confirm-extracted-items`

Request:
```json
{
  "family_id": "uuid",
  "extraction_run_id": "uuid",
  "decisions": [
    {
      "extracted_item_id": "uuid",
      "action": "accept",
      "edited_payload": {}
    }
  ]
}
```

## `family-search`

Request:
```json
{
  "family_id": "uuid",
  "query": "What was the nanny's salary?",
  "query_embedding": [0.123, 0.456]
}
```

Response:
```json
{
  "answer": "Found family-scoped sources...",
  "confidence": 0.72,
  "structured": {
    "tasks": [],
    "events": [],
    "payments": [],
    "documents": []
  },
  "semantic": [],
  "requires_clarification": false
}
```

## `notification-dispatch`

Auth: `x-soothe-cron-secret`

Behavior: sends scheduled notifications (currently scaffolds dispatch and marks sent/failed status).
