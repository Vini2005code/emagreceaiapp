import { AppLayout } from "@/components/layout/AppLayout";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { WaterProgress } from "@/components/dashboard/WaterProgress";
import { FastingWidget } from "@/components/dashboard/FastingWidget";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Index = () => {
  const { t } = useLanguage();

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
