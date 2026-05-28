/**
 * Teste isolado da geração de conteúdo de ebook com Claude.
 * Uso: npx tsx scripts/test-ebook-ai.ts
 */

import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

import { generateEbookContent } from "../src/lib/ai/generate-ebook-content";
import type { EbookFormData } from "../src/types";

const PACKAGE_EXAMPLE = `
3.1 — NOME OTIMIZADO
Chef Pet Gourmet | Pet Shop em Florianópolis

3.2 — CATEGORIA PRINCIPAL
Categoria principal: Pet Shop
Categorias adicionais: Loja de rações para animais, Serviço de banho e tosa, Clínica veterinária

3.3 — DESCRIÇÃO DA EMPRESA
O Chef Pet Gourmet é um pet shop completo em Florianópolis especializado em nutrição natural e premium para cães e gatos. Realizamos banho e tosa, vendemos rações naturais, petiscos artesanais e acessórios de qualidade. Atendemos com agendamento e entrega via Uber Flash para toda a Grande Florianópolis.

3.4 — LISTA DE SERVIÇOS
Banho e Tosa
Serviço de higiene completa para cães e gatos com produtos premium.

Rações Naturais e Premium
Linha completa de rações naturais, RAW e premium para todas as raças.

Petiscos Artesanais
Produção própria de petiscos saudáveis sem conservantes.

Acessórios Pet
Coleiras, camas, brinquedos e acessórios selecionados.

Entrega em Casa
Entrega via Uber Flash para toda a Grande Florianópolis.

3.5 — PERGUNTAS E RESPOSTAS
P: Vocês fazem entrega em casa?
R: Sim, entregamos via Uber Flash para toda a Grande Florianópolis. Chama no WhatsApp pra combinar!

P: Qual o horário de funcionamento?
R: Seg a sex das 8h às 18h e sáb das 8h às 12h.

P: Vocês trabalham com rações naturais?
R: Sim! Temos a maior variedade de rações naturais e RAW pet shop em Florianópolis.

3.6 — TEMPLATES DE RESPOSTA A AVALIAÇÕES
Positivas:
Modelo 1: Que alegria saber que você e seu pet ficaram felizes! Obrigado pela confiança. Sempre à disposição!
Modelo 2: Adoramos atender vocês! Conte com a gente sempre que precisar. Até a próxima visita!
Modelo 3: Fico muito feliz com o feedback! É isso que nos motiva a melhorar cada vez mais.

Neutras:
Modelo 1: Obrigado pelo retorno! Anotamos seu feedback e vamos melhorar. Pode contar com a gente.
Modelo 2: Agradecemos a visita e o comentário. Estamos sempre buscando melhorar. Volte sempre!
Modelo 3: Seu feedback é muito importante pra gente. Qualquer dúvida, chama no WhatsApp.

Negativas:
Modelo 1: Lamentamos muito pela experiência. Entra em contato diretamente pra resolvermos juntos.
Modelo 2: Pedimos desculpas pelo ocorrido. Isso não representa nosso padrão. Chama no zap!
Modelo 3: Ficamos tristes com isso. Pode nos contatar que resolvemos da melhor forma possível.

3.7 — SUGESTÃO DE POSTAGENS
Postagem 1
Tipo: Atualização
Título: Horário de funcionamento Chef Pet Gourmet
Texto: O Chef Pet Gourmet, pet shop em Florianópolis, funciona seg a sex 8h–18h e sáb 8h–12h. Agende seu pet pelo WhatsApp!
CTA: Agendar agora

Postagem 2
Tipo: Oferta
Título: Rações naturais com entrega no mesmo dia
Texto: Trabalhamos com as melhores rações naturais e RAW para pet shop em Florianópolis. Entregamos via Uber Flash!
CTA: Pedir agora

Postagem 3
Tipo: Novidade
Título: Petiscos artesanais sem conservantes chegaram
Texto: Novidade no Chef Pet Gourmet em Florianópolis! Petiscos artesanais sem conservantes, feitos aqui mesmo.
CTA: Ver opções

3.8 — NOMES DE ARQUIVOS DE MÍDIA
chef-pet-gourmet-fachada-externa.jpg
chef-pet-gourmet-produtos-racao-natural.jpg
chef-pet-gourmet-banho-tosa-atendimento.jpg
chef-pet-gourmet-petiscos-artesanais.jpg
chef-pet-gourmet-loja-interna.jpg

3.9 — CHECKLIST DE AÇÕES MANUAIS
[ ] Atualizar nome do perfil para "Chef Pet Gourmet | Pet Shop em Florianópolis"
[ ] Configurar categoria principal: Pet Shop
[ ] Adicionar categorias adicionais
[ ] Copiar e publicar a descrição otimizada
[ ] Cadastrar todos os 5 serviços com títulos e descrições
[ ] Publicar as 3 perguntas e respostas
[ ] Responder todas as avaliações existentes usando os templates
[ ] Fazer upload das 5 fotos com os nomes sugeridos
[ ] Publicar a primeira postagem
[ ] Cadastrar horário de funcionamento: seg a sex 08:00–18:00 | sáb 08:00–12:00
[ ] Cadastrar telefone: (48) 99193-3188
[ ] Cadastrar site: chefpetgourmet.com.br
`;

const TEST_DATA: EbookFormData = {
  businessName:   "Chef Pet Gourmet",
  niche:          "Pet Shop",
  keyword:        "pet shop em Florianópolis",
  city:           "Florianópolis",
  gbpPackageText: PACKAGE_EXAMPLE,
};

async function run() {
  console.log("🤖 Iniciando geração com Pacote GBP...\n");
  const start = Date.now();

  try {
    const content = await generateEbookContent(TEST_DATA);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`✅ Gerado em ${elapsed}s\n`);

    console.log("📊 SCORES:");
    Object.entries(content.scores).forEach(([k, v]) => console.log(`  ${k}: ${v}%`));

    console.log("\n🔍 DIAGNÓSTICO:");
    console.log(`  Clientes perdidos: ${content.diagnosis.clientsLostEstimate}/mês`);
    content.diagnosis.insightLines.forEach((l, i) => console.log(`  [${i + 1}] ${l}`));

    console.log("\n📦 PARSED — IDENTIDADE:");
    console.log(`  Nome: ${content.parsed.nameOptimized}`);
    console.log(`  Categoria: ${content.parsed.categoryPrimary}`);
    console.log(`  Adicionais: ${content.parsed.categoriesAdditional.join(", ")}`);
    console.log(`  Descrição (${content.parsed.description.length} chars): ${content.parsed.description.slice(0, 80)}...`);

    console.log(`\n🛠 SERVIÇOS (${content.parsed.services.length}):`);
    content.parsed.services.forEach((s, i) => console.log(`  [${i + 1}] ${s.title}`));

    console.log(`\n❓ FAQ (${content.parsed.faqQuestions.length} pares):`);
    content.parsed.faqQuestions.forEach((q, i) => console.log(`  P${i + 1}: ${q}`));

    console.log(`\n⭐ REVIEWS: ${content.parsed.reviewTemplates.positive.length} positivas, ${content.parsed.reviewTemplates.neutral.length} neutras, ${content.parsed.reviewTemplates.negative.length} negativas`);

    console.log(`\n📮 POSTS (${content.parsed.posts.length}):`);
    content.parsed.posts.forEach((p, i) => console.log(`  [${i + 1}] ${p.type} | ${p.title}`));

    console.log(`\n📋 CHECKLIST (${content.parsed.checklistItems.length} itens)`);
    console.log(`\n📸 FOTOS (${content.parsed.photoFiles.length}): ${content.parsed.photoFiles.join(", ")}`);

    console.log("\n✅ Teste concluído com sucesso!");

  } catch (err) {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.error(`\n❌ Erro após ${elapsed}s:`);
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

run();
