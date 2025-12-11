import { Leaf } from "lucide-react";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export function Header({ title = "Emagrece AI", subtitle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-border/50">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <div className="gradient-primary p-2 rounded-xl shadow-soft">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
