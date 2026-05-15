"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { markChargePaidAction } from "@/app/actions/charges";
import { CheckCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function MarkPaidButton({ chargeId }: { chargeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleMarkPaid() {
    setLoading(true);
    try {
      await markChargePaidAction(chargeId);
      toast({ title: "Cobrança marcada como paga" });
      router.refresh();
    } catch {
      toast({ title: "Erro ao atualizar cobrança", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkPaid} disabled={loading} className="text-xs text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10">
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
      Marcar Pago
    </Button>
  );
}
