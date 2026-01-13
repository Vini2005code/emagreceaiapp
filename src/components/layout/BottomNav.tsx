import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Camera, 
  ChefHat, 
  Target, 
  User,
  Home,
  GraduationCap
} from "lucide-react";

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Home, labelKey: "nav.home" },
    { path: "/scanner", icon: Camera, labelKey: "nav.scanner" },
    { path: "/recipes", icon: ChefHat, labelKey: "nav.recipes" },
    { path: "/missions", icon: Target, labelKey: "nav.missions" },
    { path: "/trainer", icon: GraduationCap, labelKey: "nav.trainer" },
    { path: "/profile", icon: User, labelKey: "nav.profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/30 px-2 pb-safe">
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
              <span className="text-[10px] font-medium">{t(item.labelKey)}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
