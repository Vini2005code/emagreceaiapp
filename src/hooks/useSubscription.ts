import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, boolean>;
  ai_daily_limit: number;
  scanner_daily_limit: number;
  meal_plan_daily_limit: number;
  recipes_daily_limit: number;
}

interface UserSubscription {
  plan_id: string;
  status: string;
}

export function useSubscription() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    const [plansRes, subRes] = await Promise.all([
      supabase.from("subscription_plans").select("*"),
      supabase.from("user_subscriptions").select("plan_id, status").eq("user_id", user.id).maybeSingle(),
    ]);

    if (plansRes.data) setPlans(plansRes.data as SubscriptionPlan[]);

    const planId = subRes.data?.plan_id || "free";
    setSubscription(subRes.data as UserSubscription | null);

    const currentPlan = plansRes.data?.find((p: any) => p.id === planId) as SubscriptionPlan | undefined;
    setPlan(currentPlan || null);
    setIsLoading(false);
  };

  const checkLimit = useCallback(
    async (functionName: string): Promise<{ allowed: boolean; remaining: number }> => {
      if (!user || !plan) return { allowed: true, remaining: 999 };

      const limitMap: Record<string, number> = {
        "trainer-chat": plan.ai_daily_limit,
        "generate-meal-plan": plan.meal_plan_daily_limit,
        "analyze-food": plan.scanner_daily_limit,
        "analyze-body": plan.scanner_daily_limit,
        "generate-recipes": plan.recipes_daily_limit,
      };

      const limit = limitMap[functionName] ?? 999;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("ai_usage_logs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("function_name", functionName)
        .gte("created_at", today.toISOString());

      const used = count || 0;
      return { allowed: used < limit, remaining: Math.max(0, limit - used) };
    },
    [user, plan]
  );

  const logUsage = useCallback(
    async (functionName: string, data?: { model?: string; success?: boolean; error_message?: string; response_time_ms?: number; cached?: boolean }) => {
      if (!user) return;
      await supabase.from("ai_usage_logs").insert({
        user_id: user.id,
        function_name: functionName,
        model: data?.model,
        success: data?.success ?? true,
        error_message: data?.error_message,
        response_time_ms: data?.response_time_ms,
        cached: data?.cached ?? false,
      });
    },
    [user]
  );

  const isPro = plan?.id === "pro" || plan?.id === "premium";
  const isPremium = plan?.id === "premium";

  return { plan, subscription, plans, isLoading, checkLimit, logUsage, isPro, isPremium };
}
