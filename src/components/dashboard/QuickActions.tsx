import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Camera, 
  ChefHat, 
  Timer, 
  Droplets, 
  ImageIcon, 
  Utensils 
} from "lucide-react";
import { motion } from "framer-motion";

const colorClasses = {
  primary: "gradient-primary text-primary-foreground",
  accent: "gradient-accent text-accent-foreground",
  success: "gradient-success text-success-foreground",
};

export function QuickActions() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const actions = [
    {
      icon: Camera,
      labelKey: "quickActions.scanner",
      descKey: "quickActions.scannerDesc",
      path: "/scanner",
      color: "primary" as const,
    },
    {
      icon: ChefHat,
      labelKey: "quickActions.recipes",
      descKey: "quickActions.recipesDesc",
      path: "/recipes",
      color: "accent" as const,
    },
    {
      icon: Timer,
      labelKey: "quickActions.fasting",
      descKey: "quickActions.fastingDesc",
      path: "/fasting",
      color: "success" as const,
    },
    {
      icon: Droplets,
      labelKey: "quickActions.hydration",
      descKey: "quickActions.hydrationDesc",
      path: "/hydration",
      color: "primary" as const,
    },
    {
      icon: ImageIcon,
      labelKey: "quickActions.progress",
      descKey: "quickActions.progressDesc",
      path: "/progress",
      color: "accent" as const,
    },
    {
      icon: Utensils,
      labelKey: "quickActions.mealPlan",
      descKey: "quickActions.mealPlanDesc",
      path: "/meal-plan",
      color: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              variant="interactive"
              className="h-full"
              onClick={() => navigate(action.path)}
            >
              <CardContent className="p-4 flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[action.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t(action.labelKey)}</h3>
                  <p className="text-xs text-muted-foreground">{t(action.descKey)}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
