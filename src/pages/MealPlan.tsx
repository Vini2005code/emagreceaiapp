import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Utensils, Sparkles, Coffee, Sun, Moon, Loader2, Flame, Apple, Sandwich, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMealPlanGenerator, type MealPlanMeal } from "@/hooks/useMealPlanGenerator";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const mealConfig = {
  breakfast: { icon: Coffee, labelPt: "Café da Manhã", labelEn: "Breakfast" },
  morningSnack: { icon: Apple, labelPt: "Lanche da Manhã", labelEn: "Morning Snack" },
  lunch: { icon: Sun, labelPt: "Almoço", labelEn: "Lunch" },
  afternoonSnack: { icon: Sandwich, labelPt: "Lanche da Tarde", labelEn: "Afternoon Snack" },
  dinner: { icon: Moon, labelPt: "Jantar", labelEn: "Dinner" },
} as const;

type MealKey = keyof typeof mealConfig;

const MealCard = ({ mealKey, meal, language, index }: { mealKey: MealKey; meal: MealPlanMeal; language: string; index: number }) => {
  const config = mealConfig[mealKey];
  const Icon = config.icon;
  const label = language === "pt" ? config.labelPt : config.labelEn;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={mealKey} className="border-none">
          <Card variant="elevated">
            <CardHeader className="pb-2">
              <AccordionTrigger className="hover:no-underline p-0">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <CardTitle className="text-base">{label}</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">{meal.name}</p>
                  </div>
                  <div className="text-right shrink-0 mr-2">
                    <span className="text-sm font-bold text-primary">{meal.calories} kcal</span>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1 py-0">P:{meal.protein}g</Badge>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">C:{meal.carbs}g</Badge>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">G:{meal.fat}g</Badge>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-2 space-y-3">
                <p className="text-sm text-muted-foreground">{meal.description}</p>
                
                <div>
                  <h5 className="text-xs font-semibold text-foreground mb-1">
                    {language === "pt" ? "Ingredientes" : "Ingredients"}
                  </h5>
                  <div className="flex flex-wrap gap-1">
                    {meal.ingredients.map((ing, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {ing.amount}{ing.unit} {ing.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-foreground mb-1">
                    {language === "pt" ? "Preparo" : "Instructions"}
                  </h5>
                  <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                    {meal.instructions.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>

                {meal.prepTime > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ⏱ {meal.prepTime} min
                  </p>
                )}
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </motion.div>
  );
};

const MealPlan = () => {
  const { t, language } = useLanguage();
  const { isLoading, mealPlan, totalCalories, totalMacros, generateMealPlan } = useMealPlanGenerator();
  const { getDietRecommendation } = useUserProfile();
  const diet = getDietRecommendation();

  return (
    <AppLayout title={t("mealplan.title")} subtitle={t("mealplan.subtitle")}>
      <div className="space-y-4">
        {/* Target Summary */}
        <Card variant="gradient" className="border-primary/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground text-sm">
                  {language === "pt" ? "Meta Diária" : "Daily Target"}
                </h3>
                <div className="grid grid-cols-4 gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{diet.calories} kcal</span>
                  <span>P: {diet.protein}g</span>
                  <span>C: {diet.carbs}g</span>
                  <span>G: {diet.fat}g</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="gradient" className="text-center">
            <CardContent className="py-6">
              <Utensils className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                {t("mealplan.dontKnow")}
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                {language === "pt" 
                  ? "A IA gera um cardápio completo e personalizado para o seu dia"
                  : "AI generates a complete personalized menu for your day"}
              </p>
              <Button
                size="lg"
                variant="cta"
                onClick={generateMealPlan}
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {language === "pt" ? "Gerando cardápio com IA..." : "Generating with AI..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {mealPlan ? t("mealplan.newMenu") : t("mealplan.generate")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {mealPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {/* Daily Total */}
              <Card variant="accent" className="text-center">
                <CardContent className="py-3">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Flame className="h-5 w-5 text-accent-foreground" />
                    <span className="text-2xl font-bold text-accent-foreground">
                      {totalCalories}
                    </span>
                    <span className="text-accent-foreground/80">{t("mealplan.totalKcal")}</span>
                  </div>
                  {totalMacros && (
                    <div className="flex justify-center gap-3 text-xs text-accent-foreground/70">
                      <span>P: {totalMacros.protein}g</span>
                      <span>C: {totalMacros.carbs}g</span>
                      <span>G: {totalMacros.fat}g</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meals */}
              {(Object.keys(mealConfig) as MealKey[]).map((key, index) => (
                <MealCard
                  key={key}
                  mealKey={key}
                  meal={mealPlan[key]}
                  language={language}
                  index={index}
                />
              ))}

              <Button
                variant="outline"
                onClick={generateMealPlan}
                disabled={isLoading}
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
