import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useConsent } from "@/hooks/useConsent";
import { useAnalytics } from "@/hooks/useAnalytics";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Brain, Shield, Utensils, Target, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { language } = useLanguage();
  const { grantConsent } = useConsent();
  const { track } = useAnalytics();
  const [step, setStep] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAI, setAcceptedAI] = useState(false);
  const [acceptedHealthData, setAcceptedHealthData] = useState(false);

  const pt = language === "pt";

  const steps = [
    {
      icon: <Brain className="h-12 w-12 text-accent" />,
      title: pt ? "Bem-vindo ao Emagrece AI! 🎉" : "Welcome to Emagrece AI! 🎉",
      desc: pt
        ? "Seu assistente pessoal de emagrecimento com inteligência artificial. Vamos configurar tudo em poucos segundos."
        : "Your personal AI-powered weight loss assistant. Let's set everything up in seconds.",
    },
    {
      icon: <Target className="h-12 w-12 text-primary" />,
      title: pt ? "Personalização Extrema" : "Extreme Personalization",
      desc: pt
        ? "Tudo é calculado com base no SEU corpo: IMC, TDEE, biotipo, rotina e limitações. Nada genérico."
        : "Everything is calculated based on YOUR body: BMI, TDEE, body type, routine and limitations. Nothing generic.",
    },
    {
      icon: <Utensils className="h-12 w-12 text-success" />,
      title: pt ? "Sua Primeira Vitória" : "Your First Win",
      desc: pt
        ? "Preencha seu perfil e gere seu primeiro cardápio personalizado em segundos. Comece a transformação agora!"
        : "Fill your profile and generate your first personalized menu in seconds. Start your transformation now!",
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: pt ? "Seus Dados Protegidos" : "Your Data Protected",
      desc: pt
        ? "Conformidade com a LGPD. Seus dados são criptografados e nunca compartilhados. Você tem controle total."
        : "LGPD compliant. Your data is encrypted and never shared. You have full control.",
      isConsent: true,
    },
  ];

  const handleNext = async () => {
    if (step === steps.length - 1) {
      if (!acceptedTerms || !acceptedPrivacy || !acceptedAI || !acceptedHealthData) return;
      await grantConsent(["terms_of_use", "privacy_policy", "ai_usage", "image_analysis"]);
      track("onboarding_completed");
      onComplete();
    } else {
      track("onboarding_step", { step: step + 1 });
      setStep(step + 1);
    }
  };

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const canProceed = isLast ? acceptedTerms && acceptedPrivacy && acceptedAI && acceptedHealthData : true;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-2 mb-6 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= step ? "bg-primary w-10" : "bg-muted w-6"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="glass border-border/50">
              <CardContent className="pt-8 pb-6 text-center space-y-6">
                <div className="flex justify-center">{current.icon}</div>
                <h2 className="text-xl font-bold text-foreground">{current.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{current.desc}</p>

                {current.isConsent && (
                  <div className="space-y-3 text-left">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(!!v)} className="mt-0.5" />
                      <span className="text-xs text-muted-foreground">
                        {pt ? "Li e aceito os " : "I've read and accept the "}
                        <a href="/terms" className="text-primary underline" target="_blank">{pt ? "Termos de Uso" : "Terms of Use"}</a>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={acceptedPrivacy} onCheckedChange={(v) => setAcceptedPrivacy(!!v)} className="mt-0.5" />
                      <span className="text-xs text-muted-foreground">
                        {pt ? "Li e aceito a " : "I've read and accept the "}
                        <a href="/privacy" className="text-primary underline" target="_blank">{pt ? "Política de Privacidade" : "Privacy Policy"}</a>
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={acceptedAI} onCheckedChange={(v) => setAcceptedAI(!!v)} className="mt-0.5" />
                      <span className="text-xs text-muted-foreground">
                        {pt
                          ? "Autorizo o uso de IA para análise de dados e recomendações personalizadas"
                          : "I authorize the use of AI for data analysis and personalized recommendations"}
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <Checkbox checked={acceptedHealthData} onCheckedChange={(v) => setAcceptedHealthData(!!v)} className="mt-0.5" />
                      <span className="text-xs text-muted-foreground">
                        {pt
                          ? "Autorizo o tratamento de dados sensíveis de saúde (peso, medidas corporais, fotos de progresso e informações médicas) conforme a LGPD Art. 11"
                          : "I authorize the processing of sensitive health data (weight, body measurements, progress photos and medical information) per LGPD Art. 11"}
                      </span>
                    </label>
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="w-full"
                  variant="cta"
                  size="lg"
                >
                  {isLast ? (
                    <><CheckCircle2 className="h-4 w-4 mr-2" />{pt ? "Começar Agora" : "Start Now"}</>
                  ) : (
                    <>{pt ? "Próximo" : "Next"}<ArrowRight className="h-4 w-4 ml-2" /></>
                  )}
                </Button>

                {!isLast && (
                  <button
                    onClick={() => {
                      setStep(steps.length - 1);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {pt ? "Pular para o final" : "Skip to end"}
                  </button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
