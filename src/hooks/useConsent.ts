import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ConsentType = "image_analysis" | "ai_usage" | "email_communication" | "terms_of_use" | "privacy_policy";

interface ConsentState {
  [key: string]: boolean;
}

export function useConsent() {
  const { user } = useAuth();
  const [consents, setConsents] = useState<ConsentState>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadConsents();
  }, [user]);

  const loadConsents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("consent_records")
      .select("consent_type, granted")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      const latest: ConsentState = {};
      for (const r of data) {
        if (!(r.consent_type in latest)) {
          latest[r.consent_type] = r.granted;
        }
      }
      setConsents(latest);
    }
    setIsLoading(false);
  };

  const grantConsent = useCallback(async (types: ConsentType[]) => {
    if (!user) return;
    const rows = types.map((t) => ({
      user_id: user.id,
      consent_type: t,
      granted: true,
      granted_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      version: "1.0",
    }));
    await supabase.from("consent_records").insert(rows);
    const updated = { ...consents };
    types.forEach((t) => (updated[t] = true));
    setConsents(updated);
  }, [user, consents]);

  const revokeConsent = useCallback(async (type: ConsentType) => {
    if (!user) return;
    await supabase.from("consent_records").insert({
      user_id: user.id,
      consent_type: type,
      granted: false,
      revoked_at: new Date().toISOString(),
      user_agent: navigator.userAgent,
      version: "1.0",
    });
    setConsents((prev) => ({ ...prev, [type]: false }));
  }, [user]);

  const hasConsent = useCallback((type: ConsentType) => consents[type] === true, [consents]);

  const hasAllRequired = useCallback(() => {
    return hasConsent("terms_of_use") && hasConsent("privacy_policy") && hasConsent("ai_usage");
  }, [hasConsent]);

  return { consents, isLoading, grantConsent, revokeConsent, hasConsent, hasAllRequired };
}
