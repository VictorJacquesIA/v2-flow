import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IdeaDialog } from "@/components/ideas/idea-dialog";
import { Plus, TrendingUp, Zap } from "lucide-react";

const stageConfig: Record<string, { label: string; variant: "default" | "secondary" | "success" | "warning" | "info" | "destructive" | "purple" }> = {
  ideia: { label: "Ideia", variant: "secondary" },
  validando: { label: "Validando", variant: "info" },
  em_construcao: { label: "Em Construção", variant: "warning" },
  pausada: { label: "Pausada", variant: "secondary" },
  descartada: { label: "Descartada", variant: "destructive" },
  lancada: { label: "Lançada", variant: "success" },
};

const potentialConfig: Record<string, string> = {
  alto: "text-emerald-400",
  medio: "text-amber-400",
  baixo: "text-muted-foreground",
};

const difficultyConfig: Record<string, string> = {
  facil: "text-emerald-400",
  medio: "text-amber-400",
  dificil: "text-red-400",
};

export default async function IdeiasPage() {
  const supabase = await createClient();
  const { data: ideas } = await supabase
    .from("ideas")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Banco de Ideias"
        description={`${ideas?.length ?? 0} ideias registradas`}
        action={
          <IdeaDialog>
            <Button size="sm"><Plus className="h-4 w-4" />Nova Ideia</Button>
          </IdeaDialog>
        }
      />

      <div className="p-6">
        {!ideas?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Zap className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Nenhuma ideia registrada ainda</p>
            <IdeaDialog>
              <Button size="sm"><Plus className="h-4 w-4" />Nova Ideia</Button>
            </IdeaDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => {
              const sc = stageConfig[idea.stage] ?? stageConfig.ideia;
              return (
                <Card key={idea.id} className="hover:border-border/60 transition-colors">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold leading-tight">{idea.title}</p>
                      <Badge variant={sc.variant} className="text-xs shrink-0">{sc.label}</Badge>
                    </div>

                    {idea.category && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{idea.category}</span>
                    )}

                    {idea.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{idea.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs">
                      <span className={potentialConfig[idea.potential]}>
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        Potencial: {idea.potential}
                      </span>
                      <span className={difficultyConfig[idea.difficulty]}>
                        Dificuldade: {idea.difficulty}
                      </span>
                    </div>

                    {idea.monetization && (
                      <p className="text-xs text-muted-foreground border-t border-border pt-2">
                        💰 {idea.monetization}
                      </p>
                    )}

                    <div className="flex justify-end">
                      <IdeaDialog idea={idea as Parameters<typeof IdeaDialog>[0]["idea"]}>
                        <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                      </IdeaDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
