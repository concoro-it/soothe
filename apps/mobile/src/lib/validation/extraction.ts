import { z } from "zod";

export const extractionCandidateSchema = z.object({
  id: z.string().uuid(),
  candidate_type: z.enum([
    "summary",
    "task",
    "event",
    "payment",
    "document",
    "date",
    "amount",
    "link_child"
  ]),
  payload_jsonb: z.record(z.any()),
  confidence: z.number().min(0).max(1)
});

export type ExtractionCandidate = z.infer<typeof extractionCandidateSchema>;
