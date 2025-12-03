import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  ChefHat, 
  Target, 
  Timer, 
  Droplets,
  ImageIcon,
  Utensils,
  Home
} from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Início" },
  { path: "/scanner", icon: Camera, label: "Scanner" },
  { path: "/recipes", icon: ChefHat, label: "Receitas" },
  { path: "/missions", icon: Target, label: "Missões" },
  { path: "/fasting", icon: Timer, label: "Jejum" },
];

const moreItems = [
  { path: "/hydration", icon: Droplets, label: "Água" },
  { path: "/progress", icon: ImageIcon, label: "Fotos" },
  { path: "/meal-plan", icon: Utensils, label: "Cardápio" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 px-2 pb-safe">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "navActive" : "nav"}
              size="sm"
              onClick={() => navigate(item.path)}
              className="flex flex-col gap-0.5 h-auto py-2 px-3 min-w-[60px]"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
