import { useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Json } from "@/integrations/supabase/types";

const SESSION_KEY = "analytics_session_id";

function getSessionId(): string {
  let sid = sessionStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

export function useAnalytics() {
  const { user } = useAuth();
  const queueRef = useRef<Array<{ event_name: string; event_data: Json }>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = useCallback(async () => {
    if (!user || queueRef.current.length === 0) return;
    const batch = [...queueRef.current];
    queueRef.current = [];
    const sessionId = getSessionId();

    const rows = batch.map((e) => ({
      user_id: user.id,
      event_name: e.event_name,
      event_data: e.event_data,
      session_id: sessionId,
    }));

    await supabase.from("analytics_events").insert(rows);
  }, [user]);

  const track = useCallback(
    (eventName: string, eventData: Record<string, Json | undefined> = {}) => {
      if (!user) return;
      queueRef.current.push({ event_name: eventName, event_data: eventData as Json });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, 2000);
    },
    [user, flush]
  );

  return { track };
}
