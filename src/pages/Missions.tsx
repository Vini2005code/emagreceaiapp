import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trophy, Star, Target, Zap, Flame, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Mission } from "@/types/app";

const iconMap: Record<string, typeof Target> = {
  water: Zap,
  walk: Heart,
  sugar: Star,
  sleep: Target,
  fruit: Flame,
};

const Missions = () => {
  const { t } = useLanguage();

  const dailyMissions: Mission[] = [
    { id: "1", title: t("missions.mission1.title"), description: t("missions.mission1.desc"), completed: false, icon: "water" },
    { id: "2", title: t("missions.mission2.title"), description: t("missions.mission2.desc"), completed: false, icon: "walk" },
    { id: "3", title: t("missions.mission3.title"), description: t("missions.mission3.desc"), completed: false, icon: "sugar" },
    { id: "4", title: t("missions.mission4.title"), description: t("missions.mission4.desc"), completed: false, icon: "sleep" },
    { id: "5", title: t("missions.mission5.title"), description: t("missions.mission5.desc"), completed: false, icon: "fruit" },
  ];

  const [missions, setMissions] = useState<Mission[]>(dailyMissions);
  const completedCount = missions.filter((m) => m.completed).length;
  const totalPoints = completedCount * 10;

  const toggleMission = (id: string) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  return (
    <AppLayout title={t("missions.daily")} subtitle={t("missions.subtitle")}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="primary" className="text-center">
            <CardContent className="py-6">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-primary-foreground" />
              <h2 className="text-3xl font-bold text-primary-foreground mb-1">
                {totalPoints} {t("missions.points")}
              </h2>
              <p className="text-primary-foreground/80">
                {completedCount} {t("general.of")} {missions.length} {t("missions.completed")}
              </p>
              <div className="mt-4 h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / missions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t("missions.today")}
          </h3>
          
          <AnimatePresence>
            {missions.map((mission, index) => {
              const Icon = iconMap[mission.icon] || Target;
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <Card
                    variant={mission.completed ? "default" : "interactive"}
                    className={mission.completed ? "border-success/50 bg-success/5" : ""}
                    onClick={() => toggleMission(mission.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <Button
                        size="icon"
                        variant={mission.completed ? "success" : "outline"}
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMission(mission.id);
                        }}
                      >
                        {mission.completed ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold ${
                            mission.completed
                              ? "line-through text-muted-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {mission.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {mission.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold ${
                            mission.completed ? "text-success" : "text-primary"
                          }`}
                        >
                          +10 pts
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {completedCount === missions.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card variant="accent" className="text-center">
              <CardContent className="py-6">
                <Star className="h-12 w-12 mx-auto mb-3 text-accent-foreground animate-bounce-soft" />
                <h3 className="text-xl font-bold text-accent-foreground">
                  {t("missions.congrats")}
                </h3>
                <p className="text-accent-foreground/80">
                  {t("missions.allComplete")}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Missions;
