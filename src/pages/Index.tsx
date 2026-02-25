import { AppLayout } from "@/components/layout/AppLayout";
import { WaterProgress } from "@/components/dashboard/WaterProgress";
import { FastingWidget } from "@/components/dashboard/FastingWidget";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthDataCard } from "@/components/health/HealthDataCard";
import { PageTransition } from "@/components/layout/PageTransition";

const Index = () => {
  return (
    <AppLayout>
      <PageTransition>
        <div className="space-y-6 pb-24 px-1">
          <div className="grid gap-4 md:grid-cols-2">
            <HealthDataCard />
            <FastingWidget />
          </div>

          <WaterProgress />
          <DailyMissions />
          <QuickActions />
        </div>
      </PageTransition>
    </AppLayout>
  );
};

export default Index;
