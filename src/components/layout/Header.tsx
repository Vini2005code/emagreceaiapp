import { LanguageToggle } from "./LanguageToggle";
import logo from "@/assets/logo.png";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/30">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Emagrece AI" 
            className="h-12 w-12 rounded-xl object-contain"
          />
          <div>
            <h1 className="font-bold text-lg text-primary tracking-tight">
              Emagrece <span className="text-gradient-gold">AI</span>
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
        <LanguageToggle />
      </div>
    </header>
  );
}
