import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientDialog } from "@/components/clients/client-dialog";
import { ClientDeleteButton } from "@/components/clients/client-delete-button";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { LinkDialog } from "@/components/links/link-dialog";
import { AccessDialog } from "@/components/accesses/access-dialog";
import { ChargeDialog } from "@/components/charges/charge-dialog";
import { RevealPasswordButton } from "@/components/accesses/reveal-password-button";
import {
  Edit, Trash2, Plus, MessageCircle, Mail, Globe,
  ExternalLink, Lock, Calendar, DollarSign
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

const statusConfig = {
  ativo: { label: "Ativo", variant: "success" as const },
  lead: { label: "Lead", variant: "info" as const },
  pausado: { label: "Pausado", variant: "warning" as const },
  inativo: { label: "Inativo", variant: "secondary" as const },
};

const projectStatusLabels: Record<string, string> = {
  lead: "Lead",
  proposta_enviada: "Proposta Enviada",
  fechado: "Fechado",
  aguardando_conteudo: "Ag. Conteúdo",
  em_desenvolvimento: "Em Dev.",
  em_revisao: "Em Revisão",
  entregue: "Entregue",
  manutencao: "Manutenção",
};

const chargeStatusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  pago: { label: "Pago", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  atrasado: { label: "Atrasado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "secondary" },
};

const linkCategoryLabels: Record<string, string> = {
  site: "Site", vercel: "Vercel", analytics: "Analytics", search_console: "Search Console",
  tag_manager: "Tag Manager", clarity: "Clarity", meta_pixel: "Meta Pixel",
  canva: "Canva", drive: "Drive", whatsapp: "WhatsApp", dominio: "Domínio", outro: "Outro",
};

export default async function ClientPage({ params }: { params: { id: string } }) {
  const supabase = await createSupabaseClient();

  const [
    { data: client },
    { data: projects },
    { data: tasks },
    { data: charges },
    { data: links },
    { data: accesses },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", params.id).single(),
    supabase.from("projects").select("*").eq("client_id", params.id).order("created_at", { ascending: false }),
    supabase.from("tasks").select("*, projects(name)").eq("client_id", params.id).order("created_at", { ascending: false }),
    supabase.from("charges").select("*, projects(name)").eq("client_id", params.id).order("due_date", { ascending: false }),
    supabase.from("links").select("*").eq("client_id", params.id).order("created_at", { ascending: false }),
    supabase.from("accesses").select("*").eq("client_id", params.id).order("created_at", { ascending: false }),
  ]);

  if (!client) notFound();

  const statusInfo = statusConfig[client.status as keyof typeof statusConfig] ?? statusConfig.ativo;

  return (
    <div className="flex flex-col h-full">
      <Header
        title={client.name}
        description={client.company || client.niche || undefined}
        action={
          <div className="flex items-center gap-2">
            <ClientDialog client={client}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
                Editar
              </Button>
            </ClientDialog>
            <ClientDeleteButton id={client.id} />
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Info Cards */}
        <div className="flex flex-wrap gap-3">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          {client.email && (
            <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5" />{client.email}
            </a>
          )}
          {client.whatsapp && (
            <a href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="h-3.5 w-3.5" />{client.whatsapp}
            </a>
          )}
          {client.domain && (
            <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Globe className="h-3.5 w-3.5" />{client.domain}
            </a>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="visao-geral">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="projetos">Projetos ({projects?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="tarefas">Tarefas ({tasks?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="acessos">Acessos</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="mt-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{projects?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Projetos</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{tasks?.filter(t => t.status !== "concluida").length ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Tarefas Ativas</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(charges?.filter(c => c.status === "pago").reduce((s, c) => s + c.value, 0) ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total Pago</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(charges?.filter(c => c.status === "pendente").reduce((s, c) => s + c.value, 0) ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-1">A Receber</p>
              </CardContent></Card>
            </div>
            {client.notes && (
              <Card className="mt-4"><CardContent className="p-4">
                <p className="text-sm font-medium mb-2 text-muted-foreground">Observações</p>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* Projetos */}
          <TabsContent value="projetos" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <ProjectDialog clientId={client.id}>
                <Button size="sm"><Plus className="h-4 w-4" />Novo Projeto</Button>
              </ProjectDialog>
            </div>
            {!projects?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum projeto cadastrado</p>
            ) : (
              projects.map((p) => (
                <Card key={p.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-sm text-muted-foreground">{p.service_type || "—"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.deadline && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(p.deadline)}</span>}
                      {p.value && <span className="text-xs font-medium">{formatCurrency(p.value)}</span>}
                      <Badge variant="secondary" className="text-xs">{projectStatusLabels[p.status] ?? p.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Tarefas */}
          <TabsContent value="tarefas" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <TaskDialog clientId={client.id}>
                <Button size="sm"><Plus className="h-4 w-4" />Nova Tarefa</Button>
              </TaskDialog>
            </div>
            {!tasks?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa cadastrada</p>
            ) : (
              tasks.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{(t.projects as { name: string } | null)?.name ?? "Sem projeto"}</p>
                    </div>
                    <Badge variant={t.status === "concluida" ? "success" : t.status === "fazendo" ? "info" : "secondary"} className="text-xs capitalize shrink-0">
                      {t.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Financeiro */}
          <TabsContent value="financeiro" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <ChargeDialog clientId={client.id}>
                <Button size="sm"><Plus className="h-4 w-4" />Nova Cobrança</Button>
              </ChargeDialog>
            </div>
            {!charges?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhuma cobrança cadastrada</p>
            ) : (
              charges.map((c) => {
                const cs = chargeStatusConfig[c.status] ?? chargeStatusConfig.pendente;
                return (
                  <Card key={c.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{c.description}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />Vence {formatDate(c.due_date)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{formatCurrency(c.value)}</span>
                        <Badge variant={cs.variant} className="text-xs">{cs.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Links */}
          <TabsContent value="links" className="mt-4 space-y-3">
            <div className="flex justify-end">
              <LinkDialog clientId={client.id}>
                <Button size="sm"><Plus className="h-4 w-4" />Novo Link</Button>
              </LinkDialog>
            </div>
            {!links?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum link salvo</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {links.map((l) => (
                  <Card key={l.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{l.title}</p>
                          <p className="text-xs text-muted-foreground">{linkCategoryLabels[l.category] ?? l.category}</p>
                        </div>
                        <a href={l.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Acessos */}
          <TabsContent value="acessos" className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" />
                Senhas criptografadas
              </p>
              <AccessDialog clientId={client.id}>
                <Button size="sm"><Plus className="h-4 w-4" />Novo Acesso</Button>
              </AccessDialog>
            </div>
            {!accesses?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Nenhum acesso cadastrado</p>
            ) : (
              accesses.map((a) => (
                <Card key={a.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-sm text-muted-foreground">{a.username || "—"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.url && (
                          <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {a.password_encrypted && <RevealPasswordButton encryptedPassword={a.password_encrypted} />}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

