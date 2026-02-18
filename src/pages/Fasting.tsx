import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw, Utensils, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDailyData } from "@/contexts/DailyDataContext";

const fastingProtocols = [
  { name: "16:8", fastHours: 16, eatHours: 8 },
  { name: "18:6", fastHours: 18, eatHours: 6 },
  { name: "20:4", fastHours: 20, eatHours: 4 },
];

const Fasting = () => {
  const { t } = useLanguage();
  const { fastingActive, fastingElapsed, fastingProtocol, toggleFasting, resetFasting, setFastingProtocol } = useDailyData();

  const selected = fastingProtocols.find(p => p.fastHours === fastingProtocol) || fastingProtocols[0];
  const targetSeconds = selected.fastHours * 60 * 60;

  const progress = Math.min((fastingElapsed / targetSeconds) * 100, 100);
  const hours = Math.floor(fastingElapsed / 3600);
  const minutes = Math.floor((fastingElapsed % 3600) / 60);
  const seconds = fastingElapsed % 60;

  const remainingSeconds = Math.max(targetSeconds - fastingElapsed, 0);
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

  const formatTime = (h: number, m: number, s: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  const getMessage = () => {
    if (progress >= 100) return t("fasting.msg100");
    if (progress >= 75) return t("fasting.msg75");
    if (progress >= 50) return t("fasting.msg50");
    if (progress >= 25) return t("fasting.msg25");
    return t("fasting.msg0");
  };

  return (
    <AppLayout title={t("fasting.title")} subtitle={t("fasting.subtitle")}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card variant="primary" className="text-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary-foreground/20" />
            </div>
            <CardContent className="py-8 relative">
              <div className="relative w-48 h-48 mx-auto mb-6">
                <svg className="w-48 h-48 -rotate-90">
                  <circle cx="96" cy="96" r="88" strokeWidth="8" className="fill-none stroke-primary-foreground/20" />
                  <motion.circle
                    cx="96" cy="96" r="88" strokeWidth="8"
                    className="fill-none stroke-primary-foreground"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: 553 }}
                    animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                    style={{ strokeDasharray: 553 }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <Timer className="h-8 w-8 text-primary-foreground mb-2" />
                  <p className="text-4xl font-bold text-primary-foreground">
                    {formatTime(hours, minutes, seconds)}
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    {progress.toFixed(0)}% {t("fasting.complete")}
                  </p>
                </div>
              </div>

              <p className="text-lg font-medium text-primary-foreground mb-4">
                {getMessage()}
              </p>

              {remainingSeconds > 0 && (
                <p className="text-sm text-primary-foreground/80">
                  {t("fasting.remaining")} {remainingHours}h {remainingMinutes}min
                </p>
              )}

              <div className="flex justify-center gap-3 mt-6">
                <Button size="lg" variant="glass" onClick={toggleFasting} className="min-w-[120px]">
                  {fastingActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                  {fastingActive ? t("fasting.pause") : t("fasting.start")}
                </Button>
                <Button size="lg" variant="glass" onClick={resetFasting} disabled={fastingElapsed === 0}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="text-lg">{t("fasting.protocol")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {fastingProtocols.map((protocol) => (
                <Button
                  key={protocol.name}
                  variant={selected.name === protocol.name ? "default" : "outline"}
                  onClick={() => {
                    if (!fastingActive) {
                      setFastingProtocol(protocol.fastHours);
                      resetFasting();
                    }
                  }}
                  disabled={fastingActive}
                  className="h-auto py-3 flex-col"
                >
                  <span className="text-lg font-bold">{protocol.name}</span>
                  <span className="text-xs opacity-80">{protocol.fastHours}h {t("fasting.fasting")}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Moon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{selected.fastHours}h</p>
              <p className="text-sm text-muted-foreground">{t("fasting.fastPeriod")}</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Utensils className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{selected.eatHours}h</p>
              <p className="text-sm text-muted-foreground">{t("fasting.eatWindow")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Fasting;
