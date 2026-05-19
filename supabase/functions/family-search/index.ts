import { corsHeaders } from "../_shared/cors.ts";
import { jsonResponse } from "../_shared/json.ts";
import { adminClient, assertFamilyMembership, getUserIdFromAuthHeader } from "../_shared/supabase.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    await getUserIdFromAuthHeader(request.headers.get("Authorization"));
    const body = await request.json();
    const familyId = body.family_id as string;
    const query = String(body.query ?? "").trim();
    const queryEmbedding = body.query_embedding as number[] | undefined;

    if (!familyId || !query) {
      return jsonResponse({ error: "family_id and query are required" }, 400);
    }

    const userId = await getUserIdFromAuthHeader(request.headers.get("Authorization"));
    await assertFamilyMembership(familyId, userId);

    const [tasks, events, payments, documents] = await Promise.all([
      adminClient.from("tasks").select("id,title,status,due_at").eq("family_id", familyId).ilike("title", `%${query}%`).limit(3),
      adminClient.from("events").select("id,title,starts_at").eq("family_id", familyId).ilike("title", `%${query}%`).limit(3),
      adminClient.from("payments").select("id,title,status,due_date,amount_minor,currency").eq("family_id", familyId).ilike("title", `%${query}%`).limit(3),
      adminClient.from("documents").select("id,title,category,expiry_date").eq("family_id", familyId).ilike("title", `%${query}%`).limit(3)
    ]);

    let semantic: unknown[] = [];

    if (queryEmbedding && queryEmbedding.length === 1536) {
      const vectorLiteral = `[${queryEmbedding.join(",")}]`;
      const { data } = await adminClient.rpc("search_memory_nodes", {
        p_family_id: familyId,
        p_query_embedding: vectorLiteral,
        p_limit: 8,
        p_similarity_threshold: 0.2
      });

      semantic = data ?? [];
    }

    const structured = {
      tasks: tasks.data ?? [],
      events: events.data ?? [],
      payments: payments.data ?? [],
      documents: documents.data ?? []
    };

    const sourceCount =
      structured.tasks.length +
      structured.events.length +
      structured.payments.length +
      structured.documents.length +
      semantic.length;

    const answer =
      sourceCount > 0
        ? `Found ${sourceCount} family-scoped sources. Review the results and source cards below.`
        : "I could not find enough evidence in your family workspace. Try a more specific query.";

    return jsonResponse({
      answer,
      confidence: sourceCount > 0 ? 0.72 : 0.25,
      structured,
      semantic,
      requires_clarification: sourceCount === 0
    });
  } catch (error) {
    return jsonResponse({ error: (error as Error).message }, 400);
  }
});
