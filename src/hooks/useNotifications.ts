import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ScheduledReminder {
  id: string;
  type: "water" | "meal" | "fasting";
  intervalMinutes: number;
  enabled: boolean;
}

export function useNotifications() {
  const { language } = useLanguage();
  const pt = language === "pt";
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [reminders, setReminders] = useState<ScheduledReminder[]>(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [
      { id: "water", type: "water", intervalMinutes: 60, enabled: false },
      { id: "meal", type: "meal", intervalMinutes: 180, enabled: false },
      { id: "fasting", type: "fasting", intervalMinutes: 0, enabled: false },
    ];
  });
  const [timers, setTimers] = useState<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === "granted";
  }, []);

  const sendNotification = useCallback((title: string, body: string) => {
    if (permission !== "granted") return;
    try {
      new Notification(title, {
        body,
        icon: "/favicon.png",
        badge: "/favicon.png",
        tag: `emagrece-${Date.now()}`,
      });
    } catch {
      // Notification API may fail on some browsers
    }
  }, [permission]);

  const getNotificationText = useCallback((type: string) => {
    const texts: Record<string, { title: string; body: string }> = {
      water: {
        title: pt ? "💧 Hora de beber água!" : "💧 Time to drink water!",
        body: pt ? "Mantenha-se hidratado para atingir sua meta diária" : "Stay hydrated to reach your daily goal",
      },
      meal: {
        title: pt ? "🍽️ Hora da refeição!" : "🍽️ Mealtime!",
        body: pt ? "Registre sua refeição no app para acompanhar seus macros" : "Log your meal in the app to track your macros",
      },
      fasting: {
        title: pt ? "⏰ Janela de jejum encerrada!" : "⏰ Fasting window ended!",
        body: pt ? "Seu período de jejum terminou. Você pode comer agora!" : "Your fasting period is over. You can eat now!",
      },
    };
    return texts[type] || { title: "Emagrece AI", body: "" };
  }, [pt]);

  const startReminder = useCallback((reminder: ScheduledReminder) => {
    if (reminder.intervalMinutes <= 0) return;
    const ms = reminder.intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      const { title, body } = getNotificationText(reminder.type);
      sendNotification(title, body);
    }, ms);
    setTimers(prev => ({ ...prev, [reminder.id]: timer }));
  }, [getNotificationText, sendNotification]);

  const stopReminder = useCallback((id: string) => {
    if (timers[id]) {
      clearInterval(timers[id]);
      setTimers(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    }
  }, [timers]);

  const toggleReminder = useCallback(async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;

    if (!reminder.enabled) {
      const granted = await requestPermission();
      if (!granted) return;
      startReminder(reminder);
    } else {
      stopReminder(id);
    }

    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  }, [reminders, requestPermission, startReminder, stopReminder]);

  const updateInterval = useCallback((id: string, minutes: number) => {
    setReminders(prev => prev.map(r =>
      r.id === id ? { ...r, intervalMinutes: minutes } : r
    ));
    const reminder = reminders.find(r => r.id === id);
    if (reminder?.enabled) {
      stopReminder(id);
      startReminder({ ...reminder, intervalMinutes: minutes });
    }
  }, [reminders, stopReminder, startReminder]);

  const sendFastingAlert = useCallback(() => {
    const { title, body } = getNotificationText("fasting");
    sendNotification(title, body);
  }, [getNotificationText, sendNotification]);

  const isSupported = "Notification" in window;

  return {
    permission,
    reminders,
    isSupported,
    requestPermission,
    toggleReminder,
    updateInterval,
    sendNotification,
    sendFastingAlert,
  };
}
