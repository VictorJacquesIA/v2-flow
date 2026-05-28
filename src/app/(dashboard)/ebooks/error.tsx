"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function EbooksError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ebooks] erro:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full py-24 text-center gap-4">
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <div>
        <p className="font-semibold mb-1">Ocorreu um erro no módulo de Ebooks</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          {error.message?.includes("does not exist")
            ? "A tabela de ebooks ainda não foi criada no banco de dados. Execute o SQL no painel do Supabase."
            : "Tente novamente. Se o problema persistir, verifique as configurações."}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
