import { AppLayout } from "@/components/layout/AppLayout";
import { PageTransition } from "@/components/layout/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Plus, Minus, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDailyData } from "@/contexts/DailyDataContext";
import { useUserProfile } from "@/hooks/useUserProfile";

const quickAddOptions = [150, 250, 500, 750];

const Hydration = () => {
  const { t, language } = useLanguage();
  const { waterMl, waterLogs, addWater } = useDailyData();
  const { profile } = useUserProfile();
  const targetMl = Math.round(profile.weight * 35) || 2500;
  const percentage = Math.min((waterMl / targetMl) * 100, 100);

  return (
    <AppLayout title={t("water.title")} subtitle={t("water.subtitle")}>
      <PageTransition>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card variant="primary" className="text-center">
            <CardContent className="py-8">
              <div className="relative w-40 h-56 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-primary-foreground/30 rounded-3xl overflow-hidden">
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 bg-primary-foreground/40"
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Droplets className="h-16 w-16 text-primary-foreground/50" />
                  </div>
                </div>
              </div>

              <p className="text-5xl font-bold text-primary-foreground mb-1">
                {(waterMl / 1000).toFixed(1)}L
              </p>
              <p className="text-primary-foreground/80">
                {t("water.of")} {(targetMl / 1000).toFixed(1)}L ({percentage.toFixed(0)}%)
              </p>

              <div className="flex justify-center gap-2 mt-6 flex-wrap">
                {quickAddOptions.map((amount) => (
                  <Button
                    key={amount}
                    variant="glass"
                    size="sm"
                    onClick={() => addWater(amount)}
                  >
                    +{amount}ml
                  </Button>
                ))}
              </div>

              <div className="flex justify-center gap-3 mt-4">
                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => addWater(-100)}
                  disabled={waterMl <= 0}
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <Button
                  variant="glass"
                  size="icon"
                  onClick={() => addWater(100)}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t("water.calculateGoal")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              {t("water.weightTip")}
            </p>
            <div className="flex gap-3 items-center">
              <span className="text-foreground font-semibold">{profile.weight} kg</span>
              <span className="text-muted-foreground">→</span>
              <span className="text-foreground font-semibold ml-auto">
                {t("dashboard.goal")}: {(targetMl / 1000).toFixed(1)}L
              </span>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("water.todayLog")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waterLogs.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <Droplets className="h-10 w-10 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">
                    {language === "pt" ? "Nenhum registro hoje. Que tal começar agora? 💧" : "No logs yet today. How about starting now? 💧"}
                  </p>
                </div>
              ) : (
                waterLogs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <span className="text-muted-foreground">{log.time}</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Droplets className="h-4 w-4 text-primary" />
                      {log.amount}ml
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Hydration;
