"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { TaskStatus, TaskPriority, ChecklistItem } from "@/types";

export async function getTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, clients(id, name), projects(id, name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getTasksByClient(clientId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*, projects(id, name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createTaskAction(formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    client_id: formData.get("client_id") as string || null,
    project_id: formData.get("project_id") as string || null,
    priority: (formData.get("priority") as TaskPriority) || "media",
    status: (formData.get("status") as TaskStatus) || "pendente",
    deadline: formData.get("deadline") as string || null,
    checklist: [] as ChecklistItem[],
  };

  const { error } = await supabase.from("tasks").insert([payload]);
  if (error) throw error;
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function updateTaskAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const payload = {
    title: formData.get("title") as string,
    description: formData.get("description") as string || null,
    client_id: formData.get("client_id") as string || null,
    project_id: formData.get("project_id") as string || null,
    priority: formData.get("priority") as TaskPriority,
    status: formData.get("status") as TaskStatus,
    deadline: formData.get("deadline") as string || null,
  };

  const { error } = await supabase.from("tasks").update(payload).eq("id", id);
  if (error) throw error;
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function updateTaskStatusAction(id: string, status: TaskStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) throw error;
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/tarefas");
  revalidatePath("/dashboard");
}
