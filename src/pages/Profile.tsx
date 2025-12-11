import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserProfile, UserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { User, Scale, Ruler, Target, Activity, Dumbbell, Flame, Apple, Beef, Droplets } from "lucide-react";
import { BMIDisplay } from "@/components/profile/BMIDisplay";
import { DietRecommendation } from "@/components/profile/DietRecommendation";

const Profile = () => {
  const { profile, saveProfile, calculateBMI, getBMICategory, getIdealWeight, getDietRecommendation } = useUserProfile();
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

  return (
    <AppLayout title={t("profile.title")} subtitle={t("profile.subtitle")}>
      <div className="space-y-6">
        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5 text-primary" />
                {t("profile.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">{t("profile.name")}</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                
                <div>
                  <Label htmlFor="age">{t("profile.age")}</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="gender">{t("profile.gender")}</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value: "male" | "female") => setFormData({ ...formData, gender: value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t("profile.male")}</SelectItem>
                      <SelectItem value="female">{t("profile.female")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="weight" className="flex items-center gap-1">
                    <Scale className="h-3 w-3" />
                    {t("profile.weight")}
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="height" className="flex items-center gap-1">
                    <Ruler className="h-3 w-3" />
                    {t("profile.height")}
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="goalWeight" className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {t("profile.goalWeight")}
                  </Label>
                  <Input
                    id="goalWeight"
                    type="number"
                    step="0.1"
                    value={formData.goalWeight}
                    onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) || 0 })}
                    className="bg-background/50"
                  />
                </div>

                <div>
                  <Label htmlFor="activityLevel" className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    {t("profile.activityLevel")}
                  </Label>
                  <Select
                    value={formData.activityLevel}
                    onValueChange={(value: UserProfile["activityLevel"]) => setFormData({ ...formData, activityLevel: value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">{t("profile.sedentary")}</SelectItem>
                      <SelectItem value="light">{t("profile.light")}</SelectItem>
                      <SelectItem value="moderate">{t("profile.moderate")}</SelectItem>
                      <SelectItem value="active">{t("profile.active")}</SelectItem>
                      <SelectItem value="veryActive">{t("profile.veryActive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="bodyType" className="flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {t("profile.bodyType")}
                  </Label>
                  <Select
                    value={formData.bodyType}
                    onValueChange={(value: UserProfile["bodyType"]) => setFormData({ ...formData, bodyType: value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ectomorph">{t("profile.ectomorph")}</SelectItem>
                      <SelectItem value="mesomorph">{t("profile.mesomorph")}</SelectItem>
                      <SelectItem value="endomorph">{t("profile.endomorph")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full gradient-primary text-primary-foreground">
                {t("profile.save")}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* BMI Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <BMIDisplay 
            bmi={bmi} 
            category={bmiCategory} 
            idealWeight={idealWeight}
            currentWeight={profile.weight}
            goalWeight={profile.goalWeight}
          />
        </motion.div>

        {/* Diet Recommendation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
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
