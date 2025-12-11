import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Apple, Flame, Beef, Droplets, Wheat, AlertCircle, CheckCircle2 } from "lucide-react";

interface DietRecommendationProps {
  diet: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    tdee: number;
    deficit: number;
  };
  bmiCategory: string;
  bodyType: "ectomorph" | "mesomorph" | "endomorph";
}

const dietTips = {
  pt: {
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
        "Mantenha sua alimentação equilibrada",
        "Continue com atividades físicas regulares",
        "Hidrate-se adequadamente ao longo do dia",
        "Priorize alimentos integrais e naturais",
      ],
      foods: ["Vegetais variados", "Frutas frescas", "Proteínas magras", "Grãos integrais", "Legumes", "Peixes"],
      avoid: ["Excesso de açúcar", "Frituras frequentes", "Bebidas alcoólicas em excesso"],
    },
    overweight: {
      tips: [
        "Reduza 500 calorias/dia para perder ~0.5kg/semana",
        "Aumente o consumo de proteínas para saciedade",
        "Coma mais fibras para controlar a fome",
        "Evite carboidratos refinados e açúcares",
      ],
      foods: ["Frango grelhado", "Peixe", "Ovos", "Vegetais verdes", "Feijão", "Lentilha", "Frutas com casca"],
      avoid: ["Pão branco", "Massas refinadas", "Doces", "Refrigerantes", "Sucos industrializados"],
    },
    obese1: {
      tips: [
        "Déficit calórico de 500-700 calorias é seguro",
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
        "Maintain a balanced diet",
        "Continue with regular physical activities",
        "Stay properly hydrated throughout the day",
        "Prioritize whole and natural foods",
      ],
      foods: ["Various vegetables", "Fresh fruits", "Lean proteins", "Whole grains", "Legumes", "Fish"],
      avoid: ["Excess sugar", "Frequent fried foods", "Excessive alcohol"],
    },
    overweight: {
      tips: [
        "Reduce 500 calories/day to lose ~0.5kg/week",
        "Increase protein intake for satiety",
        "Eat more fiber to control hunger",
        "Avoid refined carbs and sugars",
      ],
      foods: ["Grilled chicken", "Fish", "Eggs", "Green vegetables", "Beans", "Lentils", "Fruits with skin"],
      avoid: ["White bread", "Refined pasta", "Sweets", "Soft drinks", "Industrial juices"],
    },
    obese1: {
      tips: [
        "Caloric deficit of 500-700 calories is safe",
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
    ectomorph: "Seu metabolismo é acelerado. Foque em refeições frequentes e densas em nutrientes.",
    mesomorph: "Você responde bem a exercícios. Mantenha equilíbrio entre cardio e musculação.",
    endomorph: "Seu corpo tende a armazenar gordura. Priorize proteínas e reduza carboidratos simples.",
  },
  en: {
    ectomorph: "Your metabolism is fast. Focus on frequent, nutrient-dense meals.",
    mesomorph: "You respond well to exercise. Keep a balance between cardio and weight training.",
    endomorph: "Your body tends to store fat. Prioritize protein and reduce simple carbs.",
  },
};

export function DietRecommendation({ diet, bmiCategory, bodyType }: DietRecommendationProps) {
  const { t, language } = useLanguage();
  
  const tips = dietTips[language][bmiCategory as keyof typeof dietTips.pt] || dietTips[language].normal;
  const bodyTip = bodyTypeTips[language][bodyType];

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
        {/* Macros Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-accent text-center">
            <Flame className="h-5 w-5 mx-auto mb-1 text-accent-foreground" />
            <p className="text-2xl font-bold text-accent-foreground">{diet.calories}</p>
            <p className="text-xs text-muted-foreground">{t("diet.calories")}</p>
          </div>
          <div className="p-4 rounded-xl bg-destructive/10 text-center">
            <Beef className="h-5 w-5 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold text-destructive">{diet.protein}g</p>
            <p className="text-xs text-muted-foreground">{t("diet.protein")}</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/10 text-center">
            <Wheat className="h-5 w-5 mx-auto mb-1 text-warning" />
            <p className="text-2xl font-bold text-warning">{diet.carbs}g</p>
            <p className="text-xs text-muted-foreground">{t("diet.carbs")}</p>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 text-center">
            <Droplets className="h-5 w-5 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold text-primary">{diet.fat}g</p>
            <p className="text-xs text-muted-foreground">{t("diet.fat")}</p>
          </div>
        </div>

        {/* Body Type Tip */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground">{bodyTip}</p>
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
                <span className="text-success mt-1">•</span>
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
