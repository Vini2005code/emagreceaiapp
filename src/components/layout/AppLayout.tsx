import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hideNav?: boolean;
  chatMode?: boolean;
}

export function AppLayout({ children, title, subtitle, hideNav = false, chatMode = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={title} subtitle={subtitle} />
      <main className={chatMode ? "container px-0 pt-0" : "container px-4 pb-24 pt-4"}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
