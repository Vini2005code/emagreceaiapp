import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Target, Flame, Footprints, Apple } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Mission } from "@/types/app";

const initialMissions: Mission[] = [
  {
    id: "1",
    title: "Beber 500ml de água em jejum",
    description: "Hidrate-se logo ao acordar",
    completed: false,
    icon: "water",
  },
  {
    id: "2",
    title: "Caminhar 20 minutos",
    description: "Movimento é essencial",
    completed: false,
    icon: "walk",
  },
  {
    id: "3",
    title: "Evitar açúcar hoje",
    description: "Seu corpo agradece",
    completed: false,
    icon: "apple",
  },
];

const iconMap: Record<string, typeof Target> = {
  water: Flame,
  walk: Footprints,
  apple: Apple,
};

export function DailyMissions() {
  const [missions, setMissions] = useState<Mission[]>(initialMissions);
  const completedCount = missions.filter((m) => m.completed).length;

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  return (
    <Card variant="gradient">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Missões do Dia</CardTitle>
          </div>
          <span className="text-sm font-bold text-primary">
            {completedCount}/{missions.length}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full gradient-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / missions.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {missions.map((mission) => {
            const Icon = iconMap[mission.icon] || Target;
            return (
              <motion.div
                key={mission.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
                  mission.completed
                    ? "bg-success/10 border border-success/30"
                    : "bg-secondary/50 border border-border"
                }`}
              >
                <Button
                  size="iconSm"
                  variant={mission.completed ? "success" : "outline"}
                  onClick={() => toggleMission(mission.id)}
                  className="shrink-0"
                >
                  {mission.completed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium text-sm ${
                      mission.completed ? "line-through text-muted-foreground" : ""
                    }`}
                  >
                    {mission.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {mission.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
