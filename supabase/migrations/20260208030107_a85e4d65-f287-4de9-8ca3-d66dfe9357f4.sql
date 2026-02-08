
-- Fix overly permissive RLS policy on ai_usage_logs
DROP POLICY IF EXISTS "Service can insert AI usage logs" ON public.ai_usage_logs;

-- Only allow authenticated users to insert their own logs
CREATE POLICY "Users can insert their own AI usage logs"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
