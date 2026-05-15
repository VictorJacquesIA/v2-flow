"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProjectAction, updateProjectAction } from "@/app/actions/projects";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProjectFormProps {
  project?: Project;
  clientId?: string;
  onSuccess?: () => void;
}

export function ProjectForm({ project, clientId, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(project?.status ?? "lead");
  const [priority, setPriority] = useState(project?.priority ?? "media");
  const [selectedClientId, setSelectedClientId] = useState(project?.client_id ?? clientId ?? "");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (!clientId) {
      createClient().from("clients").select("id, name").order("name").then(({ data }) => {
        if (data) setClients(data);
      });
    }
  }, [clientId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("status", status);
      formData.set("priority", priority);
      formData.set("client_id", selectedClientId);

      if (project) {
        await updateProjectAction(project.id, formData);
        toast({ title: "Projeto atualizado" });
      } else {
        await createProjectAction(formData);
        toast({ title: "Projeto criado" });
      }
      onSuccess?.();
      router.refresh();
    } catch {
      toast({ title: "Erro ao salvar projeto", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!clientId && (
        <div className="space-y-2">
          <Label>Cliente *</Label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
            <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
            <SelectContent>
              {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="name">Nome do Projeto *</Label>
          <Input id="name" name="name" defaultValue={project?.name} required />
        </div>
        <div className="space-y-2 col-span-2 sm:col-span-1">
          <Label htmlFor="service_type">Tipo de Serviço</Label>
          <Input id="service_type" name="service_type" defaultValue={project?.service_type ?? ""} placeholder="Ex: Landing Page" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
              <SelectItem value="fechado">Fechado</SelectItem>
              <SelectItem value="aguardando_conteudo">Aguardando Conteúdo</SelectItem>
              <SelectItem value="em_desenvolvimento">Em Desenvolvimento</SelectItem>
              <SelectItem value="em_revisao">Em Revisão</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Data de Início</Label>
          <Input id="start_date" name="start_date" type="date" defaultValue={project?.start_date ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Prazo de Entrega</Label>
          <Input id="deadline" name="deadline" type="date" defaultValue={project?.deadline ?? ""} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">Valor (R$)</Label>
          <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={project?.value ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="progress">Progresso (%)</Label>
          <Input id="progress" name="progress" type="number" min="0" max="100" defaultValue={project?.progress ?? 0} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" name="description" defaultValue={project?.description ?? ""} rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {project ? "Salvar alterações" : "Criar projeto"}
        </Button>
      </div>
    </form>
  );
}
