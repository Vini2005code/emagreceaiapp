import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

export function FastingWidget() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const targetHours = 16;
  const targetSeconds = targetHours * 60 * 60;

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

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  return (
    <Card
      variant="interactive"
      className="overflow-hidden"
      onClick={() => navigate("/fasting")}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                strokeWidth="4"
                className="fill-none stroke-secondary"
              />
              <motion.circle
                cx="32"
                cy="32"
                r="28"
                strokeWidth="4"
                className="fill-none stroke-primary"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 176 - (176 * progress) / 100 }}
                style={{ strokeDasharray: 176 }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Timer className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm mb-1">Jejum Intermitente</h3>
            <p className="text-2xl font-bold text-foreground">
              {formatTime(hours, minutes)}
            </p>
            <p className="text-xs text-muted-foreground">
              Meta: {targetHours}h • {isActive ? "Em andamento" : "Pausado"}
            </p>
          </div>
          <Button
            size="icon"
            variant={isActive ? "outline" : "default"}
            onClick={(e) => {
              e.stopPropagation();
              setIsActive(!isActive);
            }}
          >
            {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
