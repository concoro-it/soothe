import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/json.ts";
import { adminClient } from "../_shared/supabase.ts";

type CandidatePayload = {
  candidate_type: "summary" | "task" | "event" | "payment" | "document" | "date" | "amount" | "link_child";
  payload_jsonb: Record<string, unknown>;
  confidence: number;
};

type MemoryNodePayload = {
  child_id?: string | null;
  source_type: "content" | "task" | "event" | "payment" | "document";
  source_id: string;
  text_for_search: string;
  metadata_jsonb?: Record<string, unknown>;
};

const callbackSecret = Deno.env.get("N8N_CALLBACK_SECRET");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (!callbackSecret) {
      return jsonResponse({ error: "Missing callback secret config" }, 500);
    }

    const providedSecret = request.headers.get("x-soothe-callback-secret");
    if (providedSecret !== callbackSecret) {
      return jsonResponse({ error: "Unauthorized callback" }, 401);
    }

    const body = await request.json();
    const runId = body.run_id as string;
    const idempotencyKey = body.idempotency_key as string;
    const status = body.status as "succeeded" | "failed" | "retryable";
    const errorCode = body.error_code as string | undefined;
    const errorMessage = body.error_message as string | undefined;
    const candidates = (body.candidates ?? []) as CandidatePayload[];
    const memoryNodes = (body.memory_nodes ?? []) as MemoryNodePayload[];

    if (!runId || !idempotencyKey || !status) {
      return jsonResponse({ error: "run_id, idempotency_key and status are required" }, 400);
    }

    const { data: run, error: runError } = await adminClient
      .from("extraction_runs")
      .select("id, family_id, content_item_id, idempotency_key")
      .eq("id", runId)
      .single();

    if (runError || !run) {
      return jsonResponse({ error: "Extraction run not found" }, 404);
    }

    if (run.idempotency_key && run.idempotency_key === idempotencyKey) {
      return jsonResponse({ ok: true, duplicate: true });
    }

    const now = new Date().toISOString();

    await adminClient
      .from("extraction_runs")
      .update({
        status,
        idempotency_key: idempotencyKey,
        finished_at: now,
        error_code: errorCode ?? null,
        error_message: errorMessage ?? null,
        attempts: status === "retryable" ? 1 : 0
      })
      .eq("id", run.id);

    if (status === "succeeded") {
      await adminClient.from("extracted_items").delete().eq("extraction_run_id", run.id);

      if (candidates.length > 0) {
        await adminClient.from("extracted_items").insert(
          candidates.map((candidate) => ({
            family_id: run.family_id,
            extraction_run_id: run.id,
            candidate_type: candidate.candidate_type,
            payload_jsonb: candidate.payload_jsonb,
            confidence: candidate.confidence,
            review_status: "pending"
          }))
        );
      }

      if (memoryNodes.length > 0) {
        await adminClient.from("memory_nodes").insert(
          memoryNodes.map((node) => ({
            family_id: run.family_id,
            child_id: node.child_id ?? null,
            source_type: node.source_type,
            source_id: node.source_id,
            text_for_search: node.text_for_search,
            metadata_jsonb: node.metadata_jsonb ?? {},
            created_by_pipeline: "ingestion"
          }))
        );
      }

      await adminClient
        .from("content_items")
        .update({ status: "review_ready" })
        .eq("id", run.content_item_id)
        .eq("family_id", run.family_id);
    } else {
      await adminClient
        .from("content_items")
        .update({ status: "failed" })
        .eq("id", run.content_item_id)
        .eq("family_id", run.family_id);
    }

    return jsonResponse({ ok: true, status });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});
