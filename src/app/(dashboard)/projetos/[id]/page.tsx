import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { ProjectDocumentsCard } from "@/components/projects/project-documents-card";
import { getProjectDocuments } from "@/app/actions/documents";
import { Edit, Calendar, DollarSign, User, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "purple" }> = {
  lead: { label: "Lead", variant: "secondary" },
  proposta_enviada: { label: "Proposta Enviada", variant: "info" },
  fechado: { label: "Fechado", variant: "purple" },
  aguardando_conteudo: { label: "Aguardando Conteúdo", variant: "warning" },
  em_desenvolvimento: { label: "Em Desenvolvimento", variant: "info" },
  em_revisao: { label: "Em Revisão", variant: "warning" },
  entregue: { label: "Entregue", variant: "success" },
  manutencao: { label: "Manutenção", variant: "secondary" },
};

const priorityConfig: Record<string, { label: string; variant: "destructive" | "warning" | "info" | "secondary" }> = {
  urgente: { label: "Urgente", variant: "destructive" },
  alta: { label: "Alta", variant: "warning" },
  media: { label: "Média", variant: "info" },
  baixa: { label: "Baixa", variant: "secondary" },
};

export default async function ProjetoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: project }, documents] = await Promise.all([
    supabase
      .from("projects")
      .select("*, clients(id, name, company)")
      .eq("id", params.id)
      .single(),
    getProjectDocuments(params.id),
  ]);

  if (!project) notFound();

  const sc = statusConfig[project.status] ?? { label: project.status, variant: "secondary" as const };
  const pc = priorityConfig[project.priority] ?? priorityConfig.media;
  const client = project.clients as { id: string; name: string; company: string | null } | null;

  return (
    <div className="flex flex-col h-full">
      <Header
        title={project.name}
        description={client?.name ?? undefined}
        action={
          <ProjectDialog project={project as Parameters<typeof ProjectDialog>[0]["project"]}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </ProjectDialog>
        }
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Status e badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={sc.variant}>{sc.label}</Badge>
          <Badge variant={pc.variant}>{pc.label}</Badge>
          {project.service_type && (
            <Badge variant="secondary">{project.service_type}</Badge>
          )}
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-3.5 w-3.5" />
                <span className="text-xs">Cliente</span>
              </div>
              {client ? (
                <Link href={`/clientes/${client.id}`} className="text-sm font-semibold hover:underline">
                  {client.name}
                </Link>
              ) : (
                <p className="text-sm font-semibold">—</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-3.5 w-3.5" />
                <span className="text-xs">Prazo</span>
              </div>
              <p className="text-sm font-semibold">{formatDate(project.deadline)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="text-xs">Valor</span>
              </div>
              <p className="text-sm font-semibold">
                {project.value ? formatCurrency(project.value) : "—"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs">Progresso</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${project.progress ?? 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{project.progress ?? 0}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Descrição */}
        {project.description && (
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Descrição</p>
              <p className="text-sm whitespace-pre-wrap">{project.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Documentos */}
        <ProjectDocumentsCard
          projectId={project.id}
          documents={documents ?? []}
        />
      </div>
    </div>
  );
}
