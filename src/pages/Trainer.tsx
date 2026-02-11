import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Sparkles, Send, Loader2, Crown, MessageSquare, AlertCircle } from "lucide-react";
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
  const { t, language } = useLanguage();
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
    const suggestions = pt 
      ? ["Como perder gordura abdominal?", "Treino rápido para casa", "O que comer pré-treino?", "Dicas de jejum"]
      : ["How to lose belly fat?", "Quick home workout", "Pre-workout meal ideas", "Fasting tips"];
    return suggestions;
  }, [pt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildUserProfile = useCallback(() => {
    if (!bmi) return null;
    return {
      weight: profile.weight,
      height: profile.height,
      bmi,
      bmiCategory,
      activityLevel: profile.activityLevel,
      goalWeight: profile.goalWeight,
      tdee: diet.tdee,
      calories: diet.calories,
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

      if (!response.ok) throw new Error("Falha na conexão");

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        setMessages([...newMessages, { role: "assistant", content }]);
      }
    } catch (error) {
      toast({ title: pt ? "Erro" : "Error", variant: "destructive" });
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
        {/* Header Compacto e Elegante */}
        <div className="px-4 py-3 flex items-center justify-between glass-strong rounded-b-2xl mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-teal flex items-center justify-center shadow-glow">
              <Sparkles className="text-white h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">Treinador AI</h1>
              <span className="text-[10px] text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                Online agora
              </span>
            </div>
          </div>
          <AlertCircle className="h-5 w-5 text-muted-foreground opacity-50" />
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-4">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full space-y-6 pt-10"
              >
                <div className="glass p-6 rounded-3xl text-center space-y-2 max-w-[280px]">
                  <p className="text-sm font-medium">
                    {pt ? "Como posso acelerar seus resultados hoje?" : "How can I boost your results today?"}
                  </p>
                </div>
                
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "gradient-teal text-white rounded-tr-none"
                        : "glass-strong text-foreground rounded-tl-none border-l-4 border-l-accent"
                    }`}
                  >
                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="glass px-4 py-2 rounded-2xl">
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input ou Paywall */}
        <div className="p-4 glass-strong rounded-t-3xl border-t border-border/50">
          {limitReached ? (
            <motion.div 
              initial={{ y: 20 }} animate={{ y: 0 }}
              className="gradient-gold p-4 rounded-2xl text-accent-foreground text-center space-y-3"
            >
              <div className="flex justify-center gap-2 items-center font-bold">
                <Crown className="h-5 w-5" />
                {pt ? "Evolua para o Plano Pro" : "Upgrade to Pro"}
              </div>
              <p className="text-xs opacity-90">
                {pt ? "Consultas ilimitadas e planos de treino exclusivos." : "Unlimited chats and exclusive workout plans."}
              </p>
              <Button className="w-full bg-accent-foreground text-accent hover:bg-accent-foreground/90 rounded-xl font-bold">
                {pt ? "ASSINAR AGORA" : "SUBSCRIBE NOW"}
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
