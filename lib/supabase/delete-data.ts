import { createClient } from "./client";

export type DeleteCloudDataResult =
  | { status: "not_configured" }
  | { status: "signed_out" }
  | { status: "deleted"; deletedSessions: number; deletedEvents: number; deletedProfiles: number }
  | { status: "error"; message: string };

type DeletionCounts = { deleted_sessions?: unknown; deleted_events?: unknown; deleted_profiles?: unknown };

export async function deleteCloudLearningData(): Promise<DeleteCloudDataResult> {
  const supabase = createClient();
  if (!supabase) return { status: "not_configured" };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return { status: "error", message: userError.message };
  if (!user) return { status: "signed_out" };
  const { data, error } = await supabase.rpc("delete_my_learning_data");
  if (error) return { status: "error", message: error.message };
  const counts = (data ?? {}) as DeletionCounts;
  return {
    status: "deleted",
    deletedSessions: safeCount(counts.deleted_sessions),
    deletedEvents: safeCount(counts.deleted_events),
    deletedProfiles: safeCount(counts.deleted_profiles),
  };
}

export function safeCount(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}
