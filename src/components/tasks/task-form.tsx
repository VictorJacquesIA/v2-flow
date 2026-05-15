"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTaskAction, updateTaskAction } from "@/app/actions/tasks";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskFormProps {
  task?: Task;
  clientId?: string;
  onSuccess?: () => void;
}

export function TaskForm({ task, clientId, onSuccess }: TaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(task?.status ?? "pendente");
  const [priority, setPriority] = useState(task?.priority ?? "media");
  const [selectedClientId, setSelectedClientId] = useState(task?.client_id ?? clientId ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState(task?.project_id ?? "");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("clients").select("id, name").order("name").then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  useEffect(() => {
    if (!selectedClientId) { setProjects([]); return; }
    createClient().from("projects").select("id, name").eq("client_id", selectedClientId).order("name").then(({ data }) => {
      if (data) setProjects(data);
    });
  }, [selectedClientId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("status", status);
      formData.set("priority", priority);
      formData.set("client_id", selectedClientId);
      formData.set("project_id", selectedProjectId);

      if (task) {
        await updateTaskAction(task.id, formData);
        toast({ title: "Tarefa atualizada" });
      } else {
        await createTaskAction(formData);
        toast({ title: "Tarefa criada" });
      }
      onSuccess?.();
      router.refresh();
    } catch {
      toast({ title: "Erro ao salvar tarefa", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input id="title" name="title" defaultValue={task?.title} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Cliente</Label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Projeto</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!selectedClientId}>
            <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="fazendo">Fazendo</SelectItem>
              <SelectItem value="aguardando">Aguardando</SelectItem>
              <SelectItem value="concluida">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deadline">Prazo</Label>
        <Input id="deadline" name="deadline" type="date" defaultValue={task?.deadline ?? ""} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={task?.description ?? ""} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {task ? "Salvar alterações" : "Criar tarefa"}
        </Button>
      </div>
    </form>
  );
}
