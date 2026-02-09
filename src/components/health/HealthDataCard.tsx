import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useHealthData } from "@/hooks/useHealthData";
import { Footprints, Flame, RefreshCw, Loader2 } from "lucide-react";

export function HealthDataCard() {
  const { language } = useLanguage();
  const pt = language === "pt";
  const { data, isSyncing, syncHealthData, setManualData } = useHealthData();
  const [manualSteps, setManualSteps] = useState("");

  const handleSync = async () => {
    const success = await syncHealthData();
    if (!success) {
      // Fallback: show manual input
    }
  };

  const handleManualSave = () => {
    const steps = parseInt(manualSteps);
    if (steps > 0) {
      setManualData(steps);
      setManualSteps("");
    }
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Footprints className="h-5 w-5 text-primary" />
          {pt ? "Dados de Saúde" : "Health Data"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Footprints className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{pt ? "Passos" : "Steps"}</p>
            <p className="text-lg font-bold text-foreground">
              {data.steps?.toLocaleString() ?? "—"}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">{pt ? "Cal. ativas" : "Active cal."}</p>
            <p className="text-lg font-bold text-foreground">
              {data.activeCalories ?? "—"} <span className="text-xs font-normal">kcal</span>
            </p>
          </div>
        </div>

        {data.lastSync && (
          <p className="text-xs text-muted-foreground text-center">
            {pt ? "Última sincronização:" : "Last sync:"}{" "}
            {new Date(data.lastSync).toLocaleString(pt ? "pt-BR" : "en-US")}
          </p>
        )}

        <Button variant="outline" size="sm" className="w-full" onClick={handleSync} disabled={isSyncing}>
          {isSyncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          {pt ? "Sincronizar" : "Sync"}
        </Button>

        {/* Manual input fallback */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {pt ? "Ou insira manualmente:" : "Or enter manually:"}
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder={pt ? "Passos hoje" : "Steps today"}
              value={manualSteps}
              onChange={(e) => setManualSteps(e.target.value)}
              className="h-8 text-sm"
              min={0}
            />
            <Button size="sm" onClick={handleManualSave} disabled={!manualSteps}>
              {pt ? "Salvar" : "Save"}
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center italic">
          {pt
            ? "💡 Seus passos ajustam automaticamente sua meta calórica diária"
            : "💡 Your steps automatically adjust your daily caloric goal"}
        </p>
      </CardContent>
    </Card>
  );
}
