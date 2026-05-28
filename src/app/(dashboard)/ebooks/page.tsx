import { getEbookGenerations } from "@/app/actions/ebooks";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EbookDialog } from "@/components/ebooks/ebook-dialog";
import { EbookDeleteButton } from "@/components/ebooks/ebook-delete-button";
import { BookOpen, Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default async function EbooksPage() {
  const ebooks = await getEbookGenerations();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Gerador de Ebook"
        description={`${ebooks.length} ebook${ebooks.length !== 1 ? "s" : ""} gerado${ebooks.length !== 1 ? "s" : ""}`}
        action={
          <EbookDialog>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Gerar Ebook
            </Button>
          </EbookDialog>
        }
      />

      <div className="p-6 space-y-6">
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">Ebook Google Business Profile</p>
                <p className="text-sm text-muted-foreground">
                  Guia completo de 5 páginas personalizado para o negócio do prospecto. Preencha 4
                  campos e o PDF baixa em segundos.
                </p>
              </div>
              <EbookDialog>
                <Button>
                  <BookOpen className="h-4 w-4" />
                  Gerar Agora
                </Button>
              </EbookDialog>
            </div>
          </CardContent>
        </Card>

        {ebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">Nenhum ebook gerado ainda</p>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do prospecto e baixe o ebook em segundos.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Histórico
            </p>
            {ebooks.map((ebook) => (
              <div
                key={ebook.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:border-border/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{ebook.business_name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {ebook.city}
                      </span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {ebook.niche}
                      </Badge>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground italic">
                        &ldquo;{ebook.keyword}&rdquo;
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatDateTime(ebook.created_at)}
                  </span>
                  <EbookDeleteButton id={ebook.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
