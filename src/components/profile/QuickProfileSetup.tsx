import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Target, ArrowRight, Loader2 } from "lucide-react";

export function QuickProfileSetup({ onComplete }: { onComplete: () => void }) {
  const { profile, updateProfile, isLoading } = useUserProfile();
  const [data, setData] = useState({
    weight: profile.weight || "",
    height: profile.height || "",
    age: profile.age || "",
    goalWeight: profile.goalWeight || ""
  });

  const handleSave = async () => {
    if (!data.weight || !data.height) return;
    await updateProfile({
      ...profile,
      weight: Number(data.weight),
      height: Number(data.height),
      age: Number(data.age),
      goalWeight: Number(data.goalWeight),
      onboardingCompleted: true
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-strong border-border/50 shadow-2xl">
        <CardHeader className="text-center">
          <div className="w-14 h-14 gradient-teal rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="text-white h-7 w-7" />
          </div>
          <CardTitle>Configuração Rápida</CardTitle>
          <p className="text-xs text-muted-foreground mt-2">Personalize sua IA com seus dados atuais.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Peso Atual (kg)</Label>
              <Input type="number" placeholder="70" value={data.weight} onChange={e => setData({...data, weight: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Altura (cm)</Label>
              <Input type="number" placeholder="170" value={data.height} onChange={e => setData({...data, height: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Sua Idade</Label>
              <Input type="number" placeholder="25" value={data.age} onChange={e => setData({...data, age: e.target.value})} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Meta de Peso</Label>
              <Input type="number" placeholder="65" value={data.goalWeight} onChange={e => setData({...data, goalWeight: e.target.value})} className="h-12" />
            </div>
          </div>
          <Button onClick={handleSave} className="w-full h-14 text-lg font-bold gradient-teal rounded-xl" disabled={isLoading || !data.weight || !data.height}>
            {isLoading ? <Loader2 className="animate-spin" /> : "Ativar Meu Plano AI"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
