import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Scale, TrendingDown, Target } from "lucide-react";

interface BMIDisplayProps {
  bmi: number;
  category: string;
  idealWeight: { min: number; max: number };
  currentWeight: number;
  goalWeight: number;
}

export function BMIDisplay({ bmi, category, idealWeight, currentWeight, goalWeight }: BMIDisplayProps) {
  const { t } = useLanguage();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "underweight": return "text-warning";
      case "normal": return "text-success";
      case "overweight": return "text-warning";
      default: return "text-destructive";
    }
  };

  const getCategoryBg = (cat: string) => {
    switch (cat) {
      case "underweight": return "bg-warning/20";
      case "normal": return "bg-success/20";
      case "overweight": return "bg-warning/20";
      default: return "bg-destructive/20";
    }
  };

  const weightToLose = currentWeight - goalWeight;

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Scale className="h-5 w-5 text-primary" />
          {t("bmi.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Current BMI */}
          <div className={`p-4 rounded-xl ${getCategoryBg(category)} text-center`}>
            <p className="text-xs text-muted-foreground mb-1">{t("bmi.current")}</p>
            <p className={`text-3xl font-bold ${getCategoryColor(category)}`}>
              {bmi.toFixed(1)}
            </p>
            <p className={`text-sm font-medium ${getCategoryColor(category)}`}>
              {t(`bmi.${category}`)}
            </p>
          </div>

          {/* Ideal Weight */}
          <div className="p-4 rounded-xl bg-primary/10 text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("bmi.ideal")}</p>
            <div className="flex items-center justify-center gap-1">
              <Target className="h-4 w-4 text-primary" />
              <p className="text-xl font-bold text-primary">
                {idealWeight.min}-{idealWeight.max}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">kg</p>
          </div>

          {/* Weight to Lose */}
          <div className="p-4 rounded-xl bg-accent text-center">
            <p className="text-xs text-muted-foreground mb-1">{t("bmi.tolose")}</p>
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="h-4 w-4 text-accent-foreground" />
              <p className="text-xl font-bold text-accent-foreground">
                {weightToLose > 0 ? weightToLose.toFixed(1) : "0"}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">kg</p>
          </div>
        </div>

        {/* BMI Scale */}
        <div className="mt-6">
          <div className="h-3 rounded-full bg-gradient-to-r from-warning via-success to-destructive relative overflow-hidden">
            <div 
              className="absolute top-0 w-1 h-full bg-foreground rounded-full shadow-lg"
              style={{ 
                left: `${Math.min(Math.max((bmi - 15) / 25 * 100, 0), 100)}%`,
                transform: "translateX(-50%)"
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>15</span>
            <span>18.5</span>
            <span>25</span>
            <span>30</span>
            <span>40</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
