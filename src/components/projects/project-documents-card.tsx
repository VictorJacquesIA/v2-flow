"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadDocumentAction, getDownloadUrlAction, deleteDocumentAction } from "@/app/actions/documents";
import { useToast } from "@/hooks/use-toast";
import {
  FileText, Upload, Download, Trash2, Loader2,
  FileImage, File, Plus, FolderOpen,
} from "lucide-react";

interface Document {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category: string;
  notes: string | null;
  created_at: string;
}

interface ProjectDocumentsCardProps {
  projectId: string;
  documents: Document[];
}

const categoryLabels: Record<string, string> = {
  contrato: "Contrato",
  proposta: "Proposta",
  checklist: "Checklist",
  briefing: "Briefing",
  comprovante: "Comprovante",
  imagem: "Imagem",
  outro: "Outro",
};

const categoryVariants: Record<string, "default" | "secondary" | "success" | "info" | "warning" | "purple"> = {
  contrato: "purple",
  proposta: "info",
  checklist: "success",
  briefing: "warning",
  comprovante: "success",
  imagem: "secondary",
  outro: "secondary",
};

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(date));
}

function FileIcon({ type }: { type: string | null }) {
  if (type?.startsWith("image/")) return <FileImage className="h-4 w-4 text-blue-400" />;
  if (type === "application/pdf") return <FileText className="h-4 w-4 text-red-400" />;
  return <File className="h-4 w-4 text-muted-foreground" />;
}

const ACCEPTED = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp";
const MAX_SIZE = 10 * 1024 * 1024;

export function ProjectDocumentsCard({ projectId, documents }: ProjectDocumentsCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState("outro");
  const [notes, setNotes] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) return;
    if (file.size > MAX_SIZE) {
      setFileError("Arquivo muito grande. Máximo 10MB.");
      return;
    }
    setSelectedFile(file);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", selectedFile);
      formData.set("project_id", projectId);
      formData.set("category", category);
      formData.set("notes", notes);
      await uploadDocumentAction(formData);
      toast({ title: "Documento enviado com sucesso" });
      setOpen(false);
      setSelectedFile(null);
      setCategory("outro");
      setNotes("");
      router.refresh();
    } catch (err) {
      toast({ title: "Erro ao enviar documento", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(doc: Document) {
    setDownloading(doc.id);
    try {
      const url = await getDownloadUrlAction(doc.file_path);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      a.click();
    } catch {
      toast({ title: "Erro ao baixar documento", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Excluir "${doc.file_name}"? Esta ação não pode ser desfeita.`)) return;
    setDeleting(doc.id);
    try {
      await deleteDocumentAction(doc.id, doc.file_path, projectId);
      toast({ title: "Documento excluído" });
      router.refresh();
    } catch {
      toast({ title: "Erro ao excluir documento", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium">
                Documentos do Projeto
              </CardTitle>
              {documents.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                  {documents.length}
                </span>
              )}
            </div>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Enviar documento
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Nenhum documento enviado ainda
              </p>
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4" />
                Enviar primeiro documento
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileIcon type={doc.file_type} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <Badge
                          variant={categoryVariants[doc.category] ?? "secondary"}
                          className="text-xs"
                        >
                          {categoryLabels[doc.category] ?? doc.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatBytes(doc.file_size)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </span>
                      </div>
                      {doc.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {doc.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      title="Baixar"
                    >
                      {downloading === doc.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Download className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(doc)}
                      disabled={deleting === doc.id}
                      title="Excluir"
                    >
                      {deleting === doc.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de upload */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSelectedFile(null); setFileError(null); setNotes(""); setCategory("outro"); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar Documento</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* File input */}
            <div className="space-y-2">
              <Label>Arquivo *</Label>
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium truncate max-w-[250px]">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatBytes(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, PNG, JPG, WEBP · Máx 10MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={handleFileChange}
                className="hidden"
              />
              {fileError && <p className="text-xs text-destructive">{fileError}</p>}
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contrato">Contrato</SelectItem>
                  <SelectItem value="proposta">Proposta</SelectItem>
                  <SelectItem value="checklist">Checklist</SelectItem>
                  <SelectItem value="briefing">Briefing</SelectItem>
                  <SelectItem value="comprovante">Comprovante</SelectItem>
                  <SelectItem value="imagem">Imagem</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observação <span className="text-muted-foreground">(opcional)</span></Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Contrato assinado pelo cliente em maio/2026"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!selectedFile || uploading || !!fileError}>
                {uploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Enviando...</>
                ) : (
                  <><Upload className="h-4 w-4" />Enviar</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
