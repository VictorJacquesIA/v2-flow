import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ebookFileName } from "@/lib/utils";
import { generateEbookContent } from "@/lib/ai/generate-ebook-content";
import type { EbookFormData } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: EbookFormData;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { businessName, city, niche, keyword, gbpPackageText } = body;

  if (!businessName || !city || !niche || !keyword || !gbpPackageText?.trim()) {
    return NextResponse.json(
      { error: "Preencha todos os campos obrigatórios, incluindo o Pacote GBP" },
      { status: 400 }
    );
  }

  let content;
  try {
    content = await generateEbookContent(body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao gerar conteúdo com IA";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const [{ renderToBuffer }, { EbookDocument }, { default: React }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/ebooks/ebook-document"),
    import("react"),
  ]);

  const element = React.createElement(EbookDocument, {
    businessName,
    city,
    niche,
    keyword,
    content,
  } as any) as unknown as React.ReactElement;

  const [buffer, fileName] = await Promise.all([
    renderToBuffer(element),
    Promise.resolve(ebookFileName(businessName)),
  ]);

  // Upload para Supabase Storage
  let storage_url: string | null = null;
  const { data: uploadData } = await supabase.storage
    .from("ebooks")
    .upload(fileName, new Uint8Array(buffer), {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadData) {
    const { data: urlData } = supabase.storage.from("ebooks").getPublicUrl(uploadData.path);
    storage_url = urlData.publicUrl;
  }

  await supabase
    .from("ebook_generations")
    .insert([{ business_name: businessName, city, niche, keyword, file_name: fileName, storage_url }]);

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}
