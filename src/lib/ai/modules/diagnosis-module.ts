import Anthropic from "@anthropic-ai/sdk";
import { extractJson } from "./extract-json";
import type { EbookFormData, EbookScores, DiagnosisAiOutput } from "@/types";

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

const SYSTEM = `Você é dono de agência digital que explica, de forma direta, como negócios locais perdem clientes no Google Maps todo dia.

Fale como gestor comercial experiente — alguém que já ajudou dezenas de negócios locais a gerar mais contatos e vendas.

NÃO fale como consultor corporativo, analista técnico ou especialista em algoritmo.

VOCABULÁRIO PERMITIDO: clientes, WhatsApp, ligações, contato, pedido de orçamento, aparecer no Google, vendas, movimento, concorrente, escolher outro negócio, perder cliente, Google, site, resposta rápida.

VOCABULÁRIO PROIBIDO: ranqueamento, algoritmo, posicionamento, relevância, comportamento do consumidor, presença digital, autoridade digital, percepção, visibilidade orgânica, conversão, Maps.

PROIBIDO: "certamente", "excelência", "qualidade". Não repita o nome da empresa mais de 1x.

Retorne JSON válido, sem markdown, sem texto antes ou depois.`;

export async function runDiagnosisModule(
  data: EbookFormData,
  scores: EbookScores,
  lostEstimate: number
): Promise<DiagnosisAiOutput> {
  const prompt = `Negócio: ${data.businessName} | Nicho: ${data.niche} | Cidade: ${data.city}
Scores: Presença ${scores.presencaLocal}%, Autoridade ${scores.autoridade}%, Conversão ${scores.conversao}%, Reputação ${scores.reputacao}%

PARTE 1 — DIAGNÓSTICO (3 frases sobre o que esse negócio está perdendo)

ESTRUTURA de cada frase:
[padrão que acontece hoje] → [cliente vai para outro] → [negócio perde contato ou venda]

TOM CORRETO:
"Quem procura esse tipo de serviço no Google normalmente escolhe entre os primeiros que aparecem."
"Enquanto o perfil fica parado, outros negócios do mesmo nicho estão recebendo esses contatos."
"A maioria das pessoas decide antes de ligar — com base só no que vê no perfil."

REGRAS das frases de diagnóstico:
- Máx 120 chars por frase
- Varie o sujeito (não comece 2 frases com o mesmo)
- Mencione ${data.city} no máximo 1x, de forma natural
- Não critique o dono — mostre o que está sendo perdido

PARTE 2 — PADRÕES DO SEGMENTO (3 frases sobre como os clientes desse nicho tomam decisão)

Escreva 3 padrões reais de como clientes decidem contratar um ${data.niche}.

COMPORTAMENTOS OBRIGATÓRIOS a incluir (distribua entre os 3 padrões):
1. Após encontrar no Google, o cliente procura o site do negócio — quem tem site bom converte na hora.
2. Resposta rápida no WhatsApp decide — quem demora perde para o concorrente que respondeu antes.
3. O cliente decide olhando o perfil no Google antes de qualquer contato.

Exemplos de TOM correto:
"Quem acha um ${data.niche} no Google vai direto no site — se não tem ou está ruim, procura outro."
"A maioria manda WhatsApp para dois ou três ao mesmo tempo — responde primeiro, fica com o cliente."
"A decisão acontece no perfil do Google, antes de ligar ou mandar mensagem."

REGRAS dos padrões:
- Máx 130 chars por padrão
- Tom direto, baseado em comportamento real de consumidor local
- Não mencione o nome da empresa
- Use "Google" — nunca "Maps"

Retorne: { "insightLines": ["frase1", "frase2", "frase3"], "segmentPatterns": ["padrão1", "padrão2", "padrão3"], "clientsLostEstimate": ${lostEstimate} }`;

  const res = await getClient().messages.create({
    model:      "claude-haiku-4-5-20251001",
    max_tokens: 400,
    system:     SYSTEM,
    messages:   [{ role: "user", content: prompt }],
  });

  return extractJson<DiagnosisAiOutput>((res.content[0] as { text: string }).text);
}
