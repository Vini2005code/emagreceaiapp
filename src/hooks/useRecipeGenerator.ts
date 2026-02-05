 import { useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { useUserProfile } from "./useUserProfile";
 import { useLanguage } from "@/contexts/LanguageContext";
 
 export interface RecipeIngredient {
   name: string;
   amount: string;
   unit: string;
 }
 
 export interface RecipeNutrition {
   calories: number;
   protein: number;
   carbs: number;
   fat: number;
   fiber: number;
 }
 
 export interface RecipeSubstitution {
   original: string;
   substitute: string;
   reason: string;
 }
 
 export interface GeneratedRecipe {
   id: string;
   name: string;
   description: string;
   prepTime: number;
   difficulty: "easy" | "medium" | "hard";
   ingredients: RecipeIngredient[];
   instructions: string[];
   nutrition: RecipeNutrition;
   substitutions: RecipeSubstitution[];
   tips?: string;
 }
 
 export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
 
 interface GenerateRecipesParams {
   mealType: MealType;
   preferences?: string[];
   restrictions?: string[];
   excludeIngredients?: string[];
   availableIngredients?: string[];
 }
 
 export function useRecipeGenerator() {
   const [isLoading, setIsLoading] = useState(false);
   const [recipes, setRecipes] = useState<GeneratedRecipe[]>([]);
   const [error, setError] = useState<string | null>(null);
   const { profile, getDietRecommendation } = useUserProfile();
   const { language } = useLanguage();
 
   const generateRecipes = async ({
     mealType,
     preferences = [],
     restrictions = [],
     excludeIngredients = [],
     availableIngredients = [],
   }: GenerateRecipesParams) => {
     setIsLoading(true);
     setError(null);
     setRecipes([]);
 
     try {
       const diet = getDietRecommendation();
       
       // Calculate per-meal targets (rough distribution)
       const mealDistribution: Record<MealType, number> = {
         breakfast: 0.25,
         lunch: 0.35,
         dinner: 0.30,
         snack: 0.10,
       };
       
       const mealPercent = mealDistribution[mealType];
       const targetCalories = Math.round(diet.calories * mealPercent);
       const targetProtein = Math.round(diet.protein * mealPercent);
       const targetCarbs = Math.round(diet.carbs * mealPercent);
       const targetFat = Math.round(diet.fat * mealPercent);
 
       const { data, error: fnError } = await supabase.functions.invoke("generate-recipes", {
         body: {
           mealType,
           profile: {
             weight: profile.weight,
             height: profile.height,
             age: profile.age,
             gender: profile.gender,
             activityLevel: profile.activityLevel,
             goalWeight: profile.goalWeight,
           },
           preferences,
           restrictions,
           excludeIngredients,
           availableIngredients,
           targetCalories,
           targetProtein,
           targetCarbs,
           targetFat,
           language,
         },
       });
 
       if (fnError) {
         throw new Error(fnError.message || "Failed to generate recipes");
       }
 
       if (data?.error) {
         if (data.error.includes("Rate limit")) {
           toast.error(language === "pt" 
             ? "Limite de requisições atingido. Tente novamente em alguns segundos." 
             : "Rate limit reached. Try again in a few seconds.");
         } else if (data.error.includes("Payment required")) {
           toast.error(language === "pt"
             ? "Créditos insuficientes. Adicione créditos para continuar."
             : "Insufficient credits. Add credits to continue.");
         }
         throw new Error(data.error);
       }
 
       if (data?.recipes && Array.isArray(data.recipes)) {
         setRecipes(data.recipes);
         toast.success(language === "pt" 
           ? `${data.recipes.length} receitas personalizadas geradas!` 
           : `${data.recipes.length} personalized recipes generated!`);
       } else {
         throw new Error("Invalid response format");
       }
     } catch (err) {
       const message = err instanceof Error ? err.message : "Unknown error";
       setError(message);
       console.error("Recipe generation error:", err);
       if (!message.includes("Rate limit") && !message.includes("Payment")) {
         toast.error(language === "pt" 
           ? "Erro ao gerar receitas. Tente novamente." 
           : "Error generating recipes. Try again.");
       }
     } finally {
       setIsLoading(false);
     }
   };
 
   const clearRecipes = () => {
     setRecipes([]);
     setError(null);
   };
 
   return {
     isLoading,
     recipes,
     error,
     generateRecipes,
     clearRecipes,
   };
 }