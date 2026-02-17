import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { WaterProgress } from "@/components/dashboard/WaterProgress";
import { FastingWidget } from "@/components/dashboard/FastingWidget";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthDataCard } from "@/components/health/HealthDataCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { profile } = useUserProfile();

  return (
    <AppLayout>
      <div className="space-y-6 pb-24 px-1 animate-fade-in">
        <Header />
        
        <div className="grid gap-4 md:grid-cols-2">
          <HealthDataCard />
          <FastingWidget />
        </div>

        <WaterProgress />
        <DailyMissions />
        <QuickActions />
      </div>
    </AppLayout>
  );
};

export default Index;
