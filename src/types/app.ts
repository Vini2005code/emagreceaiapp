export interface Mission {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: number;
  image?: string;
}

export interface WaterLog {
  id: string;
  amount: number;
  timestamp: Date;
}

export interface ProgressPhoto {
  id: string;
  imageUrl: string;
  date: Date;
  weight?: number;
  notes?: string;
}

export interface FastingSession {
  startTime: Date;
  endTime: Date;
  targetHours: number;
  isActive: boolean;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface MealSuggestion {
  breakfast: Recipe;
  lunch: Recipe;
  dinner: Recipe;
  snacks?: Recipe[];
}

export interface ExcludedIngredient {
  name: string;
  excludeUntil: Date;
}
