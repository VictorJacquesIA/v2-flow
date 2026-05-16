import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, Database, Key, User } from "lucide-react";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Configurações"
        description="Informações do sistema e conta"
      />

      <div className="p-6 space-y-6 max-w-2xl">
        {/* Conta */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">Conta</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">ID do usuário</span>
              <span className="text-xs font-mono text-muted-foreground">{user?.id?.slice(0, 8)}...</span>
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Versão</span>
              <Badge variant="secondary">v0.1.0 MVP</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stack</span>
              <span className="text-sm">Next.js 14 · Supabase · Tailwind</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Banco de dados</span>
              <Badge variant="success">Conectado</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm">Segurança</CardTitle>
              <CardDescription className="text-xs ml-auto">Cofre de Acessos</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Criptografia de senhas</span>
              <Badge variant={process.env.ENCRYPTION_KEY ? "success" : "warning"}>
                {process.env.ENCRYPTION_KEY ? "AES-256-GCM ativo" : "Configure ENCRYPTION_KEY"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
