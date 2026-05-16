"use server";

import { createClient } from "@/lib/supabase/server";

export type ActivityLog = {
  id: string;
  entity_type: string;
  entity_id: string;
  entity_name: string | null;
  action: string;
  project_id: string | null;
  client_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export async function logActivity(params: {
  entityType: string;
  entityId: string;
  entityName?: string | null;
  action: string;
  projectId?: string | null;
  clientId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    await supabase.from("activity_logs").insert([{
      entity_type: params.entityType,
      entity_id: params.entityId,
      entity_name: params.entityName ?? null,
      action: params.action,
      project_id: params.projectId ?? null,
      client_id: params.clientId ?? null,
      metadata: params.metadata ?? null,
    }]);
  } catch {
    // silently fail — activity logging is non-critical
  }
}

export async function getProjectActivity(projectId: string, limit = 20): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .or(`project_id.eq.${projectId},and(entity_type.eq.project,entity_id.eq.${projectId})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLog[];
}

export async function getClientActivity(clientId: string, limit = 20): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_logs")
    .select("*")
    .or(`client_id.eq.${clientId},and(entity_type.eq.client,entity_id.eq.${clientId})`)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as ActivityLog[];
}
