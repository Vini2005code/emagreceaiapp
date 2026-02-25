import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/hooks/useAuth";
import { DailyDataProvider } from "@/contexts/DailyDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DailyDataProvider>
        <LanguageProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
              <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
              <Route path="/missions" element={<ProtectedRoute><Missions /></ProtectedRoute>} />
              <Route path="/fasting" element={<ProtectedRoute><Fasting /></ProtectedRoute>} />
              <Route path="/hydration" element={<ProtectedRoute><Hydration /></ProtectedRoute>} />
              <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
              <Route path="/meal-plan" element={<ProtectedRoute><MealPlan /></ProtectedRoute>} />
              <Route path="/trainer" element={<ProtectedRoute><Trainer /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </DailyDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
