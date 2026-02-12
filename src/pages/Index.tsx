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
import { Loader2 } from "lucide-react";

const Index = () => {
  const { session, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, refreshProfile } = useUserProfile();

  // Estado de Carregamento Unificado
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Carregando sua experiência...</p>
      </div>
    );
  }

  // Se não houver sessão, exibe a tela de Autenticação
  if (!session) {
    return <Auth />;
  }

  // Se o usuário está logado mas nunca completou o perfil (Peso/Altura)
  // O hook useUserProfile garante que 'profile' tenha valores padrão seguros
  if (!profile?.onboardingCompleted) {
    return <QuickProfileSetup onComplete={refreshProfile} />;
  }

  // Dashboard Principal (Só acessível após login e setup)
  return (
    <AppLayout>
      <div className="space-y-6 pb-24 animate-fade-in px-1">
        {/* Header com Saudação e Resumo */}
        <Header />

        {/* Dados Vitais e Jejum lado a lado em telas maiores */}
        <div className="grid gap-4 md:grid-cols-2">
          <HealthDataCard />
          <FastingWidget />
        </div>

        {/* Progresso de Água */}
        <WaterProgress />

        {/* Missões do Dia */}
        <DailyMissions />

        {/* Ações Rápidas */}
        <QuickActions />
      </div>
    </AppLayout>
  );
};

export default Index;
