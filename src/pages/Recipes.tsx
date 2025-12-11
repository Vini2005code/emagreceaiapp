import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChefHat, Plus, X, Sparkles, Clock, Flame, Loader2, FlaskConical, Leaf, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Recipe } from "@/types/app";

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

const sampleRecipes: Recipe[] = [
  {
    id: "1",
    name: "Omelete de Frango com Ervas",
    ingredients: ["ovos", "frango desfiado", "ervas"],
    instructions: [
      "Bata 2 ovos em uma tigela",
      "Adicione o frango desfiado e tempere",
      "Cozinhe em fogo médio por 3 minutos de cada lado",
    ],
    calories: 280,
    protein: 32,
    carbs: 2,
    fat: 16,
    prepTime: 10,
  },
  {
    id: "2",
    name: "Bowl de Iogurte Proteico",
    ingredients: ["iogurte natural", "frango", "temperos"],
    instructions: [
      "Misture o iogurte com temperos",
      "Adicione pedaços de frango grelhado",
      "Sirva gelado",
    ],
    calories: 220,
    protein: 28,
    carbs: 8,
    fat: 8,
    prepTime: 5,
  },
];

const Recipes = () => {
  const { t, language } = useLanguage();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);

  const addIngredient = () => {
    if (inputValue.trim() && !ingredients.includes(inputValue.trim().toLowerCase())) {
      setIngredients([...ingredients, inputValue.trim().toLowerCase()]);
      setInputValue("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const toggleExclude = (ingredient: string) => {
    if (excludedIngredients.includes(ingredient)) {
      setExcludedIngredients(excludedIngredients.filter((i) => i !== ingredient));
    } else {
      setExcludedIngredients([...excludedIngredients, ingredient]);
    }
  };

  const generateRecipes = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setRecipes(sampleRecipes);
      setIsGenerating(false);
    }, 1500);
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
          <Card variant="gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                {t("recipes.yourIngredients")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t("recipes.typeIngredient")}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                  className="flex-1"
                />
                <Button onClick={addIngredient} size="icon">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              <AnimatePresence>
                {ingredients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {ingredients.map((ingredient) => (
                      <motion.div
                        key={ingredient}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Badge
                          variant={excludedIngredients.includes(ingredient) ? "destructive" : "secondary"}
                          className="pl-3 pr-2 py-1.5 cursor-pointer"
                          onClick={() => toggleExclude(ingredient)}
                        >
                          {ingredient}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeIngredient(ingredient);
                            }}
                            className="ml-2 hover:bg-background/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {excludedIngredients.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t("recipes.clickToExclude")}
                </p>
              )}

              <Button
                onClick={generateRecipes}
                disabled={ingredients.length < 2 || isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("recipes.generatingRecipes")}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    {t("recipes.generateWithAI")}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <AnimatePresence>
            {recipes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-bold text-foreground">
                  {t("recipes.suggestedRecipes")}
                </h3>
                {recipes.map((recipe, index) => (
                  <motion.div
                    key={recipe.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="interactive">
                      <CardContent className="p-4">
                        <h4 className="font-bold text-lg mb-2 text-foreground">
                          {recipe.name}
                        </h4>
                        <div className="flex gap-4 mb-3 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {recipe.prepTime}{t("general.min")}
                          </span>
                          <span className="flex items-center gap-1 text-accent">
                            <Flame className="h-4 w-4" />
                            {recipe.calories} kcal
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {recipe.ingredients.map((ing) => (
                            <Badge key={ing} variant="outline" className="text-xs">
                              {ing}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground grid grid-cols-3 gap-2 pt-2 border-t border-border">
                          <span>{t("diet.protein")}: {recipe.protein}g</span>
                          <span>{t("diet.carbs")}: {recipe.carbs}g</span>
                          <span>{t("diet.fat")}: {recipe.fat}g</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
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
