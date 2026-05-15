import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceDialog } from "@/components/services/service-dialog";
import { Plus, RefreshCw, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function ServicosPage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Serviços"
        description="Catálogo de serviços oferecidos pela agência"
        action={
          <ServiceDialog>
            <Button size="sm"><Plus className="h-4 w-4" />Novo Serviço</Button>
          </ServiceDialog>
        }
      />

      <div className="p-6">
        {!services?.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground mb-4">Nenhum serviço cadastrado</p>
            <ServiceDialog>
              <Button size="sm"><Plus className="h-4 w-4" />Novo Serviço</Button>
            </ServiceDialog>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Card key={service.id} className="hover:border-border/60 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        <Badge variant={service.type === "recorrente" ? "info" : "secondary"} className="text-xs mt-1">
                          {service.type === "recorrente" ? (
                            <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" />Recorrente</span>
                          ) : "Único"}
                        </Badge>
                      </div>
                    </div>
                    <ServiceDialog service={service as Parameters<typeof ServiceDialog>[0]["service"]}>
                      <Button variant="ghost" size="sm" className="text-xs">Editar</Button>
                    </ServiceDialog>
                  </div>

                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{service.description}</p>
                  )}

                  {service.base_price && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground">Preço base</p>
                      <p className="text-lg font-bold">{formatCurrency(service.base_price)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
