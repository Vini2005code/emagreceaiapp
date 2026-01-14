import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Apple, Flame, Beef, Droplets, Wheat, AlertCircle, CheckCircle2, Clock, Activity, Zap } from "lucide-react";

interface DietRecommendationProps {
  diet: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    tdee: number;
    bmr?: number;
    deficit: number;
    bodyFat?: number;
    waterIntake?: number;
    weeksToGoal?: number;
    macroRatio?: {
      protein: number;
      carbs: number;
      fat: number;
    };
  };
  bmiCategory: string;
  bodyType: "ectomorph" | "mesomorph" | "endomorph";
}

const dietTips = {
  pt: {
    severeThinness: {
      tips: [
        "Consulte um médico antes de iniciar qualquer dieta",
        "Aumente gradualmente suas calorias em 500-700 por dia",
        "Priorize proteínas de alta qualidade em cada refeição",
        "Faça 5-6 refeições menores ao longo do dia",
      ],
      foods: ["Ovos inteiros", "Frango", "Arroz integral", "Batata doce", "Abacate", "Castanhas", "Pasta de amendoim", "Leite integral"],
      avoid: ["Jejum prolongado", "Exercício intenso sem supervisão", "Alimentos de baixa caloria"],
    },
    moderateThinness: {
      tips: [
        "Aumente suas calorias em 400-500 por dia",
        "Adicione lanches nutritivos entre as refeições",
        "Inclua gorduras saudáveis em todas as refeições",
        "Considere suplementação com orientação profissional",
      ],
      foods: ["Ovos", "Carnes magras", "Arroz", "Batata", "Abacate", "Azeite", "Banana", "Iogurte grego"],
      avoid: ["Pular refeições", "Alimentos ultraprocessados", "Refrigerantes"],
    },
    underweight: {
      tips: [
        "Aumente gradualmente suas calorias em 300-500 por dia",
        "Priorize proteínas de qualidade em todas as refeições",
        "Faça lanches nutritivos entre as refeições principais",
        "Não pule refeições - mantenha horários regulares",
      ],
      foods: ["Ovos", "Frango", "Arroz integral", "Batata doce", "Abacate", "Castanhas", "Banana", "Iogurte natural"],
      avoid: ["Refrigerantes", "Alimentos ultraprocessados", "Jejum prolongado"],
    },
    normal: {
      tips: [
        "Mantenha sua alimentação equilibrada atual",
        "Continue com atividades físicas regulares",
        "Hidrate-se adequadamente ao longo do dia",
        "Priorize alimentos integrais e naturais",
      ],
      foods: ["Vegetais variados", "Frutas frescas", "Proteínas magras", "Grãos integrais", "Legumes", "Peixes"],
      avoid: ["Excesso de açúcar", "Frituras frequentes", "Bebidas alcoólicas em excesso"],
    },
    overweight: {
      tips: [
        "Déficit de 500 kcal/dia = ~0.5kg perdido/semana",
        "Aumente o consumo de proteínas para saciedade",
        "Coma mais fibras para controlar a fome",
        "Evite carboidratos refinados e açúcares simples",
      ],
      foods: ["Frango grelhado", "Peixe", "Ovos", "Vegetais verdes", "Feijão", "Lentilha", "Frutas com casca"],
      avoid: ["Pão branco", "Massas refinadas", "Doces", "Refrigerantes", "Sucos industrializados"],
    },
    obese1: {
      tips: [
        "Déficit calórico de 500-700 kcal é seguro",
        "Proteína alta para preservar massa muscular",
        "Jejum intermitente pode ajudar (16:8)",
        "Caminhe pelo menos 30 minutos por dia",
      ],
      foods: ["Clara de ovo", "Peito de frango", "Tilápia", "Brócolis", "Couve-flor", "Abobrinha", "Tomate"],
      avoid: ["Carboidratos simples", "Alimentos fritos", "Fast food", "Bebidas açucaradas", "Álcool"],
    },
    obese2: {
      tips: [
        "Consulte um nutricionista para acompanhamento",
        "Foque em mudanças graduais e sustentáveis",
        "Monitore seu progresso semanalmente",
        "Considere apoio profissional multidisciplinar",
      ],
      foods: ["Proteínas magras", "Vegetais não-amiláceos", "Ovos", "Peixes", "Folhas verdes", "Legumes"],
      avoid: ["Qualquer açúcar adicionado", "Carboidratos refinados", "Alimentos processados", "Frituras"],
    },
    obese3: {
      tips: [
        "Busque acompanhamento médico especializado",
        "Mudanças alimentares graduais são essenciais",
        "Exercícios de baixo impacto como caminhada e natação",
        "Foque em saúde, não apenas no peso",
      ],
      foods: ["Proteínas de alta qualidade", "Vegetais variados", "Fibras naturais", "Água em abundância"],
      avoid: ["Todos os ultraprocessados", "Açúcares", "Farinhas brancas", "Bebidas calóricas"],
    },
  },
  en: {
    severeThinness: {
      tips: [
        "Consult a doctor before starting any diet",
        "Gradually increase calories by 500-700 per day",
        "Prioritize high-quality protein at every meal",
        "Have 5-6 smaller meals throughout the day",
      ],
      foods: ["Whole eggs", "Chicken", "Brown rice", "Sweet potato", "Avocado", "Nuts", "Peanut butter", "Whole milk"],
      avoid: ["Prolonged fasting", "Intense exercise without supervision", "Low-calorie foods"],
    },
    moderateThinness: {
      tips: [
        "Increase calories by 400-500 per day",
        "Add nutritious snacks between meals",
        "Include healthy fats in every meal",
        "Consider supplementation with professional guidance",
      ],
      foods: ["Eggs", "Lean meats", "Rice", "Potato", "Avocado", "Olive oil", "Banana", "Greek yogurt"],
      avoid: ["Skipping meals", "Ultra-processed foods", "Soft drinks"],
    },
    underweight: {
      tips: [
        "Gradually increase calories by 300-500 per day",
        "Prioritize quality protein at every meal",
        "Have nutritious snacks between main meals",
        "Don't skip meals - keep regular schedules",
      ],
      foods: ["Eggs", "Chicken", "Brown rice", "Sweet potato", "Avocado", "Nuts", "Banana", "Natural yogurt"],
      avoid: ["Soft drinks", "Ultra-processed foods", "Prolonged fasting"],
    },
    normal: {
      tips: [
        "Maintain your current balanced diet",
        "Continue with regular physical activities",
        "Stay properly hydrated throughout the day",
        "Prioritize whole and natural foods",
      ],
      foods: ["Various vegetables", "Fresh fruits", "Lean proteins", "Whole grains", "Legumes", "Fish"],
      avoid: ["Excess sugar", "Frequent fried foods", "Excessive alcohol"],
    },
    overweight: {
      tips: [
        "500 kcal/day deficit = ~0.5kg lost/week",
        "Increase protein intake for satiety",
        "Eat more fiber to control hunger",
        "Avoid refined carbs and simple sugars",
      ],
      foods: ["Grilled chicken", "Fish", "Eggs", "Green vegetables", "Beans", "Lentils", "Fruits with skin"],
      avoid: ["White bread", "Refined pasta", "Sweets", "Soft drinks", "Industrial juices"],
    },
    obese1: {
      tips: [
        "Caloric deficit of 500-700 kcal is safe",
        "High protein to preserve muscle mass",
        "Intermittent fasting can help (16:8)",
        "Walk at least 30 minutes daily",
      ],
      foods: ["Egg whites", "Chicken breast", "Tilapia", "Broccoli", "Cauliflower", "Zucchini", "Tomato"],
      avoid: ["Simple carbs", "Fried foods", "Fast food", "Sugary drinks", "Alcohol"],
    },
    obese2: {
      tips: [
        "Consult a nutritionist for follow-up",
        "Focus on gradual and sustainable changes",
        "Monitor your progress weekly",
        "Consider multidisciplinary professional support",
      ],
      foods: ["Lean proteins", "Non-starchy vegetables", "Eggs", "Fish", "Green leaves", "Legumes"],
      avoid: ["Any added sugar", "Refined carbs", "Processed foods", "Fried foods"],
    },
    obese3: {
      tips: [
        "Seek specialized medical follow-up",
        "Gradual dietary changes are essential",
        "Low-impact exercises like walking and swimming",
        "Focus on health, not just weight",
      ],
      foods: ["High-quality proteins", "Various vegetables", "Natural fibers", "Plenty of water"],
      avoid: ["All ultra-processed", "Sugars", "White flour", "Caloric drinks"],
    },
  },
};

const bodyTypeTips = {
  pt: {
    ectomorph: "Seu metabolismo é naturalmente acelerado. Foque em refeições frequentes e densas em nutrientes. Priorize carboidratos complexos para energia.",
    mesomorph: "Você responde bem a exercícios e ganha músculo com facilidade. Mantenha equilíbrio entre cardio e musculação para resultados ótimos.",
    endomorph: "Seu corpo tende a armazenar energia mais facilmente. Priorize proteínas magras, reduza carboidratos simples e mantenha-se ativo.",
  },
  en: {
    ectomorph: "Your metabolism is naturally fast. Focus on frequent, nutrient-dense meals. Prioritize complex carbs for energy.",
    mesomorph: "You respond well to exercise and gain muscle easily. Keep a balance between cardio and weight training for optimal results.",
    endomorph: "Your body tends to store energy more easily. Prioritize lean protein, reduce simple carbs and stay active.",
  },
};

export function DietRecommendation({ diet, bmiCategory, bodyType }: DietRecommendationProps) {
  const { t, language } = useLanguage();
  
  const tips = dietTips[language][bmiCategory as keyof typeof dietTips.pt] || dietTips[language].normal;
  const bodyTip = bodyTypeTips[language][bodyType];

  const deficitText = diet.deficit > 0 
    ? (language === "pt" ? `Déficit de ${diet.deficit} kcal` : `${diet.deficit} kcal deficit`)
    : diet.deficit < 0 
    ? (language === "pt" ? `Superávit de ${Math.abs(diet.deficit)} kcal` : `${Math.abs(diet.deficit)} kcal surplus`)
    : (language === "pt" ? "Manutenção" : "Maintenance");

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Apple className="h-5 w-5 text-success" />
          {t("diet.title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{t("diet.subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calorie Summary */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-semibold text-foreground">
                {language === "pt" ? "Resumo Calórico" : "Calorie Summary"}
              </span>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
              {deficitText}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {language === "pt" ? "TMB (Basal)" : "BMR (Basal)"}
              </p>
              <p className="text-lg font-bold text-foreground">{diet.bmr || "-"} kcal</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {language === "pt" ? "TDEE (Gasto Total)" : "TDEE (Total)"}
              </p>
              <p className="text-lg font-bold text-foreground">{diet.tdee} kcal</p>
            </div>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-secondary text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-secondary-foreground" />
            <p className="text-2xl font-bold text-secondary-foreground">{diet.calories}</p>
            <p className="text-xs text-muted-foreground">{t("diet.calories")}</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 text-center">
            <Beef className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{diet.protein}g</p>
            <p className="text-xs text-muted-foreground">{t("diet.protein")}</p>
            {diet.macroRatio && (
              <p className="text-xs text-destructive/70">{diet.macroRatio.protein}%</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-warning/10 text-center">
            <Wheat className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold text-warning">{diet.carbs}g</p>
            <p className="text-xs text-muted-foreground">{t("diet.carbs")}</p>
            {diet.macroRatio && (
              <p className="text-xs text-warning/70">{diet.macroRatio.carbs}%</p>
            )}
          </div>
          <div className="p-4 rounded-xl bg-primary/10 text-center">
            <Droplets className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{diet.fat}g</p>
            <p className="text-xs text-muted-foreground">{t("diet.fat")}</p>
            {diet.macroRatio && (
              <p className="text-xs text-primary/70">{diet.macroRatio.fat}%</p>
            )}
          </div>
        </div>

        {/* Fiber & Time to Goal */}
        {(diet.fiber || diet.weeksToGoal) && (
          <div className="flex gap-3">
            {diet.fiber && (
              <div className="flex-1 p-3 rounded-xl bg-muted text-center">
                <p className="text-xs text-muted-foreground">
                  {language === "pt" ? "Fibras" : "Fiber"}
                </p>
                <p className="text-lg font-bold text-foreground">{diet.fiber}g</p>
              </div>
            )}
            {diet.weeksToGoal && diet.weeksToGoal > 0 && (
              <div className="flex-1 p-3 rounded-xl bg-success/10 text-center">
                <Clock className="h-4 w-4 mx-auto mb-1 text-success" />
                <p className="text-xs text-muted-foreground">
                  {language === "pt" ? "Tempo estimado" : "Estimated time"}
                </p>
                <p className="text-lg font-bold text-success">
                  {diet.weeksToGoal} {language === "pt" ? "semanas" : "weeks"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Body Type Tip */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                {language === "pt" ? "Seu Biotipo:" : "Your Body Type:"} {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground">{bodyTip}</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {t("diet.tips")}
          </h4>
          <ul className="space-y-2">
            {tips.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-success mt-1 shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended Foods */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Apple className="h-4 w-4 text-success" />
            {t("diet.foods")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {tips.foods.map((food, index) => (
              <span 
                key={index}
                className="px-3 py-1 rounded-full bg-success/10 text-success text-sm"
              >
                {food}
              </span>
            ))}
          </div>
        </div>

        {/* Foods to Avoid */}
        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {t("diet.avoid")}
          </h4>
          <div className="flex flex-wrap gap-2">
            {tips.avoid.map((food, index) => (
              <span 
                key={index}
                className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm"
              >
                {food}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
