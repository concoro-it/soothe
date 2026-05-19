import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/json.ts";
import { adminClient, assertFamilyMembership, getUserIdFromAuthHeader } from "../_shared/supabase.ts";

type Decision = {
  extracted_item_id: string;
  action: "accept" | "reject";
  edited_payload?: Record<string, unknown>;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const userId = await getUserIdFromAuthHeader(request.headers.get("Authorization"));
    const body = await request.json();
    const familyId = body.family_id as string;
    const extractionRunId = body.extraction_run_id as string;
    const decisions = (body.decisions ?? []) as Decision[];

    if (!familyId || !extractionRunId || decisions.length === 0) {
      return jsonResponse({ error: "family_id, extraction_run_id and decisions are required" }, 400);
    }

    await assertFamilyMembership(familyId, userId);

    const { data: run, error: runError } = await adminClient
      .from("extraction_runs")
      .select("id, content_item_id")
      .eq("id", extractionRunId)
      .eq("family_id", familyId)
      .single();

    if (runError || !run) {
      return jsonResponse({ error: "Extraction run not found" }, 404);
    }

    const createdObjects: Array<{ source_type: "task" | "event" | "payment" | "document"; source_id: string; text: string }> = [];

    for (const decision of decisions) {
      const { data: item, error: itemError } = await adminClient
        .from("extracted_items")
        .select("id, candidate_type, payload_jsonb")
        .eq("id", decision.extracted_item_id)
        .eq("extraction_run_id", extractionRunId)
        .eq("family_id", familyId)
        .single();

      if (itemError || !item) {
        continue;
      }

      const payload = decision.edited_payload ?? (item.payload_jsonb as Record<string, unknown>);

      if (decision.action === "reject") {
        await adminClient
          .from("extracted_items")
          .update({
            review_status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by_user_id: userId
          })
          .eq("id", item.id);
        continue;
      }

      if (item.candidate_type === "task") {
        const { data: task } = await adminClient
          .from("tasks")
          .insert({
            family_id: familyId,
            title: String(payload.title ?? "Untitled task"),
            description: payload.description ? String(payload.description) : null,
            due_at: payload.due_at ? String(payload.due_at) : null,
            linked_child_id: payload.linked_child_id ? String(payload.linked_child_id) : null,
            source_content_item_id: run.content_item_id,
            source_extracted_item_id: item.id,
            created_by_user_id: userId
          })
          .select("id, title")
          .single();

        if (task) {
          createdObjects.push({ source_type: "task", source_id: task.id, text: `Task: ${task.title}` });
        }
      }

      if (item.candidate_type === "event") {
        const { data: event } = await adminClient
          .from("events")
          .insert({
            family_id: familyId,
            title: String(payload.title ?? "Untitled event"),
            starts_at: String(payload.starts_at ?? new Date().toISOString()),
            ends_at: payload.ends_at ? String(payload.ends_at) : null,
            location: payload.location ? String(payload.location) : null,
            linked_child_id: payload.linked_child_id ? String(payload.linked_child_id) : null,
            source_content_item_id: run.content_item_id,
            source_extracted_item_id: item.id,
            created_by_user_id: userId
          })
          .select("id, title")
          .single();

        if (event) {
          createdObjects.push({ source_type: "event", source_id: event.id, text: `Event: ${event.title}` });
        }
      }

      if (item.candidate_type === "payment") {
        const { data: payment } = await adminClient
          .from("payments")
          .insert({
            family_id: familyId,
            title: String(payload.title ?? "Untitled payment"),
            category: String(payload.category ?? "other"),
            amount_minor: Number(payload.amount_minor ?? 0),
            currency: String(payload.currency ?? "EUR"),
            due_date: String(payload.due_date ?? new Date().toISOString().slice(0, 10)),
            status: payload.status === "paid" ? "paid" : "pending",
            is_recurring: Boolean(payload.is_recurring ?? false),
            recurrence_rule: payload.recurrence_rule ? String(payload.recurrence_rule) : null,
            linked_child_id: payload.linked_child_id ? String(payload.linked_child_id) : null,
            source_content_item_id: run.content_item_id,
            source_extracted_item_id: item.id,
            created_by_user_id: userId
          })
          .select("id, title")
          .single();

        if (payment) {
          createdObjects.push({ source_type: "payment", source_id: payment.id, text: `Payment: ${payment.title}` });
        }
      }

      if (item.candidate_type === "document") {
        const { data: document } = await adminClient
          .from("documents")
          .insert({
            family_id: familyId,
            title: String(payload.title ?? "Untitled document"),
            category: String(payload.category ?? "other"),
            linked_child_id: payload.linked_child_id ? String(payload.linked_child_id) : null,
            expiry_date: payload.expiry_date ? String(payload.expiry_date) : null,
            source_content_item_id: run.content_item_id,
            source_extracted_item_id: item.id,
            created_by_user_id: userId
          })
          .select("id, title")
          .single();

        if (document) {
          createdObjects.push({ source_type: "document", source_id: document.id, text: `Document: ${document.title}` });
        }
      }

      await adminClient
        .from("extracted_items")
        .update({
          review_status: "accepted",
          reviewed_at: new Date().toISOString(),
          reviewed_by_user_id: userId,
          payload_jsonb: payload
        })
        .eq("id", item.id);
    }

    if (createdObjects.length > 0) {
      await adminClient.from("memory_nodes").insert(
        createdObjects.map((item) => ({
          family_id: familyId,
          source_type: item.source_type,
          source_id: item.source_id,
          text_for_search: item.text,
          metadata_jsonb: { confirmed_by_user_id: userId },
          created_by_pipeline: "confirmation"
        }))
      );
    }

    await adminClient
      .from("content_items")
      .update({ status: "confirmed" })
      .eq("id", run.content_item_id)
      .eq("family_id", familyId);

    return jsonResponse({ ok: true, created_count: createdObjects.length });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});
