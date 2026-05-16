import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChargeDialog } from "@/components/charges/charge-dialog";
import { MarkPaidButton } from "@/components/charges/mark-paid-button";
import { Plus, Calendar, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  pago: { label: "Pago", variant: "success" },
  pendente: { label: "Pendente", variant: "warning" },
  atrasado: { label: "Atrasado", variant: "destructive" },
  cancelado: { label: "Cancelado", variant: "secondary" },
};

export default async function FinanceiroPage() {
  const supabase = await createClient();
  const { data: charges } = await supabase
    .from("charges")
    .select("*, clients(name), projects(name)")
    .order("due_date", { ascending: true });

  const pendingTotal = charges?.filter(c => c.status === "pendente" || c.status === "atrasado")
    .reduce((s, c) => s + c.value, 0) ?? 0;

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const paidThisMonth = charges?.filter(c => c.status === "pago" && c.paid_at && new Date(c.paid_at) >= monthStart)
    .reduce((s, c) => s + c.value, 0) ?? 0;

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Financeiro"
        description="Controle de cobranças e recebimentos"
        action={
          <ChargeDialog>
            <Button size="sm"><Plus className="h-4 w-4" />Nova Cobrança</Button>
          </ChargeDialog>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">A Receber</p>
            <p className="text-xl font-bold mt-1 text-amber-400">{formatCurrency(pendingTotal)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Recebido este mês</p>
            <p className="text-xl font-bold mt-1 text-emerald-400">{formatCurrency(paidThisMonth)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de cobranças</p>
            <p className="text-xl font-bold mt-1">{charges?.length ?? 0}</p>
          </CardContent></Card>
        </div>

        {/* List */}
        {!charges?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma cobrança cadastrada</p>
            <ChargeDialog>
              <Button size="sm"><Plus className="h-4 w-4" />Nova Cobrança</Button>
            </ChargeDialog>
          </div>
        ) : (
          <div className="space-y-2">
            {charges.map((charge) => {
              const sc = statusConfig[charge.status] ?? statusConfig.pendente;
              const overdue = isOverdue(charge.due_date) && charge.status === "pendente";
              return (
                <Card key={charge.id} className={overdue ? "border-red-500/20" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{charge.description}</p>
                          {charge.recurring && <RefreshCw className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-label="Recorrente" />}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{(charge.clients as unknown as { name: string } | null)?.name ?? "—"}</span>
                          {charge.projects && <span>{(charge.projects as unknown as { name: string } | null)?.name}</span>}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Vence {formatDate(charge.due_date)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-semibold">{formatCurrency(charge.value)}</span>
                        <Badge variant={overdue ? "destructive" : sc.variant} className="text-xs">
                          {overdue ? "Atrasado" : sc.label}
                        </Badge>
                        {(charge.status === "pendente" || charge.status === "atrasado") && (
                          <MarkPaidButton chargeId={charge.id} />
                        )}
                        <ChargeDialog charge={charge as Parameters<typeof ChargeDialog>[0]["charge"]}>
                          <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                        </ChargeDialog>
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
