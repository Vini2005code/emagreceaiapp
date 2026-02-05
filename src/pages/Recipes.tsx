import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { ChefHat, Sparkles, Loader2, FlaskConical, Leaf, AlertTriangle, User, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
 import { useRecipeGenerator, type MealType } from "@/hooks/useRecipeGenerator";
 import { useUserProfile } from "@/hooks/useUserProfile";
 import { MealTypeSelector } from "@/components/recipes/MealTypeSelector";
 import { RecipeCard } from "@/components/recipes/RecipeCard";
 import { RecipePreferences } from "@/components/recipes/RecipePreferences";

interface SecretRecipe {
  id: string;
  name: { pt: string; en: string };
  description: { pt: string; en: string };
  ingredients: { pt: string[]; en: string[] };
  instructions: { pt: string[]; en: string[] };
  benefits: { pt: string[]; en: string[] };
  warning?: { pt: string; en: string };
}

const secretRecipes: SecretRecipe[] = [
  {
    id: "1",
    name: { pt: "Mounjaro de Pobre", en: "Budget Mounjaro" },
    description: { 
      pt: "Combinação natural que ajuda a reduzir o apetite e estabilizar a glicose",
      en: "Natural combination that helps reduce appetite and stabilize glucose"
    },
    ingredients: { 
      pt: ["1 colher de vinagre de maçã", "1 copo de água morna", "1/2 limão espremido", "1 pitada de canela"],
      en: ["1 tbsp apple cider vinegar", "1 glass warm water", "1/2 squeezed lemon", "1 pinch of cinnamon"]
    },
    instructions: {
      pt: [
        "Misture o vinagre de maçã na água morna",
        "Adicione o suco de limão",
        "Finalize com uma pitada de canela",
        "Tome 20-30 minutos antes das principais refeições"
      ],
      en: [
        "Mix apple cider vinegar in warm water",
        "Add lemon juice",
        "Finish with a pinch of cinnamon",
        "Take 20-30 minutes before main meals"
      ]
    },
    benefits: { 
      pt: ["Reduz picos de glicose", "Aumenta saciedade", "Melhora digestão", "Acelera metabolismo"],
      en: ["Reduces glucose spikes", "Increases satiety", "Improves digestion", "Boosts metabolism"]
    },
    warning: { 
      pt: "Não substitui tratamento médico. Consulte um profissional antes de usar.",
      en: "Does not replace medical treatment. Consult a professional before use."
    }
  },
  {
    id: "2",
    name: { pt: "Chá Termogênico Caseiro", en: "Homemade Thermogenic Tea" },
    description: { 
      pt: "Acelera o metabolismo de forma natural",
      en: "Naturally boosts metabolism"
    },
    ingredients: { 
      pt: ["1 rodela de gengibre fresco", "1/2 colher de canela em pó", "500ml de água quente", "Folhas de hortelã (opcional)"],
      en: ["1 slice fresh ginger", "1/2 tsp cinnamon powder", "500ml hot water", "Mint leaves (optional)"]
    },
    instructions: {
      pt: [
        "Ferva a água com o gengibre por 5 minutos",
        "Adicione a canela e misture bem",
        "Coe e adicione hortelã se desejar",
        "Tome morno, 2x ao dia (manhã e tarde)"
      ],
      en: [
        "Boil water with ginger for 5 minutes",
        "Add cinnamon and mix well",
        "Strain and add mint if desired",
        "Drink warm, 2x daily (morning and afternoon)"
      ]
    },
    benefits: { 
      pt: ["Acelera metabolismo", "Reduz inchaço", "Melhora circulação", "Efeito termogênico natural"],
      en: ["Boosts metabolism", "Reduces bloating", "Improves circulation", "Natural thermogenic effect"]
    }
  },
  {
    id: "3",
    name: { pt: "Água de Berinjela", en: "Eggplant Water" },
    description: { 
      pt: "Auxilia na queima de gordura abdominal",
      en: "Helps burn abdominal fat"
    },
    ingredients: { 
      pt: ["1 berinjela média", "1 litro de água", "Suco de 1 limão"],
      en: ["1 medium eggplant", "1 liter of water", "Juice of 1 lemon"]
    },
    instructions: {
      pt: [
        "Corte a berinjela em rodelas",
        "Deixe de molho na água durante a noite",
        "Adicione o limão pela manhã",
        "Beba ao longo do dia em jejum"
      ],
      en: [
        "Cut eggplant into slices",
        "Soak in water overnight",
        "Add lemon in the morning",
        "Drink throughout the day on empty stomach"
      ]
    },
    benefits: { 
      pt: ["Reduz gordura abdominal", "Rico em fibras", "Controla colesterol", "Desintoxica o organismo"],
      en: ["Reduces belly fat", "Rich in fiber", "Controls cholesterol", "Detoxifies the body"]
    }
  },
  {
    id: "4",
    name: { pt: "Shot Matinal Anti-Inflamatório", en: "Anti-Inflammatory Morning Shot" },
    description: { 
      pt: "Reduz inflamação e acelera perda de peso",
      en: "Reduces inflammation and speeds up weight loss"
    },
    ingredients: { 
      pt: ["1 colher de cúrcuma", "Pimenta preta (1 pitada)", "1/2 limão", "100ml de água"],
      en: ["1 tsp turmeric", "Black pepper (1 pinch)", "1/2 lemon", "100ml water"]
    },
    instructions: {
      pt: [
        "Misture a cúrcuma na água",
        "Adicione a pimenta preta (ativa a curcumina)",
        "Esprema o limão",
        "Tome em jejum pela manhã"
      ],
      en: [
        "Mix turmeric in water",
        "Add black pepper (activates curcumin)",
        "Squeeze the lemon",
        "Take on empty stomach in the morning"
      ]
    },
    benefits: { 
      pt: ["Anti-inflamatório potente", "Acelera queima de gordura", "Melhora imunidade", "Desintoxica o fígado"],
      en: ["Powerful anti-inflammatory", "Speeds up fat burning", "Improves immunity", "Detoxifies liver"]
    }
  },
  {
    id: "5",
    name: { pt: "Smoothie Mata-Fome", en: "Hunger Killer Smoothie" },
    description: { 
      pt: "Mantém você saciado por horas sem pesar",
      en: "Keeps you full for hours without weighing you down"
    },
    ingredients: { 
      pt: ["1 banana congelada", "1 colher de pasta de amendoim", "200ml de leite desnatado", "1 colher de aveia"],
      en: ["1 frozen banana", "1 tbsp peanut butter", "200ml skim milk", "1 tbsp oats"]
    },
    instructions: {
      pt: [
        "Bata todos os ingredientes no liquidificador",
        "Adicione gelo se preferir mais gelado",
        "Tome como café da manhã ou lanche da tarde"
      ],
      en: [
        "Blend all ingredients",
        "Add ice if you prefer it colder",
        "Have as breakfast or afternoon snack"
      ]
    },
    benefits: { 
      pt: ["Saciedade prolongada", "Rico em proteína", "Estabiliza energia", "Reduz vontade de doces"],
      en: ["Prolonged satiety", "Rich in protein", "Stabilizes energy", "Reduces sweet cravings"]
    }
  }
];

const Recipes = () => {
  const { t, language } = useLanguage();
   const { profile, getDietRecommendation, calculateBMI } = useUserProfile();
   const { isLoading, recipes, generateRecipes, clearRecipes } = useRecipeGenerator();
   
   const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
   const [preferences, setPreferences] = useState<string[]>([]);
   const [restrictions, setRestrictions] = useState<string[]>([]);
   const [excludeIngredients, setExcludeIngredients] = useState<string[]>([]);

   const diet = getDietRecommendation();
   const bmi = calculateBMI();
 
   const handleGenerate = () => {
     if (!selectedMealType) return;
     generateRecipes({
       mealType: selectedMealType,
       preferences,
       restrictions,
       excludeIngredients,
     });
  };

  return (
    <AppLayout title={t("recipes.title")} subtitle={t("recipes.subtitle")}>
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="generator">
            <ChefHat className="h-4 w-4 mr-2" />
            {t("recipes.generator")}
          </TabsTrigger>
          <TabsTrigger value="secrets">
            <FlaskConical className="h-4 w-4 mr-2" />
            {t("recipes.secrets")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
           {/* User Profile Summary */}
           <Card variant="gradient" className="border-primary/30">
             <CardContent className="p-4">
               <div className="flex items-start gap-3">
                 <div className="p-2 rounded-full bg-primary/20">
                   <User className="h-5 w-5 text-primary" />
                 </div>
                 <div className="flex-1">
                   <h3 className="font-bold text-foreground mb-1">
                     {language === "pt" ? "Seu Perfil" : "Your Profile"}
                   </h3>
                   <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                     <span>{language === "pt" ? "Peso" : "Weight"}: {profile.weight}kg</span>
                     <span>{language === "pt" ? "Meta" : "Goal"}: {profile.goalWeight}kg</span>
                     <span>IMC: {bmi.toFixed(1)}</span>
                     <span>{language === "pt" ? "Calorias" : "Calories"}: {diet.calories}/dia</span>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className="flex items-center gap-1 text-xs text-primary">
                     <Target className="h-3 w-3" />
                     {language === "pt" ? "Personalizado" : "Personalized"}
                   </div>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Meal Type Selection */}
           <Card variant="gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                 {language === "pt" ? "Tipo de Refeição" : "Meal Type"}
              </CardTitle>
            </CardHeader>
             <CardContent>
               <MealTypeSelector
                 selected={selectedMealType}
                 onSelect={setSelectedMealType}
                 disabled={isLoading}
               />
             </CardContent>
          </Card>

           {/* Preferences and Restrictions */}
           <RecipePreferences
             preferences={preferences}
             restrictions={restrictions}
             excludeIngredients={excludeIngredients}
             onPreferencesChange={setPreferences}
             onRestrictionsChange={setRestrictions}
             onExcludeChange={setExcludeIngredients}
             disabled={isLoading}
           />
 
           {/* Generate Button */}
           <Button
             onClick={handleGenerate}
             disabled={!selectedMealType || isLoading}
             className="w-full"
             size="lg"
             variant="cta"
           >
             {isLoading ? (
               <>
                 <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                 {language === "pt" ? "Gerando receitas personalizadas..." : "Generating personalized recipes..."}
               </>
             ) : (
               <>
                 <Sparkles className="mr-2 h-5 w-5" />
                 {language === "pt" ? "Gerar 4 Receitas com IA" : "Generate 4 Recipes with AI"}
               </>
             )}
           </Button>
 
           {/* Generated Recipes */}
          <AnimatePresence>
            {recipes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                 <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-foreground">
                     {language === "pt" ? "Receitas Personalizadas" : "Personalized Recipes"}
                   </h3>
                   <Button variant="ghost" size="sm" onClick={clearRecipes}>
                     {language === "pt" ? "Limpar" : "Clear"}
                   </Button>
                 </div>
                {recipes.map((recipe, index) => (
                   <RecipeCard key={recipe.id} recipe={recipe} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="secrets" className="space-y-6">
          <Card variant="gradient" className="border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <FlaskConical className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">{t("recipes.secretRecipes")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("recipes.secretDesc")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {secretRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="interactive">
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        {recipe.name[language]}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {recipe.description[language]}
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-foreground mb-2">{t("recipes.ingredients")}</h5>
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients[language].map((ing) => (
                          <Badge key={ing} variant="outline" className="text-xs">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-foreground mb-2">{t("recipes.howTo")}</h5>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        {recipe.instructions[language].map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="pt-3 border-t border-border">
                      <h5 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                        <Leaf className="h-4 w-4 text-primary" />
                        {t("recipes.benefits")}
                      </h5>
                      <div className="flex flex-wrap gap-1">
                        {recipe.benefits[language].map((benefit) => (
                          <Badge key={benefit} variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {recipe.warning && (
                      <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
                        <p className="text-xs text-accent flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                          {recipe.warning[language]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Recipes;
