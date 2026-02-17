import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Send, Loader2, Crown } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSubscription } from "@/hooks/useSubscription";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bmi = useMemo(() => calculateBMI(), [profile.weight, profile.height]);
  const bmiCategory = useMemo(() => getBMICategory(bmi), [bmi]);
  const diet = useMemo(() => getDietRecommendation(), [profile]);

  const pt = language === "pt";

  const dailySuggestions = useMemo(() => {
    return pt 
      ? ["O que comer agora?", "Treino rápido para casa", "Como acelerar resultado?", "Dicas de jejum"]
      : ["What to eat now?", "Quick home workout", "How to speed results?", "Fasting tips"];
  }, [pt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildUserProfile = useCallback(() => {
    if (!bmi) return null;
    return {
      weight: profile.weight,
      height: profile.height,
      age: profile.age,
      gender: profile.gender,
      bmi,
      bmiCategory,
      activityLevel: profile.activityLevel,
      goalWeight: profile.goalWeight,
      bodyType: profile.bodyType,
      foodPreferences: profile.foodPreferences,
      medicalLimitations: profile.medicalLimitations,
      dailyRoutine: profile.dailyRoutine,
      tdee: diet.tdee,
      calories: diet.calories,
      deficit: diet.deficit,
    };
  }, [bmi, bmiCategory, profile, diet]);

  const streamChat = useCallback(async (userMessage: string) => {
    const { allowed } = await checkLimit("trainer-chat");
    if (!allowed && !isPro) {
      setLimitReached(true);
      return;
    }

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    track("trainer_chat_sent");

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trainer-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages,
          userProfile: buildUserProfile(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.limit_reached) {
          setLimitReached(true);
          setMessages(messages); // revert
          return;
        }
        throw new Error("Falha na conexão");
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        setMessages([...newMessages, { role: "assistant", content }]);
      }
    } catch {
      toast({ title: pt ? "Erro ao conectar" : "Connection error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [messages, buildUserProfile, pt, toast, checkLimit, track, isPro]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="px-4 py-3 flex items-center gap-3 glass-strong rounded-b-2xl mb-2">
          <div className="w-10 h-10 rounded-full gradient-teal flex items-center justify-center shadow-glow">
            <Sparkles className="text-primary-foreground h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">Treinador AI</h1>
            <span className="text-[10px] text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full space-y-6 pt-10"
              >
                <p className="text-sm text-muted-foreground text-center">
                  {pt ? "Como posso ajudar hoje?" : "How can I help today?"}
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {dailySuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => streamChat(suggestion)}
                      className="p-3 text-xs glass hover:bg-secondary/30 text-left rounded-2xl border border-border/50 transition-all active:scale-95"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={index}
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
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-strong px-4 py-3 rounded-2xl rounded-bl-md border border-accent/30">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input or Paywall */}
        <div className="p-4 glass-strong rounded-t-3xl border-t border-border/50">
          {limitReached ? (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="p-5 rounded-2xl text-center space-y-3 border border-accent/40 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, hsl(42, 90%, 55% / 0.15), hsl(38, 85%, 58% / 0.08))" }}
            >
              <div className="absolute inset-0 animate-glow rounded-2xl pointer-events-none" />
              <div className="flex justify-center gap-2 items-center font-bold text-accent">
                <Crown className="h-5 w-5" />
                Evolua para o Plano Pro
              </div>
              <p className="text-xs text-muted-foreground">
                Consultas ilimitadas ao Treinador AI, relatórios personalizados e cardápios exclusivos.
              </p>
              <Button className="w-full gradient-accent font-bold rounded-xl shadow-gold text-accent-foreground">
                ASSINAR AGORA
              </Button>
            </motion.div>
          ) : (
            <div className="flex gap-2 items-center bg-background/50 p-1 rounded-2xl border border-border">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={pt ? "Pergunte algo..." : "Ask anything..."}
                className="border-0 focus-visible:ring-0 bg-transparent h-12"
              />
              <Button 
                onClick={handleSend} 
                disabled={!input.trim() || isLoading} 
                size="icon" 
                className="rounded-xl w-10 h-10 gradient-teal shadow-glow"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
