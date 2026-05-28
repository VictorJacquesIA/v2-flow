"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteEbookGeneration } from "@/app/actions/ebooks";

export function EbookDeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteEbookGeneration(id);
      router.refresh();
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
