import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Camera, 
  ChefHat, 
  Timer, 
  Droplets, 
  ImageIcon, 
  Utensils 
} from "lucide-react";
import { motion } from "framer-motion";

const actions = [
  {
    icon: Camera,
    label: "Scanner de Prato",
    description: "Calcule calorias por foto",
    path: "/scanner",
    color: "primary" as const,
  },
  {
    icon: ChefHat,
    label: "Receitas",
    description: "Com o que você tem",
    path: "/recipes",
    color: "accent" as const,
  },
  {
    icon: Timer,
    label: "Jejum",
    description: "Controle seu tempo",
    path: "/fasting",
    color: "success" as const,
  },
  {
    icon: Droplets,
    label: "Hidratação",
    description: "Meta de água",
    path: "/hydration",
    color: "primary" as const,
  },
  {
    icon: ImageIcon,
    label: "Progresso",
    description: "Antes e depois",
    path: "/progress",
    color: "accent" as const,
  },
  {
    icon: Utensils,
    label: "Cardápio",
    description: "Sugestão do dia",
    path: "/meal-plan",
    color: "success" as const,
  },
];

const colorClasses = {
  primary: "gradient-primary text-primary-foreground",
  accent: "gradient-accent text-accent-foreground",
  success: "gradient-success text-success-foreground",
};

export function QuickActions() {
  const navigate = useNavigate();

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
                  <h3 className="font-semibold text-sm">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
