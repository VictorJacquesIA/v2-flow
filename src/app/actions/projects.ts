"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { ProjectStatus, ProjectPriority } from "@/types";

export async function getProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(id, name, company)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getProjectsByClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createProjectAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_id: formData.get("client_id") as string,
    name: formData.get("name") as string,
    service_type: formData.get("service_type") as string || null,
    status: (formData.get("status") as ProjectStatus) || "lead",
    priority: (formData.get("priority") as ProjectPriority) || "media",
    start_date: formData.get("start_date") as string || null,
    deadline: formData.get("deadline") as string || null,
    value: formData.get("value") ? Number(formData.get("value")) : null,
    progress: Number(formData.get("progress") || 0),
    description: formData.get("description") as string || null,
  };

  const { data, error } = await supabase.from("projects").insert([payload]).select("id").single();
  if (error) throw error;
  await logActivity({ entityType: "project", entityId: data.id, entityName: payload.name, action: "created", projectId: data.id, clientId: payload.client_id || null });
  revalidatePath("/projetos");
  revalidatePath("/dashboard");
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
}

export async function updateProjectAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    client_id: formData.get("client_id") as string,
    name: formData.get("name") as string,
    service_type: formData.get("service_type") as string || null,
    status: formData.get("status") as ProjectStatus,
    priority: formData.get("priority") as ProjectPriority,
    start_date: formData.get("start_date") as string || null,
    deadline: formData.get("deadline") as string || null,
    value: formData.get("value") ? Number(formData.get("value")) : null,
    progress: Number(formData.get("progress") || 0),
    description: formData.get("description") as string || null,
  };

  const { error } = await supabase.from("projects").update(payload).eq("id", id);
  if (error) throw error;
  await logActivity({ entityType: "project", entityId: id, entityName: payload.name, action: "updated", projectId: id, clientId: payload.client_id || null });
  revalidatePath("/projetos");
  revalidatePath(`/projetos/${id}`);
  revalidatePath("/dashboard");
  if (payload.client_id) revalidatePath(`/clientes/${payload.client_id}`);
}

export async function deleteProjectAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/projetos");
  revalidatePath("/dashboard");
}
