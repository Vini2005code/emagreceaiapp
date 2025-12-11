import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface WaterProgressProps {
  targetMl?: number;
}

export function WaterProgress({ targetMl = 2500 }: WaterProgressProps) {
  const { t } = useLanguage();
  const [currentMl, setCurrentMl] = useState(800);
  const percentage = Math.min((currentMl / targetMl) * 100, 100);

  const addWater = (amount: number) => {
    setCurrentMl((prev) => Math.max(0, Math.min(prev + amount, targetMl + 500)));
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">{t("dashboard.hydration")}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-28 rounded-2xl border-2 border-primary/30 overflow-hidden bg-primary/5">
            <motion.div
              className="absolute bottom-0 left-0 right-0 gradient-primary"
              initial={{ height: 0 }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Droplets className="h-8 w-8 text-primary/40" />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-foreground">
              {(currentMl / 1000).toFixed(1)}L
            </div>
            <p className="text-sm text-muted-foreground">
              {t("water.of")} {(targetMl / 1000).toFixed(1)}L
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addWater(-250)}
                disabled={currentMl <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={() => addWater(250)}
                className="flex-1"
              >
                <Plus className="h-4 w-4 mr-1" />
                250ml
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
