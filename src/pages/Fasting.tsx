import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, RotateCcw, Utensils, Moon } from "lucide-react";
import { motion } from "framer-motion";

const fastingProtocols = [
  { name: "16:8", fastHours: 16, eatHours: 8 },
  { name: "18:6", fastHours: 18, eatHours: 6 },
  { name: "20:4", fastHours: 20, eatHours: 4 },
];

const Fasting = () => {
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProtocol, setSelectedProtocol] = useState(fastingProtocols[0]);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const targetSeconds = selectedProtocol.fastHours * 60 * 60;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);
  const remainingHours = Math.floor(remainingSeconds / 3600);
  const remainingMinutes = Math.floor((remainingSeconds % 3600) / 60);

  const formatTime = (h: number, m: number, s: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;

  const startFasting = () => {
    setIsActive(true);
    setStartTime(new Date());
  };

  const pauseFasting = () => {
    setIsActive(false);
  };

  const resetFasting = () => {
    setIsActive(false);
    setElapsedSeconds(0);
    setStartTime(null);
  };

  const getMessage = () => {
    if (progress >= 100) return "🎉 Jejum completo! Você conseguiu!";
    if (progress >= 75) return "💪 Quase lá! Falta pouco!";
    if (progress >= 50) return "🔥 Metade do caminho! Continue firme!";
    if (progress >= 25) return "⚡ Bom progresso! Mantenha o foco!";
    return "🚀 Você começou! Vamos nessa!";
  };

  return (
    <AppLayout title="Jejum Intermitente" subtitle="Controle seu tempo de jejum">
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
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    strokeWidth="8"
                    className="fill-none stroke-primary-foreground/20"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    strokeWidth="8"
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
                    {progress.toFixed(0)}% completo
                  </p>
                </div>
              </div>

              <p className="text-lg font-medium text-primary-foreground mb-4">
                {getMessage()}
              </p>

              {remainingSeconds > 0 && (
                <p className="text-sm text-primary-foreground/80">
                  Faltam {remainingHours}h {remainingMinutes}min
                </p>
              )}

              <div className="flex justify-center gap-3 mt-6">
                {!isActive ? (
                  <Button
                    size="lg"
                    variant="glass"
                    onClick={startFasting}
                    className="min-w-[120px]"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="glass"
                    onClick={pauseFasting}
                    className="min-w-[120px]"
                  >
                    <Pause className="mr-2 h-5 w-5" />
                    Pausar
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="glass"
                  onClick={resetFasting}
                  disabled={elapsedSeconds === 0}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="text-lg">Protocolo de Jejum</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {fastingProtocols.map((protocol) => (
                <Button
                  key={protocol.name}
                  variant={
                    selectedProtocol.name === protocol.name ? "default" : "outline"
                  }
                  onClick={() => {
                    if (!isActive) {
                      setSelectedProtocol(protocol);
                      setElapsedSeconds(0);
                    }
                  }}
                  disabled={isActive}
                  className="h-auto py-3 flex-col"
                >
                  <span className="text-lg font-bold">{protocol.name}</span>
                  <span className="text-xs opacity-80">
                    {protocol.fastHours}h jejum
                  </span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Moon className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {selectedProtocol.fastHours}h
              </p>
              <p className="text-sm text-muted-foreground">Período de jejum</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <Utensils className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {selectedProtocol.eatHours}h
              </p>
              <p className="text-sm text-muted-foreground">Janela alimentar</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Fasting;
