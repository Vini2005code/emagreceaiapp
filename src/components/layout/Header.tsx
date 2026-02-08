import { LanguageToggle } from "./LanguageToggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";
import logo from "@/assets/logo.png";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/30">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Emagrece AI" 
            className="h-10 w-10 rounded-xl object-cover shadow-md"
          />
          <div>
            <h1 className="font-bold text-lg text-primary tracking-tight">
              Emagrece <span className="text-accent font-extrabold">AI</span>
            </h1>
            {subtitle ? (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            ) : (
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
                Vida saudável e feliz. Facilitada.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <FeedbackDialog />
          <LanguageToggle />
          {user && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
