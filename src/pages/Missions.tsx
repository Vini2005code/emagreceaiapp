import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trophy, Star, Target, Zap, Flame, Heart, Plus, Dumbbell, Brain, ArrowUp, Salad, Moon, Trash2, User, Timer, Scale, UtensilsCrossed, Ban, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  cardio: Timer,
  protein: UtensilsCrossed,
  noFried: Ban,
  stretch: Heart,
  slowEat: Cookie,
  noSoda: Ban,
  fasting14: Timer,
  walk30: Heart,
  weigh: Scale,
  mealPrep: UtensilsCrossed,
  custom: Target,
};

interface MissionConfig {
  id: string;
  titleKey: string;
  descKey: string;
  icon: string;
  bmiCategories: string[];
  minAge?: number;
  maxAge?: number;
  intensity: "light" | "moderate" | "intense";
  points: number;
}

const allMissionsConfig: MissionConfig[] = [
  // Basic missions - for everyone
  { id: "1", titleKey: "missions.mission1.title", descKey: "missions.mission1.desc", icon: "water", bmiCategories: ["all"], intensity: "light", points: 10 },
  { id: "5", titleKey: "missions.mission5.title", descKey: "missions.mission5.desc", icon: "fruit", bmiCategories: ["all"], intensity: "light", points: 10 },
  { id: "4", titleKey: "missions.mission4.title", descKey: "missions.mission4.desc", icon: "sleep", bmiCategories: ["all"], intensity: "light", points: 10 },
  
  // Light activity - for older or obese
  { id: "2", titleKey: "missions.mission2.title", descKey: "missions.mission2.desc", icon: "walk", bmiCategories: ["all"], intensity: "light", points: 10 },
  { id: "8", titleKey: "missions.mission8.title", descKey: "missions.mission8.desc", icon: "stairs", bmiCategories: ["normal", "overweight", "obese1"], maxAge: 60, intensity: "light", points: 10 },
  { id: "14", titleKey: "missions.mission14.title", descKey: "missions.mission14.desc", icon: "stretch", bmiCategories: ["all"], intensity: "light", points: 10 },
  
  // Moderate activity - for normal to overweight, younger
  { id: "6", titleKey: "missions.mission6.title", descKey: "missions.mission6.desc", icon: "pushups", bmiCategories: ["normal", "overweight"], maxAge: 50, intensity: "moderate", points: 15 },
  { id: "18", titleKey: "missions.mission18.title", descKey: "missions.mission18.desc", icon: "walk30", bmiCategories: ["normal", "overweight", "obese1"], maxAge: 65, intensity: "moderate", points: 15 },
  
  // Intense activity - for younger normal weight
  { id: "11", titleKey: "missions.mission11.title", descKey: "missions.mission11.desc", icon: "cardio", bmiCategories: ["normal", "overweight"], maxAge: 45, intensity: "intense", points: 20 },
  
  // Diet missions - for overweight/obese
  { id: "3", titleKey: "missions.mission3.title", descKey: "missions.mission3.desc", icon: "sugar", bmiCategories: ["overweight", "obese1", "obese2", "obese3"], intensity: "moderate", points: 15 },
  { id: "9", titleKey: "missions.mission9.title", descKey: "missions.mission9.desc", icon: "veggies", bmiCategories: ["all"], intensity: "light", points: 10 },
  { id: "10", titleKey: "missions.mission10.title", descKey: "missions.mission10.desc", icon: "noEat", bmiCategories: ["overweight", "obese1", "obese2", "obese3"], intensity: "moderate", points: 15 },
  { id: "12", titleKey: "missions.mission12.title", descKey: "missions.mission12.desc", icon: "protein", bmiCategories: ["all"], intensity: "light", points: 10 },
  { id: "13", titleKey: "missions.mission13.title", descKey: "missions.mission13.desc", icon: "noFried", bmiCategories: ["overweight", "obese1", "obese2", "obese3"], intensity: "moderate", points: 15 },
  { id: "15", titleKey: "missions.mission15.title", descKey: "missions.mission15.desc", icon: "slowEat", bmiCategories: ["all"], intensity: "light", points: 10 },
  { id: "16", titleKey: "missions.mission16.title", descKey: "missions.mission16.desc", icon: "noSoda", bmiCategories: ["overweight", "obese1", "obese2", "obese3"], intensity: "moderate", points: 15 },
  { id: "20", titleKey: "missions.mission20.title", descKey: "missions.mission20.desc", icon: "mealPrep", bmiCategories: ["all"], intensity: "moderate", points: 15 },
  
  // Fasting missions - for overweight/obese, not underweight
  { id: "17", titleKey: "missions.mission17.title", descKey: "missions.mission17.desc", icon: "fasting14", bmiCategories: ["normal", "overweight", "obese1"], minAge: 18, maxAge: 60, intensity: "moderate", points: 20 },
  
  // Mental health
  { id: "7", titleKey: "missions.mission7.title", descKey: "missions.mission7.desc", icon: "meditate", bmiCategories: ["all"], intensity: "light", points: 10 },
  
  // Tracking
  { id: "19", titleKey: "missions.mission19.title", descKey: "missions.mission19.desc", icon: "weigh", bmiCategories: ["all"], intensity: "light", points: 10 },
];

const Missions = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { profile, calculateBMI, getBMICategory } = useUserProfile();
  
  const hasProfile = profile.name !== "";
  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  // Filter missions based on user profile
  const getAdaptedMissions = useMemo(() => {
    if (!hasProfile) {
      // Return basic set if no profile
      return allMissionsConfig.slice(0, 5);
    }

    return allMissionsConfig.filter((mission) => {
      // Check BMI category
      const bmiMatch = mission.bmiCategories.includes("all") || mission.bmiCategories.includes(bmiCategory);
      if (!bmiMatch) return false;

      // Check age
      if (mission.minAge && profile.age < mission.minAge) return false;
      if (mission.maxAge && profile.age > mission.maxAge) return false;

      // Adjust intensity based on age
      if (profile.age > 60 && mission.intensity === "intense") return false;
      if (profile.age > 70 && mission.intensity === "moderate") return false;

      return true;
    });
  }, [hasProfile, bmiCategory, profile.age]);

  const dailyMissions: Mission[] = getAdaptedMissions.map((config) => ({
    id: config.id,
    title: t(config.titleKey),
    description: t(config.descKey),
    completed: false,
    icon: config.icon,
    points: config.points,
  }));

  const [missions, setMissions] = useState<Mission[]>(dailyMissions.slice(0, 5));
  const [customMissions, setCustomMissions] = useState<Mission[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const allUserMissions = [...missions, ...customMissions];
  const completedCount = allUserMissions.filter((m) => m.completed).length;
  const totalPoints = allUserMissions.reduce((sum, m) => sum + (m.completed ? (m.points || 10) : 0), 0);

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
      points: 10,
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
    const points = mission.points || 10;
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
                +{points} pts
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
        {/* Profile Banner */}
        {hasProfile ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{t("missions.adapted")}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="secondary">IMC: {bmi.toFixed(1)}</Badge>
                  <Badge variant="outline">{profile.age} anos</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-4 px-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("missions.setupProfile")}</p>
                </div>
                <Button size="sm" onClick={() => navigate("/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  {t("missions.goToProfile")}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Points Card */}
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
                {completedCount} {t("general.of")} {allUserMissions.length} {t("missions.completed")}
              </p>
              <div className="mt-4 h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-foreground"
                  initial={{ width: 0 }}
                  animate={{ width: `${allUserMissions.length > 0 ? (completedCount / allUserMissions.length) * 100 : 0}%` }}
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

            {allUserMissions.length === 0 && (
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
              {t("missions.suggested")} ({availableSuggested.length})
            </p>
            {availableSuggested.map((mission, index) => {
              const Icon = iconMap[mission.icon] || Target;
              const config = allMissionsConfig.find((c) => c.id === mission.id);
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
                      <div className="flex items-center gap-2">
                        {config && (
                          <Badge variant={config.intensity === "intense" ? "destructive" : config.intensity === "moderate" ? "secondary" : "outline"} className="text-xs">
                            +{config.points}
                          </Badge>
                        )}
                        <Button size="iconSm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
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

        {completedCount === allUserMissions.length && allUserMissions.length > 0 && (
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
