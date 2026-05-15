"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createChargeAction, updateChargeAction } from "@/app/actions/charges";
import { createClient } from "@/lib/supabase/client";
import type { Charge } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChargeDialogProps {
  children: React.ReactNode;
  charge?: Charge;
  clientId?: string;
}

export function ChargeDialog({ children, charge, clientId }: ChargeDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(charge?.status ?? "pendente");
  const [paymentMethod, setPaymentMethod] = useState(charge?.payment_method ?? "");
  const [selectedClientId, setSelectedClientId] = useState(charge?.client_id ?? clientId ?? "");
  const [selectedProjectId, setSelectedProjectId] = useState(charge?.project_id ?? "");
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open) {
      const supabase = createClient();
      supabase.from("clients").select("id, name").order("name").then(({ data }) => {
        if (data) setClients(data);
      });
    }
  }, [open]);

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
      formData.set("payment_method", paymentMethod);
      formData.set("client_id", selectedClientId);
      formData.set("project_id", selectedProjectId);

      if (charge) {
        await updateChargeAction(charge.id, formData);
        toast({ title: "Cobrança atualizada" });
      } else {
        await createChargeAction(formData);
        toast({ title: "Cobrança criada" });
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Erro ao salvar cobrança", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{charge ? "Editar Cobrança" : "Nova Cobrança"}</DialogTitle></DialogHeader>
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

          <div className="space-y-2">
            <Label>Projeto</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={!selectedClientId}>
              <SelectTrigger><SelectValue placeholder="Opcional..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum</SelectItem>
                {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input id="description" name="description" defaultValue={charge?.description} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Valor (R$) *</Label>
              <Input id="value" name="value" type="number" step="0.01" min="0" defaultValue={charge?.value} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Vencimento *</Label>
              <Input id="due_date" name="due_date" type="date" defaultValue={charge?.due_date} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Método de Pagamento</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">—</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {charge ? "Salvar alterações" : "Criar cobrança"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
