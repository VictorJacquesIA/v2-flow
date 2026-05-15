"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ClientForm } from "./client-form";
import type { Client } from "@/types";

interface ClientDialogProps {
  children: React.ReactNode;
  client?: Client;
}

export function ClientDialog({ children, client }: ClientDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <ClientForm client={client} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
