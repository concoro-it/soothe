import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/json.ts";
import { adminClient, assertFamilyMembership, getUserIdFromAuthHeader } from "../_shared/supabase.ts";

const n8nWebhookUrl = Deno.env.get("N8N_EXTRACTION_WEBHOOK_URL");
const callbackSecret = Deno.env.get("N8N_CALLBACK_SECRET");
const edgePublicBaseUrl = Deno.env.get("EDGE_PUBLIC_BASE_URL");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (!n8nWebhookUrl || !callbackSecret || !edgePublicBaseUrl) {
      return jsonResponse({ error: "Missing required environment configuration" }, 500);
    }

    const userId = await getUserIdFromAuthHeader(request.headers.get("Authorization"));
    const body = await request.json();
    const familyId = body.family_id as string;
    const contentItemId = body.content_item_id as string;

    if (!familyId || !contentItemId) {
      return jsonResponse({ error: "family_id and content_item_id are required" }, 400);
    }

    await assertFamilyMembership(familyId, userId);

    const { data: run, error: runError } = await adminClient
      .from("extraction_runs")
      .insert({
        family_id: familyId,
        content_item_id: contentItemId,
        provider: "n8n",
        status: "queued",
        attempts: 0,
        pipeline_version: "v1"
      })
      .select("id")
      .single();

    if (runError || !run) {
      throw new Error(runError?.message ?? "Could not create extraction run");
    }

    await adminClient
      .from("content_items")
      .update({ status: "processing" })
      .eq("id", contentItemId)
      .eq("family_id", familyId);

    const webhookPayload = {
      run_id: run.id,
      family_id: familyId,
      content_item_id: contentItemId,
      requested_by_user_id: userId,
      callback_url: `${edgePublicBaseUrl}/ingest-extraction-result`,
      callback_secret: callbackSecret
    };

    const webhookResponse = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(webhookPayload)
    });

    if (!webhookResponse.ok) {
      await adminClient
        .from("extraction_runs")
        .update({
          status: "retryable",
          attempts: 1,
          error_code: "n8n_webhook_failed",
          error_message: await webhookResponse.text()
        })
        .eq("id", run.id);

      return jsonResponse({ error: "Could not enqueue extraction job" }, 502);
    }

    const payload = await webhookResponse.json().catch(() => ({}));

    await adminClient
      .from("extraction_runs")
      .update({
        status: "running",
        external_job_id: payload.job_id ?? null,
        started_at: new Date().toISOString()
      })
      .eq("id", run.id);

    return jsonResponse({
      extraction_run_id: run.id,
      status: "running"
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});
