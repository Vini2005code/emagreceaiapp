import { useState, useCallback } from "react";

interface HealthData {
  steps: number | null;
  activeCalories: number | null;
  lastSync: string | null;
}

/**
 * Web Health API integration (experimental)
 * Uses navigator.health when available (Chrome Origin Trial)
 * Falls back to manual input
 */
export function useHealthData() {
  const [data, setData] = useState<HealthData>(() => {
    const saved = localStorage.getItem("healthData");
    return saved ? JSON.parse(saved) : { steps: null, activeCalories: null, lastSync: null };
  });
  const [isSupported, setIsSupported] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Check if any health API is available
  const checkSupport = useCallback(() => {
    // Web Health API is still experimental and not widely available
    const supported = "health" in navigator;
    setIsSupported(supported);
    return supported;
  }, []);

  const syncHealthData = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true);
    try {
      // Attempt Web Health API (very limited availability)
      if ("health" in navigator) {
        try {
          const health = (navigator as any).health;
          const result = await health.getGrantedPermissions();
          if (result) {
            // Fetch today's data
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const records = await health.getRecords({
              dataType: "steps",
              startTime: today.toISOString(),
              endTime: new Date().toISOString(),
            });
            
            const totalSteps = records?.reduce((sum: number, r: any) => sum + (r.value || 0), 0) || 0;
            
            const newData: HealthData = {
              steps: totalSteps,
              activeCalories: Math.round(totalSteps * 0.04), // rough estimate
              lastSync: new Date().toISOString(),
            };
            setData(newData);
            localStorage.setItem("healthData", JSON.stringify(newData));
            return true;
          }
        } catch {
          // API not available or denied
        }
      }
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const setManualData = useCallback((steps: number) => {
    const activeCalories = Math.round(steps * 0.04); // ~0.04 kcal per step
    const newData: HealthData = {
      steps,
      activeCalories,
      lastSync: new Date().toISOString(),
    };
    setData(newData);
    localStorage.setItem("healthData", JSON.stringify(newData));
  }, []);

  const getCalorieAdjustment = useCallback(() => {
    if (!data.activeCalories) return 0;
    // Add active calories to daily goal
    return data.activeCalories;
  }, [data]);

  return {
    data,
    isSupported,
    isSyncing,
    checkSupport,
    syncHealthData,
    setManualData,
    getCalorieAdjustment,
  };
}
