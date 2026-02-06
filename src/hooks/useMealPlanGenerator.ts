import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "./useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";

export interface MealPlanMeal {
  name: string;
  description: string;
  prepTime: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  ingredients: { name: string; amount: string; unit: string }[];
  instructions: string[];
}

export interface DailyMealPlan {
  breakfast: MealPlanMeal;
  morningSnack: MealPlanMeal;
  lunch: MealPlanMeal;
  afternoonSnack: MealPlanMeal;
  dinner: MealPlanMeal;
}

export function useMealPlanGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [mealPlan, setMealPlan] = useState<DailyMealPlan | null>(null);
  const { profile, getDietRecommendation } = useUserProfile();
  const { language } = useLanguage();

  const generateMealPlan = async () => {
    setIsLoading(true);

    try {
      const diet = getDietRecommendation();
      const today = new Date().toLocaleDateString("pt-BR");

      const { data, error } = await supabase.functions.invoke("generate-meal-plan", {
        body: {
          profile: {
            weight: profile.weight,
            height: profile.height,
            age: profile.age,
            gender: profile.gender,
            activityLevel: profile.activityLevel,
            goalWeight: profile.goalWeight,
            bodyType: profile.bodyType,
            foodPreferences: profile.foodPreferences,
            medicalLimitations: profile.medicalLimitations,
            dailyRoutine: profile.dailyRoutine,
          },
          targetCalories: diet.calories,
          targetProtein: diet.protein,
          targetCarbs: diet.carbs,
          targetFat: diet.fat,
          targetFiber: diet.fiber,
          date: today,
          language,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data?.mealPlan) {
        setMealPlan(data.mealPlan);
        toast.success(language === "pt"
          ? "Cardápio do dia gerado com sucesso!"
          : "Daily meal plan generated successfully!");
      } else {
        throw new Error("Invalid response");
      }
    } catch (err) {
      console.error("Meal plan generation error:", err);
      toast.error(language === "pt"
        ? "Erro ao gerar cardápio. Tente novamente."
        : "Error generating meal plan. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = mealPlan
    ? mealPlan.breakfast.calories + mealPlan.morningSnack.calories + mealPlan.lunch.calories + mealPlan.afternoonSnack.calories + mealPlan.dinner.calories
    : 0;

  const totalMacros = mealPlan ? {
    protein: mealPlan.breakfast.protein + mealPlan.morningSnack.protein + mealPlan.lunch.protein + mealPlan.afternoonSnack.protein + mealPlan.dinner.protein,
    carbs: mealPlan.breakfast.carbs + mealPlan.morningSnack.carbs + mealPlan.lunch.carbs + mealPlan.afternoonSnack.carbs + mealPlan.dinner.carbs,
    fat: mealPlan.breakfast.fat + mealPlan.morningSnack.fat + mealPlan.lunch.fat + mealPlan.afternoonSnack.fat + mealPlan.dinner.fat,
  } : null;

  return {
    isLoading,
    mealPlan,
    totalCalories,
    totalMacros,
    generateMealPlan,
  };
}
