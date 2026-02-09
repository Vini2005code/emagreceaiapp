
-- Add missing DELETE policies for LGPD compliance (user must be able to delete their data)
CREATE POLICY "Users can delete their own consents"
  ON public.consent_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI usage logs"
  ON public.ai_usage_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedback"
  ON public.user_feedback FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analytics events"
  ON public.analytics_events FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscription"
  ON public.user_subscriptions FOR DELETE
  USING (auth.uid() = user_id);
