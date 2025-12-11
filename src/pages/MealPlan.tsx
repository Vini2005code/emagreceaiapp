import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Sparkles, Coffee, Sun, Moon, Loader2, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface MealSuggestion {
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  calories: number;
  ingredients: { pt: string[]; en: string[] };
}

interface DailyPlan {
  breakfast: MealSuggestion;
  lunch: MealSuggestion;
  dinner: MealSuggestion;
}

const samplePlan: DailyPlan = {
  breakfast: {
    name: { pt: "Ovos mexidos com pão integral", en: "Scrambled eggs with whole wheat bread" },
    description: { pt: "Proteína de qualidade para começar o dia", en: "Quality protein to start the day" },
    calories: 320,
    ingredients: { 
      pt: ["2 ovos", "1 fatia pão integral", "azeite", "sal"],
      en: ["2 eggs", "1 slice whole wheat bread", "olive oil", "salt"]
    },
  },
  lunch: {
    name: { pt: "Frango grelhado com arroz e feijão", en: "Grilled chicken with rice and beans" },
    description: { pt: "Prato completo e nutritivo", en: "Complete and nutritious meal" },
    calories: 520,
    ingredients: { 
      pt: ["150g frango", "4 colheres arroz", "3 colheres feijão", "salada"],
      en: ["150g chicken", "4 tbsp rice", "3 tbsp beans", "salad"]
    },
  },
  dinner: {
    name: { pt: "Sopa de legumes com frango", en: "Vegetable soup with chicken" },
    description: { pt: "Leve e reconfortante", en: "Light and comforting" },
    calories: 280,
    ingredients: { 
      pt: ["100g frango", "cenoura", "batata", "chuchu", "temperos"],
      en: ["100g chicken", "carrot", "potato", "chayote", "seasonings"]
    },
  },
};

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

const MealPlan = () => {
  const { t, language } = useLanguage();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const mealLabels = {
    breakfast: t("mealplan.breakfast"),
    lunch: t("mealplan.lunch"),
    dinner: t("mealplan.dinner"),
  };

  const generatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setPlan(samplePlan);
      setIsGenerating(false);
    }, 1500);
  };

  const totalCalories = plan
    ? plan.breakfast.calories + plan.lunch.calories + plan.dinner.calories
    : 0;

  return (
    <AppLayout title={t("mealplan.title")} subtitle={t("mealplan.subtitle")}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient" className="text-center">
            <CardContent className="py-6">
              <Utensils className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t("mealplan.dontKnow")}
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                {t("mealplan.suggestion")}
              </p>
              <Button
                size="lg"
                onClick={generatePlan}
                disabled={isGenerating}
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("mealplan.generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t("mealplan.generate")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {plan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card variant="accent" className="text-center">
                <CardContent className="py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="h-5 w-5 text-accent-foreground" />
                    <span className="text-2xl font-bold text-accent-foreground">
                      {totalCalories}
                    </span>
                    <span className="text-accent-foreground/80">{t("mealplan.totalKcal")}</span>
                  </div>
                </CardContent>
              </Card>

              {(["breakfast", "lunch", "dinner"] as const).map((mealType, index) => {
                const meal = plan[mealType];
                const Icon = mealIcons[mealType];
                return (
                  <motion.div
                    key={mealType}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                  >
                    <Card variant="elevated">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {mealLabels[mealType]}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">
                              {meal.calories} kcal
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-bold text-foreground mb-1">
                          {meal.name[language]}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {meal.description[language]}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {meal.ingredients[language].map((ing) => (
                            <span
                              key={ing}
                              className="text-xs bg-secondary px-2 py-1 rounded-lg text-secondary-foreground"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              <Button
                variant="outline"
                onClick={generatePlan}
                className="w-full"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("mealplan.newMenu")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default MealPlan;
