import type { EbookFormData, EbookScores } from "@/types";

/**
 * Scores heurísticos para o perfil GBP do prospect.
 * Intencionalmente baixos — representam o perfil antes da otimização.
 * O gap visual é a proposta de valor do serviço.
 */
export function calculateScores(data: EbookFormData): EbookScores {
  // Com o pacote GBP temos o texto; sem detalhes adicionais os scores ficam baixos
  const hasPackage = !!data.gbpPackageText?.trim();

  const presencaLocal = hasPackage ? 35 : 20;
  const autoridade    = hasPackage ? 25 : 15;
  const conversao     = hasPackage ? 30 : 15;
  const reputacao     = 20;
  const conteudo      = 20;

  return { presencaLocal, autoridade, conversao, reputacao, conteudo };
}

/** Estima clientes/mês perdidos com base no gap médio dos scores. */
export function estimateLostClients(scores: EbookScores): number {
  const avg = (scores.presencaLocal + scores.autoridade + scores.conversao) / 3;
  const gap = (100 - avg) / 100;
  return Math.round(5 + gap * 30); // range: 5–35
}
