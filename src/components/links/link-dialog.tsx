"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createLinkAction } from "@/app/actions/links";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LinkDialogProps {
  children: React.ReactNode;
  clientId?: string;
  projectId?: string;
}

export function LinkDialog({ children, clientId, projectId }: LinkDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("outro");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("category", category);
      if (clientId) formData.set("client_id", clientId);
      if (projectId) formData.set("project_id", projectId);
      await createLinkAction(formData);
      toast({ title: "Link salvo" });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ title: "Erro ao salvar link", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Novo Link</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input id="url" name="url" type="url" required placeholder="https://" />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="vercel">Vercel</SelectItem>
                <SelectItem value="analytics">Google Analytics</SelectItem>
                <SelectItem value="search_console">Search Console</SelectItem>
                <SelectItem value="tag_manager">Tag Manager</SelectItem>
                <SelectItem value="clarity">Microsoft Clarity</SelectItem>
                <SelectItem value="meta_pixel">Meta Pixel</SelectItem>
                <SelectItem value="canva">Canva</SelectItem>
                <SelectItem value="drive">Google Drive</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="dominio">Domínio</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Link
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
