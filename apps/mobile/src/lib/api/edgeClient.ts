import Constants from "expo-constants";
import { supabase } from "@/lib/supabase/client";

type EdgeResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: string;
};

const extras = Constants.expoConfig?.extra ?? {};
const edgeBaseUrl =
  process.env.EXPO_PUBLIC_EDGE_BASE_URL ??
  (typeof extras.edgeBaseUrl === "string" ? extras.edgeBaseUrl : "");

export async function callEdge<T>(
  functionName: string,
  body: Record<string, unknown>
): Promise<EdgeResponse<T>> {
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { data: null, error: "No authenticated session" };
  }

  if (!edgeBaseUrl) {
    return { data: null, error: "Missing edge base URL" };
  }

  const response = await fetch(`${edgeBaseUrl}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const message = await response.text();
    return { data: null, error: message || "Edge function request failed" };
  }

  return { data: (await response.json()) as T, error: null };
}
