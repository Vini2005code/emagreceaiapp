import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WaterLog {
  time: string;
  amount: number;
}

interface DailyWater {
  currentMl: number;
  logs: WaterLog[];
  date: string;
}

interface DailyFasting {
  isActive: boolean;
  elapsedSeconds: number;
  startTimestamp: number | null; // wall-clock ms when started
  protocol: number; // target hours
  date: string;
}

interface DailyHealth {
  steps: number | null;
  activeCalories: number | null;
  lastSync: string | null;
  date: string;
}

interface DailyDataState {
  water: DailyWater;
  fasting: DailyFasting;
  health: DailyHealth;
}

interface DailyDataContextType {
  // Water
  waterMl: number;
  waterLogs: WaterLog[];
  addWater: (amount: number) => void;

  // Fasting
  fastingActive: boolean;
  fastingElapsed: number;
  fastingProtocol: number;
  toggleFasting: () => void;
  resetFasting: () => void;
  setFastingProtocol: (hours: number) => void;

  // Health
  healthSteps: number | null;
  healthCalories: number | null;
  healthLastSync: string | null;
  setManualSteps: (steps: number) => void;
  syncHealthApi: () => Promise<boolean>;
  healthSyncing: boolean;
}

const DailyDataContext = createContext<DailyDataContextType | undefined>(undefined);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayKey = () => new Date().toISOString().slice(0, 10);

function loadState(): DailyDataState {
  const today = todayKey();
  const raw = localStorage.getItem("dailyData");
  if (raw) {
    try {
      const parsed: DailyDataState = JSON.parse(raw);
      // Date-strict: if any section is from a previous day, reset it
      return {
        water: parsed.water?.date === today ? parsed.water : { currentMl: 0, logs: [], date: today },
        fasting: parsed.fasting?.date === today ? parsed.fasting : { isActive: false, elapsedSeconds: 0, startTimestamp: null, protocol: 16, date: today },
        health: parsed.health?.date === today ? parsed.health : { steps: null, activeCalories: null, lastSync: null, date: today },
      };
    } catch {
      // corrupt data, reset
    }
  }
  return {
    water: { currentMl: 0, logs: [], date: today },
    fasting: { isActive: false, elapsedSeconds: 0, startTimestamp: null, protocol: 16, date: today },
    health: { steps: null, activeCalories: null, lastSync: null, date: today },
  };
}

function saveState(state: DailyDataState) {
  localStorage.setItem("dailyData", JSON.stringify(state));
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function DailyDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DailyDataState>(loadState);
  const [healthSyncing, setHealthSyncing] = useState(false);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Fasting timer tick
  useEffect(() => {
    if (!state.fasting.isActive || !state.fasting.startTimestamp) return;
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.fasting.isActive || !prev.fasting.startTimestamp) return prev;
        const elapsed = Math.floor((Date.now() - prev.fasting.startTimestamp) / 1000);
        return { ...prev, fasting: { ...prev.fasting, elapsedSeconds: elapsed } };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state.fasting.isActive, state.fasting.startTimestamp]);

  // Cross-tab sync via storage event
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "dailyData" && e.newValue) {
        try {
          const incoming: DailyDataState = JSON.parse(e.newValue);
          const today = todayKey();
          // Only accept today's data
          if (incoming.water?.date === today || incoming.fasting?.date === today || incoming.health?.date === today) {
            setState(incoming);
          }
        } catch { /* ignore corrupt */ }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ── Water ──
  const addWater = useCallback((amount: number) => {
    setState(prev => {
      const newMl = Math.max(0, prev.water.currentMl + amount);
      const newLogs = amount > 0
        ? [...prev.water.logs, { time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), amount }]
        : prev.water.logs;
      return { ...prev, water: { ...prev.water, currentMl: newMl, logs: newLogs } };
    });
  }, []);

  // ── Fasting ──
  const toggleFasting = useCallback(() => {
    setState(prev => {
      if (prev.fasting.isActive) {
        // Pause: save current elapsed, clear timestamp
        return { ...prev, fasting: { ...prev.fasting, isActive: false, startTimestamp: null } };
      } else {
        // Start/resume: set timestamp accounting for already elapsed
        const ts = Date.now() - prev.fasting.elapsedSeconds * 1000;
        return { ...prev, fasting: { ...prev.fasting, isActive: true, startTimestamp: ts } };
      }
    });
  }, []);

  const resetFasting = useCallback(() => {
    setState(prev => ({
      ...prev,
      fasting: { ...prev.fasting, isActive: false, elapsedSeconds: 0, startTimestamp: null },
    }));
  }, []);

  const setFastingProtocol = useCallback((hours: number) => {
    setState(prev => ({
      ...prev,
      fasting: { ...prev.fasting, protocol: hours },
    }));
  }, []);

  // ── Health ──
  const setManualSteps = useCallback((steps: number) => {
    const cals = Math.round(steps * 0.04);
    setState(prev => ({
      ...prev,
      health: { ...prev.health, steps, activeCalories: cals, lastSync: new Date().toISOString() },
    }));
  }, []);

  const syncHealthApi = useCallback(async (): Promise<boolean> => {
    setHealthSyncing(true);
    try {
      if ("health" in navigator) {
        try {
          const health = (navigator as any).health;
          const result = await health.getGrantedPermissions();
          if (result) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const records = await health.getRecords({
              dataType: "steps",
              startTime: today.toISOString(),
              endTime: new Date().toISOString(),
            });
            const totalSteps = records?.reduce((sum: number, r: any) => sum + (r.value || 0), 0) || 0;
            setManualSteps(totalSteps);
            return true;
          }
        } catch { /* not available */ }
      }
      return false;
    } finally {
      setHealthSyncing(false);
    }
  }, [setManualSteps]);

  const value: DailyDataContextType = {
    waterMl: state.water.currentMl,
    waterLogs: state.water.logs,
    addWater,
    fastingActive: state.fasting.isActive,
    fastingElapsed: state.fasting.elapsedSeconds,
    fastingProtocol: state.fasting.protocol,
    toggleFasting,
    resetFasting,
    setFastingProtocol,
    healthSteps: state.health.steps,
    healthCalories: state.health.activeCalories,
    healthLastSync: state.health.lastSync,
    setManualSteps,
    syncHealthApi,
    healthSyncing,
  };

  return (
    <DailyDataContext.Provider value={value}>
      {children}
    </DailyDataContext.Provider>
  );
}

export function useDailyData() {
  const ctx = useContext(DailyDataContext);
  if (!ctx) throw new Error("useDailyData must be used within DailyDataProvider");
  return ctx;
}
