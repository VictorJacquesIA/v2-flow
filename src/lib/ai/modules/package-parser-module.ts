import Anthropic from "@anthropic-ai/sdk";
import { extractJson } from "./extract-json";
import type { GbpPackageParsed } from "@/types";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM = `Você extrai dados estruturados de textos de Pacote GBP.
Extraia EXATAMENTE o que está no texto — não invente, não reescreva, não complete.
Se uma seção não existir, use "" ou [].
Retorne JSON válido, sem markdown, sem texto antes ou depois.`;

export async function runPackageParserModule(
  packageText: string
): Promise<GbpPackageParsed> {
  const prompt = `Extraia os dados abaixo do texto de pacote GBP fornecido.
NÃO invente, NÃO reescreva, NÃO complete — apenas organize o que está no texto.

SEÇÕES ESPERADAS:
3.1 — NOME OTIMIZADO
3.2 — CATEGORIA PRINCIPAL + CATEGORIAS ADICIONAIS
3.3 — DESCRIÇÃO DA EMPRESA
3.4 — LISTA DE SERVIÇOS (título + parágrafo por serviço)
3.5 — PERGUNTAS E RESPOSTAS (P: ... / R: ...)
3.6 — TEMPLATES DE RESPOSTA A AVALIAÇÕES (Positivas / Neutras / Negativas, Modelo 1/2/3)
3.7 — SUGESTÃO DE POSTAGENS (Título / Texto / CTA / Tipo por postagem)
3.8 — NOMES DE ARQUIVOS DE MÍDIA (lista de .jpg)
3.9 — CHECKLIST DE AÇÕES MANUAIS (lista de itens)

Retorne EXATAMENTE este JSON:
{
  "nameOptimized": "...",
  "categoryPrimary": "...",
  "categoriesAdditional": ["..."],
  "description": "...",
  "services": [{ "title": "...", "description": "..." }],
  "faqQuestions": ["..."],
  "faqAnswers": ["..."],
  "reviewTemplates": {
    "positive": ["modelo1", "modelo2", "modelo3"],
    "neutral":  ["modelo1", "modelo2", "modelo3"],
    "negative": ["modelo1", "modelo2", "modelo3"]
  },
  "posts": [
    { "type": "Atualização|Oferta|Novidade", "title": "...", "body": "...", "cta": "..." }
  ],
  "photoFiles": ["..."],
  "checklistItems": ["..."]
}

TEXTO DO PACOTE:
${packageText}`;

  const res = await getClient().messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 3500,
    system:     SYSTEM,
    messages:   [{ role: "user", content: prompt }],
  });

  return extractJson<GbpPackageParsed>((res.content[0] as { text: string }).text);
}
