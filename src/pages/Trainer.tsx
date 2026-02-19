import { AppLayout } from "@/components/layout/AppLayout";
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

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Trainer() {
  const { language } = useLanguage();
  const { profile, calculateBMI, getBMICategory, getDietRecommendation } = useUserProfile();
  const { toast } = useToast();
  const { checkLimit, isPro, logUsage } = useSubscription();
  const { track } = useAnalytics();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [hasError, setHasError] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bmi = calculateBMI();
  const diet = getDietRecommendation();
  const pt = language === "pt";

  const dailySuggestions = useMemo(() => {
    return pt
      ? ["O que comer agora?", "Treino rápido para casa", "Como acelerar resultado?", "Dicas de jejum"]
      : ["What to eat now?", "Quick home workout", "How to speed results?", "Fasting tips"];
  }, [pt]);

  // Auto-scroll simples e direto sempre que houver nova mensagem ou estado de loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, hasError]);

  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || isLoading) return;

    setHasError(false);

    const { allowed } = await checkLimit("trainer-chat");
    if (!allowed && !isPro) {
      setLimitReached(true);
      return;
    }

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    track("trainer_chat_sent");

    try {
      const { data, error } = await supabase.functions.invoke("trainer-chat", {
        body: {
          messages: newMessages,
          userProfile: {
            weight: profile.weight || 70,
            height: profile.height || 170,
            goalWeight: profile.goalWeight || profile.weight,
            bmi: bmi || 0,
            bmiCategory: getBMICategory(bmi) || "normal",
            tdee: diet.tdee || 0,
          },
        },
      });

      if (error) {
        if (error.status === 429) {
          setLimitReached(true);
          setMessages(messages); // Reverte a mensagem se for erro de limite
          return;
        }
        throw new Error(error.message);
      }

      // Tenta aceder à resposta em vários formatos possíveis da API
      const responseText = data?.choices?.[0]?.message?.content || data?.reply || data?.answer;

      if (responseText) {
        setMessages([...newMessages, { role: "assistant", content: responseText }]);
        await logUsage("trainer-chat", { success: true });
      } else {
        throw new Error("Formato de resposta não reconhecido.");
      }
    } catch (err: any) {
      console.error("Erro no chat:", err);
      setMessages(messages); // Remove a mensagem falhada do ecrã
      setHasError(true);
      toast({
        title: pt ? "Falha na conexão" : "Connection error",
        description: pt ? "A IA está ocupada ou a internet falhou." : "AI is busy or network failed.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, checkLimit, isPro, profile, bmi, getBMICategory, diet, logUsage, pt, toast, track]);

  return (
    <AppLayout title={pt ? "Treinador AI" : "AI Trainer"} chatMode>
      
      {/* Container Principal: altura entre Header (~64px) e BottomNav (~65px) */}
      <div className="flex flex-col h-[calc(100vh-129px)] w-full max-w-2xl mx-auto overflow-hidden">
        
        {/* Status Bar */}
        <div className="px-4 py-3 shrink-0 flex items-center gap-2 bg-background z-10 border-b border-border/40">
          <div className="w-8 h-8 rounded-full gradient-teal flex items-center justify-center shadow-glow">
            <Sparkles className="text-primary-foreground h-4 w-4" />
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            {pt ? "Online agora" : "Online now"}
          </span>
          {isPro && <Crown className="h-4 w-4 text-accent ml-auto" />}
        </div>

        {/* Área de Mensagens (A ÚNICA ZONA COM SCROLL) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth pb-10">
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full space-y-6 pt-10">
                <p className="text-sm text-muted-foreground text-center">
                  {pt ? "O que deseja treinar hoje?" : "What do you want to train today?"}
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                  {dailySuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(suggestion)}
                      disabled={isLoading}
                      className="p-3 text-xs glass-strong hover:bg-secondary/30 text-left rounded-2xl border border-border/50 transition-active active:scale-95 disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map((message, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-3 shadow-sm ${
                      message.role === "user" ? "gradient-teal text-primary-foreground rounded-2xl rounded-tr-none" : "glass-strong text-foreground rounded-2xl rounded-tl-none border border-border/50"
                    }`}
                  >
                    <div className="text-sm prose prose-sm dark:prose-invert">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          {/* Indicador de Escrita */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-none border border-border/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}

          {/* Alerta de Erro */}
          {hasError && !isLoading && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center mt-2">
              <div className="text-xs text-destructive flex items-center gap-1 bg-destructive/10 px-3 py-1.5 rounded-full">
                 <RefreshCw className="h-3 w-3" /> Falha na resposta. Tente enviar de novo.
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Rodapé: Input ou Paywall (Fixo na parte inferior da tela) */}
        <div className="p-4 bg-background border-t border-border/40 shrink-0 mb-safe">
          {limitReached ? (
            <div className="p-4 rounded-2xl border border-accent/40 bg-accent/5 text-center space-y-3">
              <div className="flex justify-center gap-2 items-center font-bold text-accent">
                <Crown className="h-5 w-5" /> {pt ? "Plano Pro Necessário" : "Pro Plan Required"}
              </div>
              <p className="text-xs text-muted-foreground">
                {pt ? "Atingiu o limite gratuito. Assine para consultas ilimitadas." : "Free limit reached. Subscribe for unlimited access."}
              </p>
              <Button className="w-full gradient-accent font-bold rounded-xl shadow-gold text-accent-foreground">
                {pt ? "ASSINAR AGORA" : "SUBSCRIBE NOW"}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-center bg-muted/20 p-1.5 rounded-2xl border border-border/60">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder={pt ? "Escreva aqui..." : "Type here..."}
                className="border-0 focus-visible:ring-0 bg-transparent h-12 text-sm"
                disabled={isLoading}
              />
              <Button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="rounded-xl w-12 h-12 gradient-teal shadow-glow shrink-0"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <Send className="h-5 w-5 text-white" />}
              </Button>
            </div>
          )}
        </div>
        
      </div>
    </AppLayout>
  );
}
