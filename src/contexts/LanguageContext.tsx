import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  pt: {
    // Header
    "app.title": "Emagrece AI",
    "app.subtitle": "Seu assistente de emagrecimento",
    
    // Index
    "home.greeting": "Olá! 👋",
    "home.motivation": "Vamos conquistar seus objetivos hoje?",
    "home.quickAccess": "Acesso Rápido",
    
    // Navigation
    "nav.home": "Início",
    "nav.scanner": "Scanner",
    "nav.recipes": "Receitas",
    "nav.missions": "Missões",
    "nav.fasting": "Jejum",
    "nav.hydration": "Hidratação",
    "nav.progress": "Progresso",
    "nav.mealPlan": "Cardápio",
    "nav.profile": "Perfil",
    
    // Profile/BMI
    "profile.title": "Meu Perfil",
    "profile.subtitle": "Configure seu perfil para recomendações personalizadas",
    "profile.name": "Nome",
    "profile.age": "Idade",
    "profile.weight": "Peso (kg)",
    "profile.height": "Altura (cm)",
    "profile.gender": "Sexo",
    "profile.male": "Masculino",
    "profile.female": "Feminino",
    "profile.activityLevel": "Nível de Atividade",
    "profile.sedentary": "Sedentário",
    "profile.light": "Leve",
    "profile.moderate": "Moderado",
    "profile.active": "Ativo",
    "profile.veryActive": "Muito Ativo",
    "profile.bodyType": "Tipo Físico",
    "profile.ectomorph": "Ectomorfo (magro, dificuldade em ganhar peso)",
    "profile.mesomorph": "Mesomorfo (atlético, ganha músculo fácil)",
    "profile.endomorph": "Endomorfo (tendência a acumular gordura)",
    "profile.goalWeight": "Meta de Peso (kg)",
    "profile.save": "Salvar Perfil",
    "profile.saved": "Perfil salvo com sucesso!",
    
    // BMI
    "bmi.title": "Seu IMC",
    "bmi.underweight": "Abaixo do peso",
    "bmi.normal": "Peso normal",
    "bmi.overweight": "Sobrepeso",
    "bmi.obese1": "Obesidade grau I",
    "bmi.obese2": "Obesidade grau II",
    "bmi.obese3": "Obesidade grau III",
    "bmi.current": "IMC Atual",
    "bmi.ideal": "Peso Ideal",
    "bmi.tolose": "Para perder",
    
    // Diet Recommendations
    "diet.title": "Dieta Recomendada",
    "diet.subtitle": "Baseada no seu perfil e IMC",
    "diet.calories": "Calorias diárias",
    "diet.protein": "Proteína",
    "diet.carbs": "Carboidratos",
    "diet.fat": "Gorduras",
    "diet.tips": "Dicas Personalizadas",
    "diet.foods": "Alimentos Recomendados",
    "diet.avoid": "Evitar",
    
    // Missions
    "missions.daily": "Missões do Dia",
    "missions.completed": "concluídas",
    
    // Water
    "water.title": "Água",
    "water.goal": "Meta diária",
    "water.add": "Adicionar",
    
    // Fasting
    "fasting.title": "Jejum",
    "fasting.start": "Iniciar Jejum",
    "fasting.stop": "Parar Jejum",
    "fasting.remaining": "restantes",
    
    // General
    "general.save": "Salvar",
    "general.cancel": "Cancelar",
    "general.edit": "Editar",
    "general.delete": "Deletar",
    "general.loading": "Carregando...",
    "general.error": "Erro",
    "general.success": "Sucesso",
  },
  en: {
    // Header
    "app.title": "Emagrece AI",
    "app.subtitle": "Your weight loss assistant",
    
    // Index
    "home.greeting": "Hello! 👋",
    "home.motivation": "Ready to achieve your goals today?",
    "home.quickAccess": "Quick Access",
    
    // Navigation
    "nav.home": "Home",
    "nav.scanner": "Scanner",
    "nav.recipes": "Recipes",
    "nav.missions": "Missions",
    "nav.fasting": "Fasting",
    "nav.hydration": "Hydration",
    "nav.progress": "Progress",
    "nav.mealPlan": "Meal Plan",
    "nav.profile": "Profile",
    
    // Profile/BMI
    "profile.title": "My Profile",
    "profile.subtitle": "Set up your profile for personalized recommendations",
    "profile.name": "Name",
    "profile.age": "Age",
    "profile.weight": "Weight (kg)",
    "profile.height": "Height (cm)",
    "profile.gender": "Gender",
    "profile.male": "Male",
    "profile.female": "Female",
    "profile.activityLevel": "Activity Level",
    "profile.sedentary": "Sedentary",
    "profile.light": "Light",
    "profile.moderate": "Moderate",
    "profile.active": "Active",
    "profile.veryActive": "Very Active",
    "profile.bodyType": "Body Type",
    "profile.ectomorph": "Ectomorph (thin, hard to gain weight)",
    "profile.mesomorph": "Mesomorph (athletic, gains muscle easily)",
    "profile.endomorph": "Endomorph (tendency to store fat)",
    "profile.goalWeight": "Goal Weight (kg)",
    "profile.save": "Save Profile",
    "profile.saved": "Profile saved successfully!",
    
    // BMI
    "bmi.title": "Your BMI",
    "bmi.underweight": "Underweight",
    "bmi.normal": "Normal weight",
    "bmi.overweight": "Overweight",
    "bmi.obese1": "Obesity class I",
    "bmi.obese2": "Obesity class II",
    "bmi.obese3": "Obesity class III",
    "bmi.current": "Current BMI",
    "bmi.ideal": "Ideal Weight",
    "bmi.tolose": "To lose",
    
    // Diet Recommendations
    "diet.title": "Recommended Diet",
    "diet.subtitle": "Based on your profile and BMI",
    "diet.calories": "Daily calories",
    "diet.protein": "Protein",
    "diet.carbs": "Carbohydrates",
    "diet.fat": "Fats",
    "diet.tips": "Personalized Tips",
    "diet.foods": "Recommended Foods",
    "diet.avoid": "Avoid",
    
    // Missions
    "missions.daily": "Daily Missions",
    "missions.completed": "completed",
    
    // Water
    "water.title": "Water",
    "water.goal": "Daily goal",
    "water.add": "Add",
    
    // Fasting
    "fasting.title": "Fasting",
    "fasting.start": "Start Fasting",
    "fasting.stop": "Stop Fasting",
    "fasting.remaining": "remaining",
    
    // General
    "general.save": "Save",
    "general.cancel": "Cancel",
    "general.edit": "Edit",
    "general.delete": "Delete",
    "general.loading": "Loading...",
    "general.error": "Error",
    "general.success": "Success",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "pt";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.pt] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
