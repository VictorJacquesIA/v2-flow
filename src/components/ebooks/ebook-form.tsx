"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { downloadBlob, ebookFileName } from "@/lib/utils";
import { Loader2, Download } from "lucide-react";
import type { EbookFormData } from "@/types";

interface EbookFormProps {
  onSuccess?: () => void;
}

export function EbookForm({ onSuccess }: EbookFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);

    const payload: EbookFormData = {
      businessName:   fd.get("businessName")   as string,
      niche:          fd.get("niche")          as string,
      keyword:        fd.get("keyword")        as string,
      city:           fd.get("city")           as string,
      gbpPackageText: fd.get("gbpPackageText") as string,
    };

    try {
      const res = await fetch("/api/ebooks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Erro ao gerar ebook");
      }

      downloadBlob(await res.blob(), ebookFileName(payload.businessName));
      toast({ title: "Ebook gerado!", description: "Download iniciado automaticamente." });
      onSuccess?.();
      router.refresh();
    } catch (err) {
      toast({
        title: "Erro ao gerar ebook",
        description: err instanceof Error ? err.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── 4 campos de identificação ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="businessName">Nome do Negócio *</Label>
          <Input id="businessName" name="businessName" placeholder="Ex: Clínica São João" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Cidade *</Label>
          <Input id="city" name="city" placeholder="Ex: Campinas" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="niche">Nicho / Segmento *</Label>
          <Input id="niche" name="niche" placeholder="Ex: Odontologia" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="keyword">Palavra-chave Principal *</Label>
          <Input id="keyword" name="keyword" placeholder="Ex: dentista em Campinas" required />
        </div>
      </div>

      {/* ── Pacote GBP ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="gbpPackageText">Texto do Pacote GBP *</Label>
        <p className="text-xs text-muted-foreground">
          Cole o texto completo com as seções 3.1 a 3.9. A IA extrai nome, categorias,
          descrição, serviços, Q&amp;A, avaliações, postagens, fotos e checklist diretamente.
        </p>
        <Textarea
          id="gbpPackageText"
          name="gbpPackageText"
          required
          rows={16}
          className="font-mono text-xs"
          placeholder={`3.1 — NOME OTIMIZADO\nNome Negócio | keyword-alvo\n\n3.2 — CATEGORIA PRINCIPAL\nCategoria principal\nCategorias adicionais: ...\n\n3.3 — DESCRIÇÃO DA EMPRESA\n...\n\n3.4 — LISTA DE SERVIÇOS\nServiço 1\n...\n\n3.5 — PERGUNTAS E RESPOSTAS\nP: ...\nR: ...\n\n3.6 — TEMPLATES DE RESPOSTA A AVALIAÇÕES\n...\n\n3.7 — SUGESTÃO DE POSTAGENS\n...\n\n3.8 — NOMES DE ARQUIVOS DE MÍDIA\n...\n\n3.9 — CHECKLIST DE AÇÕES MANUAIS\n...`}
        />
      </div>

      {/* ── Ações ────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-2 pt-1">
        {onSuccess && (
          <Button type="button" variant="outline" onClick={onSuccess} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando com IA...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Gerar Ebook
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
