import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useFeedback() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = useCallback(
    async (message: string, type: "feedback" | "bug" | "suggestion" = "feedback", category?: string) => {
      if (!user || !message.trim()) return false;
      setIsSubmitting(true);
      try {
        const { error } = await supabase.from("user_feedback").insert({
          user_id: user.id,
          type,
          category,
          message: message.trim().slice(0, 2000),
        });
        return !error;
      } finally {
        setIsSubmitting(false);
      }
    },
    [user]
  );

  return { submitFeedback, isSubmitting };
}
