"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteClientAction } from "@/app/actions/clients";
import { Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ClientDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir este cliente? Todos os dados relacionados serão removidos.")) return;
    setLoading(true);
    try {
      await deleteClientAction(id);
      toast({ title: "Cliente excluído" });
      router.push("/clientes");
      router.refresh();
    } catch {
      toast({ title: "Erro ao excluir cliente", variant: "destructive" });
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading} className="text-destructive hover:text-destructive">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
