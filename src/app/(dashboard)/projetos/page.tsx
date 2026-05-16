import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { Plus, Calendar, DollarSign, User } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "purple" }> = {
  lead: { label: "Lead", variant: "secondary" },
  proposta_enviada: { label: "Proposta Enviada", variant: "info" },
  fechado: { label: "Fechado", variant: "purple" },
  aguardando_conteudo: { label: "Ag. Conteúdo", variant: "warning" },
  em_desenvolvimento: { label: "Em Dev.", variant: "info" },
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

export default async function ProjetosPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(id, name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Projetos"
        description={`${projects?.length ?? 0} projetos cadastrados`}
        action={
          <ProjectDialog>
            <Button size="sm"><Plus className="h-4 w-4" />Novo Projeto</Button>
          </ProjectDialog>
        }
      />

      <div className="p-6">
        {!projects?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-4">Nenhum projeto cadastrado</p>
            <ProjectDialog>
              <Button size="sm"><Plus className="h-4 w-4" />Novo Projeto</Button>
            </ProjectDialog>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => {
              const sc = statusConfig[project.status] ?? { label: project.status, variant: "secondary" as const };
              const pc = priorityConfig[project.priority] ?? priorityConfig.media;
              return (
                <Card key={project.id} className="hover:border-border/60 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link href={`/projetos/${project.id}`} className="font-semibold hover:underline">
                            {project.name}
                          </Link>
                          <Badge variant={sc.variant} className="text-xs">{sc.label}</Badge>
                          <Badge variant={pc.variant} className="text-xs">{pc.label}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {(project.clients as { name: string } | null)?.name ?? "—"}
                          </span>
                          {project.service_type && <span>{project.service_type}</span>}
                          {project.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDate(project.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {project.value && (
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatCurrency(project.value)}
                          </span>
                        )}
                        {project.progress > 0 && (
                          <div className="hidden sm:flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                          </div>
                        )}
                        <ProjectDialog project={project as Parameters<typeof ProjectDialog>[0]["project"]}>
                          <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                        </ProjectDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
