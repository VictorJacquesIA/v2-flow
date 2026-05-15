import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClientDialog } from "@/components/clients/client-dialog";
import { Plus, ExternalLink, MessageCircle, Globe } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

const statusConfig = {
  ativo: { label: "Ativo", variant: "success" as const },
  lead: { label: "Lead", variant: "info" as const },
  pausado: { label: "Pausado", variant: "warning" as const },
  inativo: { label: "Inativo", variant: "secondary" as const },
};

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Clientes"
        description={`${clients?.length ?? 0} clientes cadastrados`}
        action={
          <ClientDialog>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </ClientDialog>
        }
      />

      <div className="p-6">
        {!clients?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Nenhum cliente cadastrado</h3>
            <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro cliente para começar.</p>
            <ClientDialog>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </ClientDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {clients.map((client) => {
              const statusInfo = statusConfig[client.status as keyof typeof statusConfig] ?? statusConfig.ativo;
              return (
                <Link
                  key={client.id}
                  href={`/clientes/${client.id}`}
                  className="group rounded-xl border border-border bg-card p-5 hover:border-border/60 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{client.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{client.company || client.niche || "—"}</p>
                      </div>
                    </div>
                    <Badge variant={statusInfo.variant} className="shrink-0">{statusInfo.label}</Badge>
                  </div>

                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {client.whatsapp && (
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {client.whatsapp}
                      </span>
                    )}
                    {client.domain && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {client.domain}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Desde {formatDate(client.entry_date || client.created_at)}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
