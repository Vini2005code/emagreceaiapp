import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Scanner from "./pages/Scanner";
import Recipes from "./pages/Recipes";
import Missions from "./pages/Missions";
import Fasting from "./pages/Fasting";
import Hydration from "./pages/Hydration";
import Progress from "./pages/Progress";
import MealPlan from "./pages/MealPlan";
import Trainer from "./pages/Trainer";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/fasting" element={<Fasting />} />
            <Route path="/hydration" element={<Hydration />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/trainer" element={<Trainer />} />
            <Route path="/profile" element={<Profile />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
