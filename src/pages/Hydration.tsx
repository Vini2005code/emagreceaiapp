import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Plus, Minus, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const quickAddOptions = [150, 250, 500, 750];

const Hydration = () => {
  const { t } = useLanguage();
  const [weight, setWeight] = useState(70);
  const [currentMl, setCurrentMl] = useState(0);
  const targetMl = Math.round(weight * 35);
  const percentage = Math.min((currentMl / targetMl) * 100, 100);

  const addWater = (amount: number) => {
    setCurrentMl((prev) => Math.max(0, prev + amount));
  };

  const waterLogs = [
    { time: "07:30", amount: 250 },
    { time: "09:15", amount: 200 },
    { time: "11:00", amount: 350 },
  ];

  return (
    <AppLayout title={t("water.title")} subtitle={t("water.subtitle")}>
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
                {(currentMl / 1000).toFixed(1)}L
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
                  disabled={currentMl <= 0}
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
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-24"
                min={30}
                max={200}
              />
              <span className="text-muted-foreground">kg</span>
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
              {waterLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">{log.time}</span>
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Droplets className="h-4 w-4 text-primary" />
                    {log.amount}ml
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Hydration;
