import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { WaterProgress } from "@/components/dashboard/WaterProgress";
import { FastingWidget } from "@/components/dashboard/FastingWidget";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { ReminderSettings } from "@/components/notifications/ReminderSettings";
import { HealthDataCard } from "@/components/health/HealthDataCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const Index = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    checkOnboarding();
    track("page_view", { page: "home" });
  }, [user]);

  const checkOnboarding = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data && !data.onboarding_completed) {
      setShowOnboarding(true);
    }
    setLoading(false);
  };

  const handleOnboardingComplete = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);
    setShowOnboarding(false);
  };

  if (loading) return null;

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  return (
    <AppLayout subtitle={t("app.subtitle")}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-4"
        >
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {t("home.greeting")}
          </h2>
          <p className="text-muted-foreground">
            {t("home.motivation")}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DailyMissions />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <WaterProgress />
          <FastingWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <ReminderSettings />
          <HealthDataCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold mb-3 text-foreground">
            {t("home.quickAccess")}
          </h3>
          <QuickActions />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Index;
