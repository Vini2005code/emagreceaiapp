import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Send, Loader2, Crown, RefreshCw } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Trainer() {
  const { language } = useLanguage();
  const { profile, calculateBMI, getBMICategory, getDietRecommendation } = useUserProfile();
  const { toast } = useToast();
  const { checkLimit, isPro } = useSubscription();
  const { track } = useAnalytics();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastMessage, setLastMessage] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bmi = useMemo(() => calculateBMI(), [profile.weight, profile.height]);
  const bmiCategory = useMemo(() => getBMICategory(bmi), [bmi]);
  const diet = useMemo(() => getDietRecommendation(), [profile]);
  const pt = language === "pt";

  const dailySuggestions = useMemo(() => {
    return pt
      ? ["O que comer agora?", "Treino rápido para casa", "Como acelerar resultado?", "Dicas de jejum"]
      : ["What to eat now?", "Quick home workout", "How to speed results?", "Fasting tips"];
  }, [pt]);

  // Auto-scroll apenas quando uma nova mensagem chegar
  useEffect(() => {
    if (messages.length === 0) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    // Só rola se estiver próximo do fundo (não interrompe scroll manual)
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
    if (isNearBottom || messages[messages.length - 1]?.role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const buildUserProfile = useCallback(() => {
    return {
      weight: profile.weight || 70,
      height: profile.height || 170,
      age: profile.age || 30,
      gender: profile.gender || "male",
      bmi: bmi || 0,
      bmiCategory: bmiCategory || "normal",
      activityLevel: profile.activityLevel || "moderate",
      goalWeight: profile.goalWeight || profile.weight || 70,
      bodyType: profile.bodyType || "mesomorph",
      foodPreferences: profile.foodPreferences || [],
      medicalLimitations: profile.medicalLimitations || [],
      dailyRoutine: profile.dailyRoutine || "regular",
      tdee: diet.tdee || 0,
      calories: diet.calories || 0,
      deficit: diet.deficit || 0,
    };
  }, [bmi, bmiCategory, profile, diet]);

  const sendMessage = useCallback(async (userMessage: string, currentMessages: Message[]) => {
    setHasError(false);
    setLastMessage(userMessage);

    const { allowed } = await checkLimit("trainer-chat");
    if (!allowed && !isPro) {
      setLimitReached(true);
      return;
    }

    const newMessages: Message[] = [...currentMessages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    track("trainer_chat_sent");

    try {
      const { data, error } = await supabase.functions.invoke("trainer-chat", {
        body: {
          messages: newMessages,
          userProfile: buildUserProfile(),
        },
      });

      if (error) {
        // Verificar se é limite atingido
        if (error.message?.includes("429") || error.context?.limit_reached) {
          setLimitReached(true);
          setMessages(currentMessages); // reverter
          return;
        }
        throw new Error(error.message || "Falha na conexão");
      }

      const content = data?.choices?.[0]?.message?.content;
      if (content) {
        setMessages([...newMessages, { role: "assistant", content }]);
      } else {
        throw new Error("Resposta inválida");
      }
    } catch (err: any) {
      setMessages(currentMessages); // reverter mensagem do usuário em caso de erro
      setHasError(true);
      toast({
        title: pt ? "Erro ao conectar com o Treinador" : "Connection error",
        description: pt ? "Verifique sua conexão e tente novamente." : "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [buildUserProfile, pt, toast, checkLimit, track, isPro]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    sendMessage(message, messages);
  }, [input, isLoading, messages, sendMessage]);

  const handleRetry = useCallback(() => {
    if (!lastMessage || isLoading) return;
    sendMessage(lastMessage, messages);
  }, [lastMessage, isLoading, messages, sendMessage]);

  const handleSuggestion = useCallback((suggestion: string) => {
    sendMessage(suggestion, messages);
  }, [messages, sendMessage]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Header único */}
      <Header title={pt ? "Treinador AI" : "AI Trainer"} />

      {/* Área central: mensagens + input */}
      <div className="flex-1 flex flex-col overflow-hidden max-w-2xl w-full mx-auto">

        {/* Status bar da IA */}
        <div className="px-4 pt-2 pb-1 flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-full gradient-teal flex items-center justify-center shadow-glow">
            <Sparkles className="text-primary-foreground h-3.5 w-3.5" />
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            {pt ? "Online · Personalizado para você" : "Online · Personalized for you"}
          </span>
        </div>

        {/* Mensagens - única área rolável */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 py-2 space-y-3"
          style={{ scrollbarWidth: "thin" }}
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full space-y-5 py-8"
              >
                <p className="text-sm text-muted-foreground text-center">
                  {pt ? "Como posso ajudar hoje?" : "How can I help today?"}
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {dailySuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestion(suggestion)}
                      disabled={isLoading}
                      className="p-3 text-xs glass hover:bg-secondary/30 text-left rounded-2xl border border-border/50 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "gradient-teal text-primary-foreground rounded-2xl rounded-br-md"
                        : "glass-strong text-foreground rounded-2xl rounded-bl-md border border-accent/30"
                    }`}
                  >
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1.5 [&>p:last-child]:mb-0">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Indicador de digitação discreto - não empurra mensagens */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-start"
            >
              <div className="glass px-3 py-2 rounded-2xl rounded-bl-md border border-accent/20">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Botão de erro com retry */}
          {hasError && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 text-xs text-destructive border border-destructive/30 px-3 py-1.5 rounded-xl hover:bg-destructive/10 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                {pt ? "Erro — Tentar novamente" : "Error — Retry"}
              </button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input ou Paywall - fixo na base, acima do BottomNav */}
        <div className="px-4 pb-2 pt-2 shrink-0">
          {limitReached ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-5 rounded-2xl text-center space-y-3 border border-accent/40 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(42 90% 55% / 0.15), hsl(38 85% 58% / 0.08))" }}
            >
              <div className="absolute inset-0 animate-glow rounded-2xl pointer-events-none" />
              <div className="flex justify-center gap-2 items-center font-bold text-accent">
                <Crown className="h-5 w-5" />
                {pt ? "Evolua para o Plano Pro" : "Upgrade to Pro"}
              </div>
              <p className="text-xs text-muted-foreground">
                {pt
                  ? "Consultas ilimitadas ao Treinador AI, relatórios personalizados e cardápios exclusivos."
                  : "Unlimited AI Trainer consultations, personalized reports and exclusive meal plans."}
              </p>
              <Button className="w-full gradient-accent font-bold rounded-xl shadow-gold text-accent-foreground">
                {pt ? "ASSINAR AGORA" : "SUBSCRIBE NOW"}
              </Button>
            </motion.div>
          ) : (
            <div className="flex gap-2 items-center bg-background/50 p-1 rounded-2xl border border-border glass-strong">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder={pt ? "Pergunte algo..." : "Ask anything..."}
                className="border-0 focus-visible:ring-0 bg-transparent h-11"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl w-10 h-10 gradient-teal shadow-glow shrink-0"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* BottomNav */}
      <BottomNav />
    </div>
  );
}
