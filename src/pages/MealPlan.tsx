import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Sparkles, Coffee, Sun, Moon, Loader2, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MealSuggestion {
  name: string;
  description: string;
  calories: number;
  ingredients: string[];
}

interface DailyPlan {
  breakfast: MealSuggestion;
  lunch: MealSuggestion;
  dinner: MealSuggestion;
}

const samplePlan: DailyPlan = {
  breakfast: {
    name: "Ovos mexidos com pão integral",
    description: "Proteína de qualidade para começar o dia",
    calories: 320,
    ingredients: ["2 ovos", "1 fatia pão integral", "azeite", "sal"],
  },
  lunch: {
    name: "Frango grelhado com arroz e feijão",
    description: "Prato completo e nutritivo",
    calories: 520,
    ingredients: ["150g frango", "4 colheres arroz", "3 colheres feijão", "salada"],
  },
  dinner: {
    name: "Sopa de legumes com frango",
    description: "Leve e reconfortante",
    calories: 280,
    ingredients: ["100g frango", "cenoura", "batata", "chuchu", "temperos"],
  },
};

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

const mealLabels = {
  breakfast: "Café da Manhã",
  lunch: "Almoço",
  dinner: "Jantar",
};

const MealPlan = () => {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    <AppLayout title="Prato Feito" subtitle="Sugestão de cardápio do dia">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card variant="gradient" className="text-center">
            <CardContent className="py-6">
              <Utensils className="h-12 w-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Não sabe o que comer?
              </h2>
              <p className="text-muted-foreground mb-4 text-sm">
                Receba sugestões de café, almoço e jantar com alimentos acessíveis
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
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Cardápio
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
                    <span className="text-accent-foreground/80">kcal total</span>
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
                          {meal.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          {meal.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {meal.ingredients.map((ing) => (
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
                Gerar Novo Cardápio
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default MealPlan;
