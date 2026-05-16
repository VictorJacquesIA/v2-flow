"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProjectDocuments(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadDocumentAction(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const file = formData.get("file") as File;
  const projectId = formData.get("project_id") as string;
  const category = formData.get("category") as string;
  const notes = formData.get("notes") as string | null;

  if (!file || !projectId) throw new Error("Arquivo e projeto são obrigatórios");

  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${user.id}/${projectId}/${timestamp}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("project-documents")
    .upload(filePath, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { error: dbError } = await supabase.from("project_documents").insert([{
    user_id: user.id,
    project_id: projectId,
    file_name: file.name,
    file_path: filePath,
    file_type: file.type,
    file_size: file.size,
    category: category || "outro",
    notes: notes || null,
  }]);

  if (dbError) {
    await supabase.storage.from("project-documents").remove([filePath]);
    throw dbError;
  }

  revalidatePath(`/projetos/${projectId}`);
}

export async function getDownloadUrlAction(filePath: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("project-documents")
    .createSignedUrl(filePath, 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocumentAction(id: string, filePath: string, projectId: string) {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage
    .from("project-documents")
    .remove([filePath]);
  if (storageError) throw storageError;

  const { error: dbError } = await supabase
    .from("project_documents")
    .delete()
    .eq("id", id);
  if (dbError) throw dbError;

  revalidatePath(`/projetos/${projectId}`);
}
