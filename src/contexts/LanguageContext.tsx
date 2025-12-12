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
    
    // Missions Page
    "missions.daily": "Missões Diárias",
    "missions.subtitle": "O Chefe dá as ordens",
    "missions.completed": "concluídas",
    "missions.points": "pontos",
    "missions.today": "Missões de Hoje",
    "missions.congrats": "Parabéns! 🎉",
    "missions.allComplete": "Você completou todas as missões de hoje!",
    "missions.mission1.title": "Beber 500ml de água em jejum",
    "missions.mission1.desc": "Hidrate seu corpo logo ao acordar",
    "missions.mission2.title": "Caminhar 20 minutos",
    "missions.mission2.desc": "Movimento é essencial para saúde",
    "missions.mission3.title": "Não comer açúcar hoje",
    "missions.mission3.desc": "Evite doces e refrigerantes",
    "missions.mission4.title": "Dormir antes das 23h",
    "missions.mission4.desc": "Sono de qualidade é fundamental",
    "missions.mission5.title": "Comer uma fruta",
    "missions.mission5.desc": "Vitaminas e fibras naturais",
    "missions.mission6.title": "Fazer 10 flexões",
    "missions.mission6.desc": "Fortaleça seus músculos",
    "missions.mission7.title": "Meditar 5 minutos",
    "missions.mission7.desc": "Acalme sua mente",
    "missions.mission8.title": "Subir escadas ao invés do elevador",
    "missions.mission8.desc": "Pequenas ações fazem diferença",
    "missions.mission9.title": "Comer vegetais no almoço",
    "missions.mission9.desc": "Verde no prato é saúde",
    "missions.mission10.title": "Não comer após 20h",
    "missions.mission10.desc": "Dê tempo ao seu sistema digestivo",
    "missions.customMissions": "Suas Missões",
    "missions.addCustom": "Adicionar Missão",
    "missions.customTitle": "Título da missão",
    "missions.customDesc": "Descrição (opcional)",
    "missions.add": "Adicionar",
    "missions.suggested": "Sugeridas",
    "missions.custom": "Personalizadas",
    "missions.noCustom": "Nenhuma missão personalizada",
    "missions.createFirst": "Crie sua primeira missão personalizada!",
    
    // Water/Hydration
    "water.title": "Hidratação",
    "water.subtitle": "Calculadora inteligente de água",
    "water.goal": "Meta diária",
    "water.add": "Adicionar",
    "water.of": "de",
    "water.calculateGoal": "Calcular Meta",
    "water.weightTip": "Seu peso define a quantidade ideal de água por dia (35ml/kg)",
    "water.todayLog": "Registro de Hoje",
    
    // Fasting
    "fasting.title": "Jejum Intermitente",
    "fasting.subtitle": "Controle seu tempo de jejum",
    "fasting.start": "Iniciar",
    "fasting.pause": "Pausar",
    "fasting.stop": "Parar Jejum",
    "fasting.remaining": "Faltam",
    "fasting.complete": "completo",
    "fasting.protocol": "Protocolo de Jejum",
    "fasting.fastPeriod": "Período de jejum",
    "fasting.eatWindow": "Janela alimentar",
    "fasting.fasting": "jejum",
    "fasting.msg100": "🎉 Jejum completo! Você conseguiu!",
    "fasting.msg75": "💪 Quase lá! Falta pouco!",
    "fasting.msg50": "🔥 Metade do caminho! Continue firme!",
    "fasting.msg25": "⚡ Bom progresso! Mantenha o foco!",
    "fasting.msg0": "🚀 Você começou! Vamos nessa!",
    "fasting.inProgress": "Em andamento",
    "fasting.paused": "Pausado",
    
    // Progress Page
    "progress.title": "Progresso",
    "progress.subtitle": "Galeria antes e depois",
    "progress.newPhoto": "Nova Foto",
    "progress.compare": "Comparar",
    "progress.comparison": "Comparação",
    "progress.selectPhotos": "Selecione 2 fotos para comparar",
    "progress.selected": "selecionadas",
    "progress.yourGallery": "Sua Galeria",
    "progress.noPhotos": "Nenhuma foto ainda",
    "progress.addFirst": "Adicione sua primeira foto de progresso",
    "progress.difference": "de diferença",
    
    // Meal Plan
    "mealplan.title": "Prato Feito",
    "mealplan.subtitle": "Sugestão de cardápio do dia",
    "mealplan.dontKnow": "Não sabe o que comer?",
    "mealplan.suggestion": "Receba sugestões de café, almoço e jantar com alimentos acessíveis",
    "mealplan.generate": "Gerar Cardápio",
    "mealplan.generating": "Gerando...",
    "mealplan.newMenu": "Gerar Novo Cardápio",
    "mealplan.totalKcal": "kcal total",
    "mealplan.breakfast": "Café da Manhã",
    "mealplan.lunch": "Almoço",
    "mealplan.dinner": "Jantar",
    
    // Scanner
    "scanner.title": "Scanner de Prato",
    "scanner.subtitle": "Analise calorias por foto",
    "scanner.takePhoto": "Tire uma foto do prato",
    "scanner.aiAnalyze": "Nossa IA irá analisar e estimar as informações nutricionais",
    "scanner.uploadPhoto": "Enviar Foto",
    "scanner.camera": "Câmera",
    "scanner.analyzing": "Analisando prato...",
    "scanner.aiWorking": "Nossa IA está trabalhando",
    "scanner.nutritionInfo": "Informações Nutricionais",
    "scanner.calories": "Calorias",
    "scanner.protein": "Proteína",
    "scanner.carbs": "Carboidratos",
    "scanner.fat": "Gordura",
    "scanner.fiber": "Fibra",
    "scanner.sugar": "Açúcar",
    "scanner.analyzeAnother": "Analisar outro prato",
    
    // Recipes
    "recipes.title": "Receitas",
    "recipes.subtitle": "Descubra sabores saudáveis",
    "recipes.generator": "Gerador",
    "recipes.secrets": "Secretas",
    "recipes.yourIngredients": "Seus Ingredientes",
    "recipes.typeIngredient": "Digite um ingrediente...",
    "recipes.clickToExclude": "💡 Clique em um ingrediente para excluí-lo das receitas",
    "recipes.generatingRecipes": "Gerando receitas...",
    "recipes.generateWithAI": "Gerar Receitas com IA",
    "recipes.suggestedRecipes": "Receitas Sugeridas",
    "recipes.secretRecipes": "Receitas Secretas",
    "recipes.secretDesc": "Alternativas naturais e acessíveis que realmente ajudam na dieta. Transparência total sobre o que funciona.",
    "recipes.ingredients": "Ingredientes:",
    "recipes.howTo": "Como fazer:",
    "recipes.benefits": "Benefícios:",
    
    // Dashboard Widgets
    "dashboard.dailyMissions": "Missões do Dia",
    "dashboard.hydration": "Hidratação",
    "dashboard.intermittentFasting": "Jejum Intermitente",
    "dashboard.goal": "Meta",
    
    // Quick Actions
    "quickActions.scanner": "Scanner de Prato",
    "quickActions.scannerDesc": "Calcule calorias por foto",
    "quickActions.recipes": "Receitas",
    "quickActions.recipesDesc": "Com o que você tem",
    "quickActions.fasting": "Jejum",
    "quickActions.fastingDesc": "Controle seu tempo",
    "quickActions.hydration": "Hidratação",
    "quickActions.hydrationDesc": "Meta de água",
    "quickActions.progress": "Progresso",
    "quickActions.progressDesc": "Antes e depois",
    "quickActions.mealPlan": "Cardápio",
    "quickActions.mealPlanDesc": "Sugestão do dia",
    
    // Dashboard Missions
    "dashMissions.drink": "Beber 500ml de água em jejum",
    "dashMissions.drinkDesc": "Hidrate-se logo ao acordar",
    "dashMissions.walk": "Caminhar 20 minutos",
    "dashMissions.walkDesc": "Movimento é essencial",
    "dashMissions.noSugar": "Evitar açúcar hoje",
    "dashMissions.noSugarDesc": "Seu corpo agradece",
    
    // General
    "general.save": "Salvar",
    "general.cancel": "Cancelar",
    "general.edit": "Editar",
    "general.delete": "Deletar",
    "general.loading": "Carregando...",
    "general.error": "Erro",
    "general.success": "Sucesso",
    "general.of": "de",
    "general.min": "min",
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
    
    // Missions Page
    "missions.daily": "Daily Missions",
    "missions.subtitle": "The Boss gives the orders",
    "missions.completed": "completed",
    "missions.points": "points",
    "missions.today": "Today's Missions",
    "missions.congrats": "Congratulations! 🎉",
    "missions.allComplete": "You completed all missions today!",
    "missions.mission1.title": "Drink 500ml of water on empty stomach",
    "missions.mission1.desc": "Hydrate your body right after waking up",
    "missions.mission2.title": "Walk 20 minutes",
    "missions.mission2.desc": "Movement is essential for health",
    "missions.mission3.title": "No sugar today",
    "missions.mission3.desc": "Avoid sweets and soft drinks",
    "missions.mission4.title": "Sleep before 11pm",
    "missions.mission4.desc": "Quality sleep is fundamental",
    "missions.mission5.title": "Eat a fruit",
    "missions.mission5.desc": "Natural vitamins and fiber",
    "missions.mission6.title": "Do 10 push-ups",
    "missions.mission6.desc": "Strengthen your muscles",
    "missions.mission7.title": "Meditate 5 minutes",
    "missions.mission7.desc": "Calm your mind",
    "missions.mission8.title": "Take stairs instead of elevator",
    "missions.mission8.desc": "Small actions make a difference",
    "missions.mission9.title": "Eat vegetables at lunch",
    "missions.mission9.desc": "Greens on plate mean health",
    "missions.mission10.title": "No eating after 8pm",
    "missions.mission10.desc": "Give your digestive system time",
    "missions.customMissions": "Your Missions",
    "missions.addCustom": "Add Mission",
    "missions.customTitle": "Mission title",
    "missions.customDesc": "Description (optional)",
    "missions.add": "Add",
    "missions.suggested": "Suggested",
    "missions.custom": "Custom",
    "missions.noCustom": "No custom missions",
    "missions.createFirst": "Create your first custom mission!",
    
    // Water/Hydration
    "water.title": "Hydration",
    "water.subtitle": "Smart water calculator",
    "water.goal": "Daily goal",
    "water.add": "Add",
    "water.of": "of",
    "water.calculateGoal": "Calculate Goal",
    "water.weightTip": "Your weight defines ideal water intake per day (35ml/kg)",
    "water.todayLog": "Today's Log",
    
    // Fasting
    "fasting.title": "Intermittent Fasting",
    "fasting.subtitle": "Control your fasting time",
    "fasting.start": "Start",
    "fasting.pause": "Pause",
    "fasting.stop": "Stop Fasting",
    "fasting.remaining": "Remaining",
    "fasting.complete": "complete",
    "fasting.protocol": "Fasting Protocol",
    "fasting.fastPeriod": "Fasting period",
    "fasting.eatWindow": "Eating window",
    "fasting.fasting": "fasting",
    "fasting.msg100": "🎉 Fasting complete! You did it!",
    "fasting.msg75": "💪 Almost there! Just a little more!",
    "fasting.msg50": "🔥 Halfway there! Keep going!",
    "fasting.msg25": "⚡ Good progress! Stay focused!",
    "fasting.msg0": "🚀 You started! Let's go!",
    "fasting.inProgress": "In progress",
    "fasting.paused": "Paused",
    
    // Progress Page
    "progress.title": "Progress",
    "progress.subtitle": "Before and after gallery",
    "progress.newPhoto": "New Photo",
    "progress.compare": "Compare",
    "progress.comparison": "Comparison",
    "progress.selectPhotos": "Select 2 photos to compare",
    "progress.selected": "selected",
    "progress.yourGallery": "Your Gallery",
    "progress.noPhotos": "No photos yet",
    "progress.addFirst": "Add your first progress photo",
    "progress.difference": "difference",
    
    // Meal Plan
    "mealplan.title": "Meal Plan",
    "mealplan.subtitle": "Daily menu suggestion",
    "mealplan.dontKnow": "Don't know what to eat?",
    "mealplan.suggestion": "Get breakfast, lunch and dinner suggestions with affordable foods",
    "mealplan.generate": "Generate Menu",
    "mealplan.generating": "Generating...",
    "mealplan.newMenu": "Generate New Menu",
    "mealplan.totalKcal": "total kcal",
    "mealplan.breakfast": "Breakfast",
    "mealplan.lunch": "Lunch",
    "mealplan.dinner": "Dinner",
    
    // Scanner
    "scanner.title": "Plate Scanner",
    "scanner.subtitle": "Analyze calories by photo",
    "scanner.takePhoto": "Take a photo of the plate",
    "scanner.aiAnalyze": "Our AI will analyze and estimate nutritional information",
    "scanner.uploadPhoto": "Upload Photo",
    "scanner.camera": "Camera",
    "scanner.analyzing": "Analyzing plate...",
    "scanner.aiWorking": "Our AI is working",
    "scanner.nutritionInfo": "Nutritional Information",
    "scanner.calories": "Calories",
    "scanner.protein": "Protein",
    "scanner.carbs": "Carbohydrates",
    "scanner.fat": "Fat",
    "scanner.fiber": "Fiber",
    "scanner.sugar": "Sugar",
    "scanner.analyzeAnother": "Analyze another plate",
    
    // Recipes
    "recipes.title": "Recipes",
    "recipes.subtitle": "Discover healthy flavors",
    "recipes.generator": "Generator",
    "recipes.secrets": "Secrets",
    "recipes.yourIngredients": "Your Ingredients",
    "recipes.typeIngredient": "Type an ingredient...",
    "recipes.clickToExclude": "💡 Click an ingredient to exclude from recipes",
    "recipes.generatingRecipes": "Generating recipes...",
    "recipes.generateWithAI": "Generate Recipes with AI",
    "recipes.suggestedRecipes": "Suggested Recipes",
    "recipes.secretRecipes": "Secret Recipes",
    "recipes.secretDesc": "Natural and affordable alternatives that really help with dieting. Full transparency on what works.",
    "recipes.ingredients": "Ingredients:",
    "recipes.howTo": "How to make:",
    "recipes.benefits": "Benefits:",
    
    // Dashboard Widgets
    "dashboard.dailyMissions": "Daily Missions",
    "dashboard.hydration": "Hydration",
    "dashboard.intermittentFasting": "Intermittent Fasting",
    "dashboard.goal": "Goal",
    
    // Quick Actions
    "quickActions.scanner": "Plate Scanner",
    "quickActions.scannerDesc": "Calculate calories by photo",
    "quickActions.recipes": "Recipes",
    "quickActions.recipesDesc": "With what you have",
    "quickActions.fasting": "Fasting",
    "quickActions.fastingDesc": "Control your time",
    "quickActions.hydration": "Hydration",
    "quickActions.hydrationDesc": "Water goal",
    "quickActions.progress": "Progress",
    "quickActions.progressDesc": "Before and after",
    "quickActions.mealPlan": "Meal Plan",
    "quickActions.mealPlanDesc": "Daily suggestion",
    
    // Dashboard Missions
    "dashMissions.drink": "Drink 500ml of water on empty stomach",
    "dashMissions.drinkDesc": "Hydrate right after waking up",
    "dashMissions.walk": "Walk 20 minutes",
    "dashMissions.walkDesc": "Movement is essential",
    "dashMissions.noSugar": "Avoid sugar today",
    "dashMissions.noSugarDesc": "Your body thanks you",
    
    // General
    "general.save": "Save",
    "general.cancel": "Cancel",
    "general.edit": "Edit",
    "general.delete": "Delete",
    "general.loading": "Loading...",
    "general.error": "Error",
    "general.success": "Success",
    "general.of": "of",
    "general.min": "min",
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
