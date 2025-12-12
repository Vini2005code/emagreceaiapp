import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trophy, Star, Target, Zap, Flame, Heart, Plus, Dumbbell, Brain, ArrowUp, Salad, Moon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Mission } from "@/types/app";

const iconMap: Record<string, typeof Target> = {
  water: Zap,
  walk: Heart,
  sugar: Star,
  sleep: Target,
  fruit: Flame,
  pushups: Dumbbell,
  meditate: Brain,
  stairs: ArrowUp,
  veggies: Salad,
  noEat: Moon,
  custom: Target,
};

const Missions = () => {
  const { t } = useLanguage();

  const dailyMissions: Mission[] = [
    { id: "1", title: t("missions.mission1.title"), description: t("missions.mission1.desc"), completed: false, icon: "water" },
    { id: "2", title: t("missions.mission2.title"), description: t("missions.mission2.desc"), completed: false, icon: "walk" },
    { id: "3", title: t("missions.mission3.title"), description: t("missions.mission3.desc"), completed: false, icon: "sugar" },
    { id: "4", title: t("missions.mission4.title"), description: t("missions.mission4.desc"), completed: false, icon: "sleep" },
    { id: "5", title: t("missions.mission5.title"), description: t("missions.mission5.desc"), completed: false, icon: "fruit" },
    { id: "6", title: t("missions.mission6.title"), description: t("missions.mission6.desc"), completed: false, icon: "pushups" },
    { id: "7", title: t("missions.mission7.title"), description: t("missions.mission7.desc"), completed: false, icon: "meditate" },
    { id: "8", title: t("missions.mission8.title"), description: t("missions.mission8.desc"), completed: false, icon: "stairs" },
    { id: "9", title: t("missions.mission9.title"), description: t("missions.mission9.desc"), completed: false, icon: "veggies" },
    { id: "10", title: t("missions.mission10.title"), description: t("missions.mission10.desc"), completed: false, icon: "noEat" },
  ];

  const [missions, setMissions] = useState<Mission[]>(dailyMissions.slice(0, 5));
  const [customMissions, setCustomMissions] = useState<Mission[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const allMissions = [...missions, ...customMissions];
  const completedCount = allMissions.filter((m) => m.completed).length;
  const totalPoints = completedCount * 10;

  const toggleMission = (id: string, isCustom: boolean) => {
    if (isCustom) {
      setCustomMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
      );
    } else {
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
      );
    }
  };

  const addCustomMission = () => {
    if (!newTitle.trim()) return;
    const newMission: Mission = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "",
      completed: false,
      icon: "custom",
    };
    setCustomMissions((prev) => [...prev, newMission]);
    setNewTitle("");
    setNewDesc("");
  };

  const deleteCustomMission = (id: string) => {
    setCustomMissions((prev) => prev.filter((m) => m.id !== id));
  };

  const addSuggestedMission = (mission: Mission) => {
    if (!missions.find((m) => m.id === mission.id)) {
      setMissions((prev) => [...prev, mission]);
    }
  };

  const removeSuggestedMission = (id: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== id));
  };

  const renderMissionCard = (mission: Mission, index: number, isCustom: boolean = false) => {
    const Icon = iconMap[mission.icon] || Target;
    return (
      <motion.div
        key={mission.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        layout
      >
        <Card
          variant={mission.completed ? "default" : "interactive"}
          className={mission.completed ? "border-success/50 bg-success/5" : ""}
          onClick={() => toggleMission(mission.id, isCustom)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <Button
              size="icon"
              variant={mission.completed ? "success" : "outline"}
              className="shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleMission(mission.id, isCustom);
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
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-sm font-bold ${
                  mission.completed ? "text-success" : "text-primary"
                }`}
              >
                +10 pts
              </span>
              {isCustom && (
                <Button
                  size="iconSm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCustomMission(mission.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const availableSuggested = dailyMissions.filter(
    (m) => !missions.find((active) => active.id === m.id)
  );

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
                {completedCount} {t("general.of")} {allMissions.length} {t("missions.completed")}
              </p>
              <div className="mt-4 h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${allMissions.length > 0 ? (completedCount / allMissions.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">{t("missions.today")}</TabsTrigger>
            <TabsTrigger value="suggested">{t("missions.suggested")}</TabsTrigger>
            <TabsTrigger value="custom">{t("missions.custom")}</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3 mt-4">
            <AnimatePresence>
              {missions.map((mission, index) => (
                <div key={mission.id} className="relative">
                  {renderMissionCard(mission, index, false)}
                  <Button
                    size="iconSm"
                    variant="ghost"
                    className="absolute top-2 right-2"
                    onClick={() => removeSuggestedMission(mission.id)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {customMissions.map((mission, index) =>
                renderMissionCard(mission, missions.length + index, true)
              )}
            </AnimatePresence>

            {allMissions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t("missions.noCustom")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="suggested" className="space-y-3 mt-4">
            <p className="text-sm text-muted-foreground mb-3">
              {t("missions.suggested")}
            </p>
            {availableSuggested.map((mission, index) => {
              const Icon = iconMap[mission.icon] || Target;
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card variant="interactive" onClick={() => addSuggestedMission(mission)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{mission.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{mission.description}</p>
                      </div>
                      <Button size="iconSm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            {availableSuggested.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-3 text-success" />
                  <p>{t("missions.allComplete")}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  {t("missions.addCustom")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder={t("missions.customTitle")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomMission()}
                />
                <Input
                  placeholder={t("missions.customDesc")}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addCustomMission()}
                />
                <Button onClick={addCustomMission} className="w-full" disabled={!newTitle.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("missions.add")}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {t("missions.customMissions")}
              </h3>
              <AnimatePresence>
                {customMissions.map((mission, index) =>
                  renderMissionCard(mission, index, true)
                )}
              </AnimatePresence>
              {customMissions.length === 0 && (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>{t("missions.noCustom")}</p>
                    <p className="text-sm mt-1">{t("missions.createFirst")}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {completedCount === allMissions.length && allMissions.length > 0 && (
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
