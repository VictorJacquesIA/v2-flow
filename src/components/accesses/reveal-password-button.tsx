"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Loader2 } from "lucide-react";
import { decryptPasswordAction } from "@/app/actions/accesses";
import { useToast } from "@/hooks/use-toast";

export function RevealPasswordButton({ encryptedPassword }: { encryptedPassword: string }) {
  const { toast } = useToast();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleReveal() {
    if (revealed) { setRevealed(null); return; }
    setLoading(true);
    try {
      const password = await decryptPasswordAction(encryptedPassword);
      setRevealed(password);
    } catch {
      toast({ title: "Erro ao revelar senha", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!revealed) return;
    await navigator.clipboard.writeText(revealed);
    toast({ title: "Senha copiada" });
  }

  return (
    <div className="flex items-center gap-1">
      {revealed && (
        <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded max-w-[150px] truncate" title={revealed}>
          {revealed}
        </span>
      )}
      <button
        onClick={handleReveal}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title={revealed ? "Ocultar senha" : "Ver senha"}
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : revealed
          ? <EyeOff className="h-4 w-4" />
          : <Eye className="h-4 w-4" />}
      </button>
      {revealed && (
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Copiar senha"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
