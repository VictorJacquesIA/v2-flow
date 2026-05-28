import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Image,
} from "@react-pdf/renderer";
import type { EbookContent } from "@/types";
import { CONTACT_PHONE, CONTACT_SITE, CTA_HEADLINE, CTA_SUB, CTA_BUTTON } from "@/lib/ebook/ctas";
import { VITRINE_LOGO_B64 as VITRINE_LOGO } from "@/lib/ebook/logo-b64";

// ─── Paleta ──────────────────────────────────────────────────────────────────

const C = {
  blue:       "#1a56db",
  blueDark:   "#1e3a8a",
  blueLight:  "#dbeafe",
  blueBg:     "#f0f4ff",
  green:      "#16a34a",
  greenLight: "#dcfce7",
  greenDark:  "#166534",
  red:        "#dc2626",
  redLight:   "#fee2e2",
  redDark:    "#7f1d1d",
  amber:      "#d97706",
  amberLight: "#fef3c7",
  dark:       "#111827",
  gray:       "#6b7280",
  grayLight:  "#9ca3af",
  light:      "#f3f4f6",
  border:     "#e5e7eb",
  white:      "#ffffff",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Estilos ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Layout
  page:            { fontFamily: "Helvetica", fontSize: 9, color: C.dark, paddingHorizontal: 36, paddingTop: 28, paddingBottom: 40, backgroundColor: C.white },
  pageFooter:      { position: "absolute", bottom: 14, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  footerText:      { fontSize: 6.5, color: C.grayLight },
  pageNum:         { fontSize: 6.5, color: C.grayLight },

  // Capa
  coverPage:       { backgroundColor: C.dark, padding: 0 },
  coverInner:      { flex: 1, padding: 42, justifyContent: "center" },
  coverLogo:       { width: 460, height: 270, objectFit: "contain", marginBottom: 32 },
  coverTag:        { fontSize: 7, color: C.grayLight, letterSpacing: 1.5, marginBottom: 6 },
  coverSubtag:     { fontSize: 8, color: "#4b5563", marginBottom: 30 },
  coverDivider:    { width: 40, height: 2, backgroundColor: C.blue, marginBottom: 20 },
  coverTitle:      { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.white, lineHeight: 1.3, marginBottom: 14 },
  coverSubtitle:   { fontSize: 10, color: C.grayLight, lineHeight: 1.5, marginBottom: 32 },
  pillRow:         { flexDirection: "row", flexWrap: "wrap" },
  pill:            { backgroundColor: "#1f2937", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 6, marginBottom: 4 },
  pillText:        { fontSize: 7.5, color: C.grayLight },
  coverFooter:     { position: "absolute", bottom: 20, left: 42, right: 42, flexDirection: "row", justifyContent: "space-between" },
  coverFooterText: { fontSize: 7, color: "#374151" },

  // Page header
  pageHeader:      { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  headerLine:      { width: 3, height: 18, backgroundColor: C.blue, marginRight: 8 },
  headerTitle:     { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.dark },
  headerSub:       { fontSize: 8, color: C.gray, marginTop: 1 },

  // Seções
  section:         { marginBottom: 10 },
  sectionTitle:    { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: C.blueDark, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 },
  bodyText:        { fontSize: 8.5, color: "#374151", lineHeight: 1.55 },

  // Cards
  cardBlue:        { backgroundColor: C.blueBg, borderLeft: 3, borderColor: C.blue, padding: 10, marginBottom: 6, borderRadius: 6 },
  cardGreen:       { backgroundColor: C.greenLight, borderLeft: 3, borderColor: C.green, padding: 10, marginBottom: 6, borderRadius: 6 },

  // Score bars
  scoreRow:        { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  scoreLabel:      { fontSize: 7.5, color: "#374151", width: 80 },
  scoreBarBg:      { flex: 1, height: 7, backgroundColor: C.border, borderRadius: 3, marginHorizontal: 8 },
  scoreValue:      { fontSize: 7.5, color: C.gray, width: 30, textAlign: "right" },

  // Flow diagram
  flowRow:         { flexDirection: "row", alignItems: "stretch", marginBottom: 8, marginTop: 2 },
  flowBox:         { flex: 1, backgroundColor: C.light, padding: 5, alignItems: "center", borderRadius: 5 },
  flowBoxAlert:    { flex: 1, backgroundColor: C.redLight, padding: 5, alignItems: "center", borderColor: C.red, borderWidth: 0.5, borderRadius: 5 },
  flowStep:        { fontSize: 6, color: C.grayLight, marginBottom: 2 },
  flowLabel:       { fontSize: 6.5, color: C.dark, textAlign: "center", lineHeight: 1.3 },
  flowArrow:       { justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  flowArrowText:   { fontSize: 11, color: C.grayLight },

  // Human insight
  insightQuote:    { backgroundColor: C.blueDark, padding: 9, marginVertical: 7, borderRadius: 6 },
  insightText:     { fontSize: 8, color: C.blueLight, lineHeight: 1.55, fontFamily: "Helvetica-Oblique" },

  // Lost callout
  lostCallout:     { backgroundColor: "#111827", padding: 10, marginTop: 7, flexDirection: "row", alignItems: "center", borderRadius: 6 },
  lostNumber:      { fontSize: 20, fontFamily: "Helvetica-Bold", color: C.red, marginRight: 8 },
  lostMeta:        { flex: 1 },
  lostUnit:        { fontSize: 7, color: C.grayLight, marginBottom: 1 },
  lostLabel:       { fontSize: 7.5, color: "#9ca3af" },

  // Name optimization
  nameBox:         { backgroundColor: C.blueDark, padding: 10, marginBottom: 6, borderRadius: 6 },
  nameSuggestion:  { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white, marginBottom: 4 },
  nameExplain:     { fontSize: 8, color: C.blueLight, lineHeight: 1.4 },

  // Categories
  catPrimary:      { backgroundColor: C.blue, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 5, borderRadius: 4 },
  catPrimaryText:  { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.white },
  catRow:          { flexDirection: "row", flexWrap: "wrap" },
  catPill:         { backgroundColor: C.blueLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, marginRight: 5, marginBottom: 4 },
  catPillText:     { fontSize: 7.5, color: C.blueDark },

  // Description
  descBox:         { backgroundColor: C.light, padding: 12, marginBottom: 6, borderRadius: 6 },
  descText:        { fontSize: 8.5, color: C.dark, lineHeight: 1.65 },
  descCount:       { fontSize: 6.5, color: C.grayLight, marginTop: 5, textAlign: "right" },

  // Services
  serviceItem:     { borderBottom: 0.5, borderColor: C.border, paddingBottom: 6, marginBottom: 6 },
  serviceTitle:    { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.dark, marginBottom: 2 },
  serviceDesc:     { fontSize: 7.5, color: C.gray, lineHeight: 1.4 },

  // FAQ
  faqItem:         { marginBottom: 7 },
  faqQuestion:     { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.blueDark, marginBottom: 2 },
  faqAnswer:       { fontSize: 7.5, color: "#374151", lineHeight: 1.45 },

  // Reviews
  reviewBox5:      { backgroundColor: "#f0fdf4", borderLeft: 3, borderColor: C.green, padding: 8, marginBottom: 5, borderRadius: 6 },
  reviewBox3:      { backgroundColor: C.amberLight, borderLeft: 3, borderColor: C.amber, padding: 8, marginBottom: 5, borderRadius: 6 },
  reviewBox1:      { backgroundColor: C.redLight, borderLeft: 3, borderColor: C.red, padding: 8, marginBottom: 5, borderRadius: 6 },
  reviewLabel:     { fontSize: 7, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  reviewText:      { fontSize: 7.5, lineHeight: 1.4 },

  // Posts
  postBox:         { backgroundColor: C.light, padding: 10, marginBottom: 6, borderRadius: 6 },
  postHeader:      { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  postTypeBadge:   { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, marginRight: 6 },
  postTypeText:    { fontSize: 6.5, fontFamily: "Helvetica-Bold", color: C.white },
  postTitle:       { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.dark, flex: 1 },
  postBody:        { fontSize: 8, color: "#374151", lineHeight: 1.5, marginBottom: 4 },
  postCta:         { fontSize: 7.5, color: C.blue, fontFamily: "Helvetica-Bold" },

  // Photos
  photoRow:        { flexDirection: "row", flexWrap: "wrap" },
  photoItem:       { width: "50%", flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  photoDot:        { fontSize: 7, color: C.gray, marginRight: 4 },
  photoText:       { fontSize: 7, color: "#374151", flex: 1 },

  // Checklist
  clItem:          { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  clBox:           { width: 9, height: 9, borderWidth: 1, borderColor: C.border, marginRight: 6, marginTop: 0.5, borderRadius: 2 },
  clText:          { fontSize: 8, color: "#374151", flex: 1, lineHeight: 1.35 },

  // 2 Pilares
  pilaresRow:      { flexDirection: "row", gap: 8, marginBottom: 8 },
  pilarCard:       { flex: 1 },
  pilarHeader:     { paddingHorizontal: 10, paddingVertical: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7 },
  pilarNum:        { fontSize: 7, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 1, opacity: 0.7, marginBottom: 2 },
  pilarTitle:      { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: C.white, lineHeight: 1.3 },
  pilarBody:       { backgroundColor: "#1f2937", padding: 10, borderBottomLeftRadius: 7, borderBottomRightRadius: 7 },
  pilarItem:       { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  pilarCheck:      { fontSize: 8, color: "#60a5fa", marginRight: 5, marginTop: 0.5 },
  pilarItemText:   { fontSize: 7.5, color: "#bfdbfe", lineHeight: 1.45, flex: 1 },
  pilarDivider:    { justifyContent: "center", alignItems: "center", paddingHorizontal: 4 },
  pilarPlus:       { width: 20, height: 20, borderRadius: 10, backgroundColor: C.blue, justifyContent: "center", alignItems: "center" },
  pilarPlusText:   { fontSize: 11, color: C.white, fontFamily: "Helvetica-Bold", lineHeight: 1 },
  pilarFooter:     { backgroundColor: "#111827", padding: 8, marginBottom: 10, borderRadius: 5 },
  pilarFooterText: { fontSize: 7.5, color: C.grayLight, textAlign: "center", lineHeight: 1.5, fontFamily: "Helvetica-Oblique" },

  // CTA
  ctaBox:          { backgroundColor: C.blueDark, padding: 16, marginTop: 10, borderRadius: 8 },
  ctaHeadline:     { fontSize: 12, fontFamily: "Helvetica-Bold", color: C.white, lineHeight: 1.35, marginBottom: 7 },
  ctaSub:          { fontSize: 8, color: C.blueLight, lineHeight: 1.5, marginBottom: 12 },
  ctaButton:       { backgroundColor: C.green, paddingHorizontal: 14, paddingVertical: 7, alignSelf: "flex-start", borderRadius: 4 },
  ctaButtonText:   { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.white },
  ctaContact:      { marginTop: 10, fontSize: 7, color: C.grayLight },
});

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PageNum() {
  return (
    <View style={s.pageFooter} fixed>
      <Text style={s.footerText}>{CONTACT_SITE}</Text>
      <Text
        style={s.pageNum}
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={s.pageHeader}>
      <View style={s.headerLine} />
      <View>
        <Text style={s.headerTitle}>{title}</Text>
        {sub && <Text style={s.headerSub}>{sub}</Text>}
      </View>
    </View>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? C.green : value >= 40 ? C.amber : C.red;
  return (
    <View style={s.scoreRow}>
      <Text style={s.scoreLabel}>{label}</Text>
      <View style={s.scoreBarBg}>
        <View style={{ width: `${value}%`, height: 7, backgroundColor: color, borderRadius: 3 }} />
      </View>
      <Text style={s.scoreValue}>{value}%</Text>
    </View>
  );
}

const FLOW_STEPS = [
  { label: "Cliente pesquisa\nno Google",     alert: false },
  { label: "Concorrente\naparece primeiro",   alert: true  },
  { label: "Compara fotos\ne avaliações",     alert: false },
  { label: "Contato vai para\noutro negócio", alert: true  },
];

function LossFlowDiagram() {
  return (
    <View style={s.flowRow}>
      {FLOW_STEPS.map((step, i) => (
        <React.Fragment key={i}>
          <View style={step.alert ? s.flowBoxAlert : s.flowBox}>
            <Text style={s.flowStep}>ETAPA {i + 1}</Text>
            <Text style={s.flowLabel}>{step.label}</Text>
          </View>
          {i < FLOW_STEPS.length - 1 && (
            <View style={s.flowArrow}>
              <Text style={s.flowArrowText}>›</Text>
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <View style={s.clItem}>
      <View style={s.clBox} />
      <Text style={s.clText}>{text}</Text>
    </View>
  );
}

function PilaresBlock() {
  const pilar1Items = [
    "Você aparece no Maps quando alguém busca seu serviço",
    "Ligações e mensagens chegam sem pagar por clique",
    "Avaliações e posts constroem autoridade local 24h",
    "Relatório mensal mostra quantas pessoas viram o perfil",
  ];
  const pilar2Items = [
    "Cliente encontra você no Google e cai em página profissional",
    "Botão de WhatsApp direto — visita vira contato em segundos",
    "Serviços, diferenciais e avaliações apresentados do jeito certo",
    "SEO técnico que ajuda você a aparecer mais — sem pagar por clique",
  ];

  return (
    <View>
      <Text style={s.sectionTitle}>Os 2 Pilares que Fecham o Ciclo</Text>
      <View style={s.pilaresRow}>

        <View style={s.pilarCard}>
          <View style={[s.pilarHeader, { backgroundColor: C.blue }]}>
            <Text style={s.pilarNum}>PILAR 1</Text>
            <Text style={s.pilarTitle}>Google Meu Negócio</Text>
          </View>
          <View style={s.pilarBody}>
            {pilar1Items.map((item, i) => (
              <View key={i} style={s.pilarItem}>
                <Text style={s.pilarCheck}>✓</Text>
                <Text style={s.pilarItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.pilarDivider}>
          <View style={s.pilarPlus}>
            <Text style={s.pilarPlusText}>+</Text>
          </View>
        </View>

        <View style={s.pilarCard}>
          <View style={[s.pilarHeader, { backgroundColor: "#2563eb" }]}>
            <Text style={s.pilarNum}>PILAR 2</Text>
            <Text style={s.pilarTitle}>Site que Converte</Text>
          </View>
          <View style={s.pilarBody}>
            {pilar2Items.map((item, i) => (
              <View key={i} style={s.pilarItem}>
                <Text style={s.pilarCheck}>✓</Text>
                <Text style={s.pilarItemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

      </View>
      <View style={s.pilarFooter}>
        <Text style={s.pilarFooterText}>
          Um pilar leva o cliente até você. O outro faz ele entrar em contato.{"\n"}
          Os dois juntos fecham o ciclo — do Google até o WhatsApp.
        </Text>
      </View>
    </View>
  );
}

function postBadgeColor(type: string) {
  if (type === "Oferta")   return C.green;
  if (type === "Novidade") return C.amber;
  return C.blue;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EbookDocumentProps {
  businessName: string;
  city:         string;
  niche:        string;
  keyword:      string;
  content:      EbookContent;
}

// ─── Documento principal ──────────────────────────────────────────────────────

export function EbookDocument({ businessName, city, niche, content }: EbookDocumentProps) {
  const { scores, diagnosis, parsed } = content;

  return (
    <Document
      title={`Perfil GBP Otimizado — ${businessName}`}
      author="V2 Digital — Método Vitrine Local"
    >

      {/* ════════════════════════════════════════════════════════════════
          PÁGINA 1 — CAPA
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={[s.page, s.coverPage]}>
        <View style={s.coverInner}>
          {VITRINE_LOGO ? <Image src={VITRINE_LOGO} style={s.coverLogo} /> : null}
          <Text style={s.coverTag}>MÉTODO VITRINE LOCAL · V2 DIGITAL</Text>
          <Text style={s.coverSubtag}>Perfil Google Maps Otimizado</Text>
          <View style={s.coverDivider} />
          <Text style={s.coverTitle}>
            Guia de Implementação{"\n"}do Perfil GBP — {businessName}
          </Text>
          <Text style={s.coverSubtitle}>
            Conteúdo completo para configuração e otimização do Google Business Profile
            de {capitalize(niche)} em {city}
          </Text>
          <View style={s.pillRow}>
            {[capitalize(niche), "Google Meu Negócio", "SEO Local"].map((label, i) => (
              <View key={i} style={s.pill}>
                <Text style={s.pillText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.coverFooter}>
          <Text style={s.coverFooterText}>{city} · {capitalize(niche)}</Text>
          <Text style={s.coverFooterText}>{CONTACT_SITE}</Text>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════════
          PÁGINA 2 — DIAGNÓSTICO
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page}>
        <PageHeader title="Diagnóstico do Perfil Atual" sub="Por que implementar agora" />

        <View style={s.section}>
          <Text style={s.sectionTitle}>Pontuação do Perfil</Text>
          <ScoreBar label="Presença Local" value={scores.presencaLocal} />
          <ScoreBar label="Autoridade"     value={scores.autoridade} />
          <ScoreBar label="Conversão"      value={scores.conversao} />
          <ScoreBar label="Reputação"      value={scores.reputacao} />
          <ScoreBar label="Conteúdo"       value={scores.conteudo} />
          <Text style={{ fontSize: 6.5, color: C.grayLight, marginTop: 5, fontFamily: "Helvetica-Oblique" }}>
            * Pontuações estimadas com base em análise do segmento local.
          </Text>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Como Clientes São Perdidos Hoje</Text>
          <LossFlowDiagram />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Análise do Segmento</Text>
          {diagnosis.insightLines.map((line, i) => (
            <View key={i} style={s.insightQuote}>
              <Text style={s.insightText}>{line}</Text>
            </View>
          ))}
        </View>

        {diagnosis.segmentPatterns?.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Como Clientes de {capitalize(niche)} Decidem</Text>
            {diagnosis.segmentPatterns.map((pattern, i) => (
              <View key={i} style={s.cardBlue}>
                <Text style={s.bodyText}>{pattern}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.lostCallout}>
          <Text style={s.lostNumber}>{diagnosis.clientsLostEstimate}</Text>
          <View style={s.lostMeta}>
            <Text style={s.lostUnit}>clientes/mês (estimativa)</Text>
            <Text style={s.lostLabel}>
              contatos que provavelmente vão para o concorrente
            </Text>
          </View>
        </View>

        <PageNum />
      </Page>

      {/* ════════════════════════════════════════════════════════════════
          PÁGINAS 3+ — CONTEÚDO (auto-paginado, sem espaços em branco)
      ════════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={s.page} wrap>
        <PageNum />

        {/* ── Identidade ── */}
        <View wrap={false}>
          <PageHeader title="Identidade do Perfil" sub="Nome, categorias e descrição otimizados" />
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Nome Otimizado para Busca Local</Text>
          <View style={s.nameBox}>
            <Text style={s.nameSuggestion}>{parsed.nameOptimized}</Text>
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Categorias Recomendadas</Text>
          {parsed.categoryPrimary ? (
            <View style={s.catPrimary}>
              <Text style={s.catPrimaryText}>Principal: {parsed.categoryPrimary}</Text>
            </View>
          ) : null}
          {parsed.categoriesAdditional.length > 0 && (
            <View style={s.catRow}>
              {parsed.categoriesAdditional.map((cat, i) => (
                <View key={i} style={s.catPill}>
                  <Text style={s.catPillText}>{cat}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Descrição do Perfil</Text>
          <View style={s.descBox}>
            <Text style={s.descText}>{parsed.description}</Text>
            <Text style={s.descCount}>
              {parsed.description?.length ?? 0} caracteres (máx. 750)
            </Text>
          </View>
        </View>

        {/* ── Serviços ── */}
        <View style={[s.section, { marginTop: 6 }]} wrap={false} minPresenceAhead={40}>
          <PageHeader title="Serviços" sub="Cadastre no GBP exatamente como descrito abaixo" />
          <Text style={s.sectionTitle}>Lista de Serviços ({parsed.services.length} itens)</Text>
        </View>
        {parsed.services.map((svc, i) => (
          <View key={i} style={s.serviceItem} wrap={false}>
            <Text style={s.serviceTitle}>{svc.title}</Text>
            <Text style={s.serviceDesc}>{svc.description}</Text>
          </View>
        ))}

        {/* ── Q&A ── */}
        <View style={[s.section, { marginTop: 6 }]} wrap={false} minPresenceAhead={40}>
          <PageHeader title="Perguntas & Respostas" sub="Publique no GBP — aumenta conversão e SEO local" />
          <Text style={s.sectionTitle}>Q&A para Publicar no Perfil ({parsed.faqQuestions.length} perguntas)</Text>
        </View>
        {parsed.faqQuestions.map((q, i) => (
          <View key={i} style={s.faqItem} wrap={false}>
            <Text style={s.faqQuestion}>P: {q}</Text>
            <Text style={s.faqAnswer}>R: {parsed.faqAnswers[i] ?? "—"}</Text>
          </View>
        ))}

        {/* ── Avaliações ── */}
        <View style={[s.section, { marginTop: 6 }]} wrap={false} minPresenceAhead={40}>
          <PageHeader title="Avaliações & Postagens" sub="Respostas prontas e posts para publicar agora" />
          <Text style={s.sectionTitle}>Modelos de Resposta a Avaliações</Text>
        </View>
        {parsed.reviewTemplates.positive.map((text, i) => (
          <View key={i} style={s.reviewBox5} wrap={false}>
            <Text style={[s.reviewLabel, { color: C.green }]}>{"★★★★★"}  5 ESTRELAS — Modelo {i + 1}</Text>
            <Text style={[s.reviewText, { color: C.greenDark }]}>{text}</Text>
          </View>
        ))}
        {parsed.reviewTemplates.neutral.map((text, i) => (
          <View key={i} style={s.reviewBox3} wrap={false}>
            <Text style={[s.reviewLabel, { color: C.amber }]}>{"★★★"}  3 ESTRELAS — Modelo {i + 1}</Text>
            <Text style={[s.reviewText, { color: "#92400e" }]}>{text}</Text>
          </View>
        ))}
        {parsed.reviewTemplates.negative.map((text, i) => (
          <View key={i} style={s.reviewBox1} wrap={false}>
            <Text style={[s.reviewLabel, { color: C.red }]}>{"★"}  1–2 ESTRELAS — Modelo {i + 1}</Text>
            <Text style={[s.reviewText, { color: C.redDark }]}>{text}</Text>
          </View>
        ))}

        {/* ── Posts GBP ── */}
        {parsed.posts.length > 0 && (
          <>
            <View style={{ marginTop: 6 }} wrap={false} minPresenceAhead={40}>
              <Text style={s.sectionTitle}>Postagens para o GBP</Text>
            </View>
            {parsed.posts.map((post, i) => (
              <View key={i} style={s.postBox} wrap={false}>
                <View style={s.postHeader}>
                  <View style={[s.postTypeBadge, { backgroundColor: postBadgeColor(post.type) }]}>
                    <Text style={s.postTypeText}>{post.type.toUpperCase()}</Text>
                  </View>
                  <Text style={s.postTitle}>{post.title}</Text>
                </View>
                <Text style={s.postBody}>{post.body}</Text>
                <Text style={s.postCta}>{post.cta} →</Text>
              </View>
            ))}
          </>
        )}

        {/* ── Plano de Ação ── */}
        <View style={[s.section, { marginTop: 6 }]} wrap={false} minPresenceAhead={40}>
          <PageHeader title="Plano de Ação" sub="Execute na ordem abaixo para resultados mais rápidos" />
        </View>

        {parsed.checklistItems.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Checklist de Implementação ({parsed.checklistItems.length} ações)</Text>
            {parsed.checklistItems.map((item, i) => (
              <CheckItem key={i} text={item} />
            ))}
          </View>
        )}

        {parsed.photoFiles.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Arquivos de Mídia para Upload</Text>
            <View style={s.photoRow}>
              {parsed.photoFiles.map((photo, i) => (
                <View key={i} style={s.photoItem}>
                  <Text style={s.photoDot}>{">"}</Text>
                  <Text style={s.photoText}>{photo}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── 2 Pilares ── */}
        <View style={s.section} wrap={false} minPresenceAhead={80}>
          <PilaresBlock />
        </View>

        {/* ── CTA ── */}
        <View style={s.ctaBox} wrap={false}>
          <Text style={s.ctaHeadline}>{CTA_HEADLINE}</Text>
          <Text style={s.ctaSub}>{CTA_SUB}</Text>
          <View style={s.ctaButton}>
            <Text style={s.ctaButtonText}>{CTA_BUTTON}</Text>
          </View>
          <Text style={s.ctaContact}>{CONTACT_PHONE} · {CONTACT_SITE}</Text>
        </View>

      </Page>

    </Document>
  );
}
