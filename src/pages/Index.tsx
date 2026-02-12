import { AppLayout } from "@/components/layout/AppLayout";
import { Header } from "@/components/layout/Header";
import { WaterProgress } from "@/components/dashboard/WaterProgress";
import { FastingWidget } from "@/components/dashboard/FastingWidget";
import { DailyMissions } from "@/components/dashboard/DailyMissions";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HealthDataCard } from "@/components/health/HealthDataCard";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/hooks/useAuth";
import Auth from "./Auth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { session, loading: authLoading } = useAuth();
  const { isLoading: profileLoading } = useUserProfile();

  // Loading silencioso ou minimalista
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não estiver logado, manda para o Auth (Login/Cadastro)
  if (!session) {
    return <Auth />;
  }

  // REMOVIDA A TRAVA: Agora ele renderiza o App direto, independente dos dados
  return (
    <AppLayout>
      <div className="space-y-6 pb-24 px-1 animate-fade-in">
        <Header />
        
        {/* O usuário edita os dados aqui dentro, quando clicar nos cards */}
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
