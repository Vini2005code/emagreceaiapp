
-- ===========================
-- 1. CONSENT RECORDS (LGPD)
-- ===========================
CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  consent_type text NOT NULL, -- 'image_analysis', 'ai_usage', 'email_communication', 'terms_of_use', 'privacy_policy'
  granted boolean NOT NULL DEFAULT false,
  granted_at timestamp with time zone,
  revoked_at timestamp with time zone,
  ip_address text,
  user_agent text,
  version text NOT NULL DEFAULT '1.0', -- version of the policy/terms
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own consents"
  ON public.consent_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.consent_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents"
  ON public.consent_records FOR UPDATE
  USING (auth.uid() = user_id);

-- ===========================
-- 2. AI USAGE LOGS (Governance + Cost Control)
-- ===========================
CREATE TABLE public.ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  function_name text NOT NULL, -- 'trainer-chat', 'generate-meal-plan', 'analyze-food', 'generate-recipes', 'analyze-body'
  tokens_input integer DEFAULT 0,
  tokens_output integer DEFAULT 0,
  model text,
  success boolean NOT NULL DEFAULT true,
  error_message text,
  response_time_ms integer,
  cached boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert AI usage logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (true);

-- Index for rate limiting queries
CREATE INDEX idx_ai_usage_user_date ON public.ai_usage_logs (user_id, created_at DESC);
CREATE INDEX idx_ai_usage_function ON public.ai_usage_logs (function_name, created_at DESC);

-- ===========================
-- 3. USER FEEDBACK
-- ===========================
CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'feedback', -- 'feedback', 'bug', 'suggestion'
  category text, -- 'trainer', 'scanner', 'mealplan', 'recipes', 'general'
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved'
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON public.user_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
  ON public.user_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ===========================
-- 4. ANALYTICS EVENTS
-- ===========================
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX idx_analytics_user_date ON public.analytics_events (user_id, created_at DESC);
CREATE INDEX idx_analytics_event ON public.analytics_events (event_name, created_at DESC);

-- ===========================
-- 5. SUBSCRIPTION TIERS (Monetization Architecture)
-- ===========================
CREATE TABLE public.subscription_plans (
  id text PRIMARY KEY, -- 'free', 'pro', 'premium'
  name text NOT NULL,
  price_monthly numeric DEFAULT 0,
  price_yearly numeric DEFAULT 0,
  features jsonb NOT NULL DEFAULT '{}',
  ai_daily_limit integer NOT NULL DEFAULT 5,
  scanner_daily_limit integer NOT NULL DEFAULT 3,
  meal_plan_daily_limit integer NOT NULL DEFAULT 1,
  recipes_daily_limit integer NOT NULL DEFAULT 3,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

-- Insert default plans
INSERT INTO public.subscription_plans (id, name, price_monthly, price_yearly, features, ai_daily_limit, scanner_daily_limit, meal_plan_daily_limit, recipes_daily_limit) VALUES
  ('free', 'Free', 0, 0, '{"trainer_chat": true, "scanner": true, "meal_plan": true, "recipes": true, "progress_photos": true, "fasting": true, "hydration": true, "missions": true}', 5, 3, 1, 3),
  ('pro', 'Pro', 19.90, 199.90, '{"trainer_chat": true, "scanner": true, "meal_plan": true, "recipes": true, "progress_photos": true, "fasting": true, "hydration": true, "missions": true, "priority_support": true, "advanced_analytics": true}', 30, 15, 5, 15),
  ('premium', 'Premium', 39.90, 399.90, '{"trainer_chat": true, "scanner": true, "meal_plan": true, "recipes": true, "progress_photos": true, "fasting": true, "hydration": true, "missions": true, "priority_support": true, "advanced_analytics": true, "unlimited_ai": true, "custom_plans": true}', 999, 999, 999, 999);

-- ===========================
-- 6. USER SUBSCRIPTIONS
-- ===========================
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  plan_id text NOT NULL DEFAULT 'free' REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due'
  current_period_start timestamp with time zone DEFAULT now(),
  current_period_end timestamp with time zone,
  external_subscription_id text, -- Stripe / Mercado Pago ID
  external_customer_id text,
  payment_provider text, -- 'stripe', 'mercado_pago'
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create free subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (NEW.id, 'free', 'active');
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_subscription();

-- ===========================
-- 7. ADD ONBOARDING FLAG TO PROFILES
-- ===========================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Trigger for updated_at on user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
