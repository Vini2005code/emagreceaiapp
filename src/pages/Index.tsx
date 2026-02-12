import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { WaterProgress } from "@/components/dashboard/WaterProgress";
import { FastingWidget } from "@/components/dashboard/FastingWidget";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthDataCard } from "@/components/health/HealthDataCard";
import { QuickProfileSetup } from "@/components/profile/QuickProfileSetup";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import Auth from "./Auth";

const Index = () => {
  const { session, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, refreshProfile } = useUserProfile();

  if (authLoading || profileLoading) return null; // Fica em branco (carregando silenciosamente)

  if (!session) return <Auth />;

  if (!profile?.onboardingCompleted) {
    return <QuickProfileSetup onComplete={refreshProfile} />;
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-24 px-1">
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
