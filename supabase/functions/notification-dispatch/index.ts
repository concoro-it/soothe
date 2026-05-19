import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/json.ts";
import { adminClient } from "../_shared/supabase.ts";

const cronSecret = Deno.env.get("SOOTHE_CRON_SECRET");

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    if (!cronSecret) {
      return jsonResponse({ error: "Missing SOOTHE_CRON_SECRET" }, 500);
    }

    const provided = request.headers.get("x-soothe-cron-secret");
    if (provided !== cronSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const nowIso = new Date().toISOString();

    const { data: jobs } = await adminClient
      .from("notification_jobs")
      .select("id,family_id,user_id,job_type,payload_jsonb")
      .eq("status", "scheduled")
      .lte("scheduled_for", nowIso)
      .limit(100);

    if (!jobs || jobs.length === 0) {
      return jsonResponse({ ok: true, dispatched: 0 });
    }

    for (const job of jobs) {
      await adminClient.from("notification_jobs").update({ status: "processing" }).eq("id", job.id);

      const { data: tokens } = await adminClient
        .from("device_tokens")
        .select("expo_push_token")
        .eq("family_id", job.family_id)
        .eq("user_id", job.user_id)
        .is("revoked_at", null);

      if (!tokens || tokens.length === 0) {
        await adminClient
          .from("notification_jobs")
          .update({ status: "failed", error_message: "No active device tokens" })
          .eq("id", job.id);
        continue;
      }

      // Placeholder: dispatch to Expo push endpoint in next iteration.
      await adminClient
        .from("notification_jobs")
        .update({ status: "sent", sent_at: new Date().toISOString(), error_message: null })
        .eq("id", job.id);
    }

    return jsonResponse({ ok: true, dispatched: jobs.length });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});
