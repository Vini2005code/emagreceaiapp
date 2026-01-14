import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scale, TrendingDown, Target, Activity, Droplets } from "lucide-react";

interface BMIDisplayProps {
  bmi: number;
  category: string;
  idealWeight: { min: number; max: number; optimal: number };
  currentWeight: number;
  goalWeight: number;
  bodyFat?: number;
  waterIntake?: number;
}

const categoryTranslations = {
  pt: {
    severeThinness: "Magreza severa",
    moderateThinness: "Magreza moderada",
    underweight: "Abaixo do peso",
    normal: "Peso normal",
    overweight: "Sobrepeso",
    obese1: "Obesidade grau I",
    obese2: "Obesidade grau II",
    obese3: "Obesidade grau III",
  },
  en: {
    severeThinness: "Severe thinness",
    moderateThinness: "Moderate thinness",
    underweight: "Underweight",
    normal: "Normal weight",
    overweight: "Overweight",
    obese1: "Obesity class I",
    obese2: "Obesity class II",
    obese3: "Obesity class III",
  }
};

export function BMIDisplay({ 
  bmi, 
  category, 
  idealWeight, 
  currentWeight, 
  goalWeight,
  bodyFat = 0,
  waterIntake = 2000
}: BMIDisplayProps) {
  const { t, language } = useLanguage();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "severeThinness":
      case "moderateThinness":
        return "text-destructive";
      case "underweight": 
        return "text-warning";
      case "normal": 
        return "text-success";
      case "overweight": 
        return "text-warning";
      default: 
        return "text-destructive";
    }
  };

  const getCategoryBg = (cat: string) => {
    switch (cat) {
      case "severeThinness":
      case "moderateThinness":
        return "bg-destructive/20";
      case "underweight": 
        return "bg-warning/20";
      case "normal": 
        return "bg-success/20";
      case "overweight": 
        return "bg-warning/20";
      default: 
        return "bg-destructive/20";
    }
  };

  const weightToLose = currentWeight - goalWeight;
  const categoryText = categoryTranslations[language][category as keyof typeof categoryTranslations.pt] || category;

  // Calcular posição no marcador de IMC (escala de 15 a 40)
  const getBMIPosition = () => {
    const minBMI = 15;
    const maxBMI = 40;
    const position = ((bmi - minBMI) / (maxBMI - minBMI)) * 100;
    return Math.min(Math.max(position, 0), 100);
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Scale className="h-5 w-5 text-primary" />
          {t("bmi.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Current BMI */}
          <div className={`p-4 rounded-xl ${getCategoryBg(category)} text-center`}>
            <p className="text-xs text-muted-foreground mb-1">{t("bmi.current")}</p>
            <p className={`text-3xl font-bold ${getCategoryColor(category)}`}>
              {bmi.toFixed(1)}
            </p>
            <p className={`text-xs font-medium ${getCategoryColor(category)}`}>
              {categoryText}
            </p>
          </div>

          {/* Optimal Weight */}
          <div className="p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("bmi.ideal")}</p>
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-lg font-bold text-primary">
                {idealWeight.optimal}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              ({idealWeight.min}-{idealWeight.max} kg)
            </p>
          </div>

          {/* Weight Difference */}
          <div className="p-4 rounded-xl bg-secondary text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {weightToLose > 0 ? t("bmi.tolose") : (language === "pt" ? "Para ganhar" : "To gain")}
            </p>
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className={`h-4 w-4 text-secondary-foreground ${weightToLose < 0 ? "rotate-180" : ""}`} />
              <p className="text-xl font-bold text-secondary-foreground">
                {Math.abs(weightToLose).toFixed(1)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">kg</p>
          </div>

          {/* Body Fat Estimate */}
          <div className="p-4 rounded-xl bg-muted text-center">
            <p className="text-xs text-muted-foreground mb-1">
              {language === "pt" ? "Gordura corporal" : "Body fat"}
            </p>
            <div className="flex items-center justify-center gap-1">
              <Activity className="h-4 w-4 text-foreground" />
              <p className="text-xl font-bold text-foreground">
                ~{bodyFat}%
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {language === "pt" ? "estimado" : "estimated"}
            </p>
          </div>
        </div>

        {/* Water Intake Recommendation */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Droplets className="h-6 w-6 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {language === "pt" ? "Água recomendada" : "Recommended water"}
              </p>
              <p className="text-xs text-muted-foreground">
                {language === "pt" ? "Baseado no seu peso e atividade" : "Based on weight and activity"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{(waterIntake / 1000).toFixed(1)}L</p>
            <p className="text-xs text-muted-foreground">{language === "pt" ? "por dia" : "per day"}</p>
          </div>
        </div>

        {/* BMI Scale */}
        <div>
          <div className="relative h-4 rounded-full overflow-hidden">
            {/* Gradient background representing BMI ranges */}
            <div className="absolute inset-0 flex">
              <div className="w-[14%] bg-red-400" /> {/* < 18.5 */}
              <div className="w-[26%] bg-green-500" /> {/* 18.5 - 25 */}
              <div className="w-[20%] bg-yellow-500" /> {/* 25 - 30 */}
              <div className="w-[20%] bg-orange-500" /> {/* 30 - 35 */}
              <div className="w-[20%] bg-red-500" /> {/* > 35 */}
            </div>
            {/* Current BMI indicator */}
            <div 
              className="absolute top-0 w-1 h-full bg-foreground rounded-full shadow-lg ring-2 ring-background"
              style={{ 
                left: `${getBMIPosition()}%`,
                transform: "translateX(-50%)"
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>15</span>
            <span className="text-green-600">18.5</span>
            <span className="text-green-600">25</span>
            <span className="text-yellow-600">30</span>
            <span className="text-orange-600">35</span>
            <span>40</span>
          </div>
          <div className="flex justify-center mt-1">
            <p className="text-xs text-muted-foreground">
              {language === "pt" ? "Seu IMC: " : "Your BMI: "}
              <span className={`font-semibold ${getCategoryColor(category)}`}>{bmi.toFixed(1)}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
