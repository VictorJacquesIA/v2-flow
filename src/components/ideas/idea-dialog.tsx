"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createIdeaAction, updateIdeaAction } from "@/app/actions/ideas";
import type { Idea } from "@/types";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IdeaDialogProps {
  children: React.ReactNode;
  idea?: Idea;
}

export function IdeaDialog({ children, idea }: IdeaDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(idea?.stage ?? "ideia");
  const [potential, setPotential] = useState(idea?.potential ?? "medio");
  const [difficulty, setDifficulty] = useState(idea?.difficulty ?? "medio");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("stage", stage);
      formData.set("potential", potential);
      formData.set("difficulty", difficulty);

      if (idea) {
        await updateIdeaAction(idea.id, formData);
        toast({ title: "Ideia atualizada" });
      } else {
        await createIdeaAction(formData);
        toast({ title: "Ideia registrada" });
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Erro ao salvar ideia", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{idea ? "Editar Ideia" : "Nova Ideia"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" defaultValue={idea?.title} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input id="category" name="category" defaultValue={idea?.category ?? ""} placeholder="Ex: SaaS, Conteúdo" />
            </div>
            <div className="space-y-2">
              <Label>Estágio</Label>
              <Select value={stage} onValueChange={(v) => setStage(v as typeof stage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ideia">Ideia</SelectItem>
                  <SelectItem value="validando">Validando</SelectItem>
                  <SelectItem value="em_construcao">Em Construção</SelectItem>
                  <SelectItem value="pausada">Pausada</SelectItem>
                  <SelectItem value="descartada">Descartada</SelectItem>
                  <SelectItem value="lancada">Lançada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Potencial</Label>
              <Select value={potential} onValueChange={(v) => setPotential(v as typeof potential)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" name="description" defaultValue={idea?.description ?? ""} rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monetization">Como monetizar</Label>
            <Input id="monetization" name="monetization" defaultValue={idea?.monetization ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="next_steps">Próximos Passos</Label>
            <Textarea id="next_steps" name="next_steps" defaultValue={idea?.next_steps ?? ""} rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {idea ? "Salvar" : "Registrar Ideia"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
