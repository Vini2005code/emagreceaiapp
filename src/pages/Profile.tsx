import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useConsent } from "@/hooks/useConsent";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { BMIDisplay } from "@/components/profile/BMIDisplay";
import { DietRecommendation } from "@/components/profile/DietRecommendation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { DataManagement } from "@/components/profile/DataManagement";

const Profile = () => {
  const { profile, saveProfile, calculateBMI, getBMICategory, getIdealWeight, getDietRecommendation, estimateBodyFat, calculateWaterIntake } = useUserProfile();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const { hasAllRequired, isLoading: consentLoading } = useConsent();
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    checkOnboarding();
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
    setCheckingOnboarding(false);
  };

  const handleOnboardingComplete = async () => {
    if (!user) return;
    await supabase
      .from("profiles")
      .update({ onboarding_completed: true })
      .eq("user_id", user.id);
    setShowOnboarding(false);
  };

  const handleSave = () => {
    saveProfile(formData);
    track("profile_saved");
    toast({
      title: t("general.success"),
      description: t("profile.saved"),
    });
  };

  if (showOnboarding && !checkingOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);
  const idealWeight = getIdealWeight();
  const diet = getDietRecommendation();
  const bodyFat = estimateBodyFat();
  const waterIntake = calculateWaterIntake();

  return (
    <AppLayout title={t("profile.title")} subtitle={t("profile.subtitle")}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ProfileForm formData={formData} onChange={setFormData} onSave={handleSave} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <BMIDisplay 
            bmi={bmi} 
            category={bmiCategory} 
            idealWeight={idealWeight}
            currentWeight={profile.weight}
            goalWeight={profile.goalWeight}
            bodyFat={bodyFat}
            waterIntake={waterIntake}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DietRecommendation 
            diet={diet}
            bmiCategory={bmiCategory}
            bodyType={profile.bodyType}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DataManagement />
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Profile;
