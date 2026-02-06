import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { BMIDisplay } from "@/components/profile/BMIDisplay";
import { DietRecommendation } from "@/components/profile/DietRecommendation";
import { ProfileForm } from "@/components/profile/ProfileForm";

const Profile = () => {
  const { profile, saveProfile, calculateBMI, getBMICategory, getIdealWeight, getDietRecommendation, estimateBodyFat, calculateWaterIntake } = useUserProfile();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<UserProfile>(profile);

  const handleSave = () => {
    saveProfile(formData);
    toast({
      title: t("general.success"),
      description: t("profile.saved"),
    });
  };

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
      </div>
    </AppLayout>
  );
};

export default Profile;
