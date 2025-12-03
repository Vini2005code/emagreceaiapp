import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Plus, X, Sparkles, Clock, Flame, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Recipe } from "@/types/app";

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
    // Simulated AI generation
    setTimeout(() => {
      setRecipes(sampleRecipes);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <AppLayout title="Receitas" subtitle="Com o que você tem em casa">
      <div className="space-y-6">
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5 text-primary" />
              Seus Ingredientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite um ingrediente..."
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
                💡 Clique em um ingrediente para excluí-lo das receitas
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
                  Gerando receitas...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Gerar Receitas com IA
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
                Receitas Sugeridas
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
                          {recipe.prepTime}min
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
                        <span>Proteína: {recipe.protein}g</span>
                        <span>Carbs: {recipe.carbs}g</span>
                        <span>Gordura: {recipe.fat}g</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Recipes;
