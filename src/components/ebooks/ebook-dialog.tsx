"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EbookForm } from "./ebook-form";

interface EbookDialogProps {
  children: React.ReactNode;
}

export function EbookDialog({ children }: EbookDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl flex flex-col p-0 gap-0 max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b border-border">
          <DialogTitle>Gerar Ebook — Google Business Profile</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <EbookForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
