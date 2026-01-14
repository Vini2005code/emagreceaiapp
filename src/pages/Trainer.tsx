import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { AlertTriangle, Send, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Trainer() {
  const { t, language } = useLanguage();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bmi = useMemo(() => {
    if (profile.weight && profile.height) {
      const heightInMeters = profile.height / 100;
      return profile.weight / (heightInMeters * heightInMeters);
    }
    return null;
  }, [profile.weight, profile.height]);

  const getBmiCategory = (bmi: number): string => {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "normal";
    if (bmi < 30) return "overweight";
    return "obese";
  };

  // All available suggestions
  const allSuggestionsPt = [
    "Como perder gordura abdominal?",
    "Qual a melhor dieta para emagrecer?",
    "Quantas calorias devo comer por dia?",
    "Exercícios para fazer em casa",
    "Como manter a motivação?",
    "Jejum intermitente funciona?",
    "Dicas para acelerar o metabolismo",
    "Melhores alimentos para emagrecer",
    "Como evitar o efeito sanfona?",
    "Exercícios para queimar gordura",
    "O que comer antes de treinar?",
    "Dicas para diminuir a ansiedade alimentar"
  ];

  const allSuggestionsEn = [
    "How to lose belly fat?",
    "What's the best diet for weight loss?",
    "How many calories should I eat daily?",
    "Home workout exercises",
    "How to stay motivated?",
    "Does intermittent fasting work?",
    "Tips to boost metabolism",
    "Best foods for weight loss",
    "How to avoid yo-yo dieting?",
    "Fat burning exercises",
    "What to eat before training?",
    "Tips to reduce food anxiety"
  ];

  // Get daily random suggestions based on date
  const dailySuggestions = useMemo(() => {
    const allSuggestions = language === "pt" ? allSuggestionsPt : allSuggestionsEn;
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    // Simple shuffle based on date seed
    const shuffled = [...allSuggestions].sort((a, b) => {
      const hashA = (seed * a.length) % 1000;
      const hashB = (seed * b.length) % 1000;
      return hashA - hashB;
    });
    
    return shuffled.slice(0, 6);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = useCallback(async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    let assistantContent = "";

    try {
      const userProfile = bmi ? {
        weight: profile.weight,
        height: profile.height,
        age: profile.age,
        bmi,
        bmiCategory: getBmiCategory(bmi)
      } : null;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trainer-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ 
          messages: newMessages,
          userProfile
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const updateAssistant = (content: string) => {
        assistantContent = content;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
          }
          return [...prev, { role: "assistant", content: assistantContent }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, bmi, profile, language, toast]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput("");
    streamChat(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    streamChat(suggestion);
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <h1 className="text-xl font-bold text-foreground text-center">{t("trainer.title")}</h1>
          <Alert className="border-amber-600 bg-amber-50 dark:bg-amber-950/30 mt-3">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs font-medium">
              {t("trainer.disclaimer")}
            </AlertDescription>
          </Alert>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <p className="text-muted-foreground text-center">
                {language === "pt" 
                  ? "Olá! Sou seu treinador virtual. Como posso te ajudar hoje?" 
                  : "Hi! I'm your virtual trainer. How can I help you today?"}
              </p>
              
              {/* Suggestion bubbles */}
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {dailySuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors border border-border"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={language === "pt" ? "Digite sua pergunta..." : "Type your question..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
