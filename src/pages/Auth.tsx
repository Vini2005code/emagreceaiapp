import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { isValidCPF, formatCPF } from "@/lib/cpfValidator";
import { z } from "zod";

const signupSchema = z.object({
  fullName: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  cpf: z.string().refine((val) => isValidCPF(val.replace(/\D/g, "")), "CPF inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");

  // LGPD Consent Checkboxes
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedHealth, setAcceptedHealth] = useState(false);
  const [acceptedAI, setAcceptedAI] = useState(false);

  const allConsentsAccepted = acceptedTerms && acceptedHealth && acceptedAI;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/");
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate("/");
      } else {
        // Zod validation
        const result = signupSchema.safeParse({ fullName, email, cpf, password });
        if (!result.success) {
          const firstError = result.error.errors[0]?.message;
          toast.error(firstError || "Dados inválidos.");
          setIsLoading(false);
          return;
        }

        if (!allConsentsAccepted) {
          toast.error("É obrigatório aceitar todos os termos.");
          setIsLoading(false);
          return;
        }

        const cleanCpf = cpf.replace(/\D/g, "");

        // NOTE: Duplicate CPF/email checks are intentionally NOT done client-side
        // to prevent user enumeration attacks (security finding: user_enumeration).
        // Duplicates are enforced by DB UNIQUE constraints and Supabase Auth,
        // and surfaced via generic error messages in the catch block below.

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              cpf: cleanCpf,
            },
          },
        });

        if (error) throw error;
        toast.success("Conta criada! Verifique seu email.");
        navigate("/");
      }
    } catch (error: any) {
      const msg: string = error?.message || "";
      const code: string = error?.code || "";
      if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
        toast.error("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else if (msg.includes("User already registered") || msg.includes("already been registered")) {
        // Generic message — do not reveal whether CPF or email caused the conflict
        toast.error("Já existe uma conta com esses dados. Tente fazer login.");
        setIsLogin(true);
      } else if (msg.includes("Email not confirmed")) {
        toast.error("Confirme seu e-mail antes de entrar.");
      } else if (code === "23505" || msg.includes("duplicate key") || msg.includes("unique")) {
        // DB unique constraint violation (e.g. duplicate CPF) — generic message
        toast.error("Já existe uma conta com esses dados. Tente fazer login.");
        setIsLogin(true);
      } else {
        toast.error("Ocorreu um erro ao processar seu cadastro. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Emagrece AI" className="h-16 w-16 rounded-2xl shadow-lg" />
        </div>

        <Card className="glass-strong border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-xl font-bold">
              {isLogin ? "Acessar App" : "Novo Cadastro"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nome Completo" className="pl-9" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="CPF" className="pl-9" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} maxLength={14} required />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="Email" className="pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="Senha (mínimo 6 caracteres)" className="pl-9 pr-9" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-primary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {isLogin && (
                <div className="text-right -mt-1">
                  <a href="/forgot-password" className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline decoration-dotted">
                    Esqueci minha senha
                  </a>
                </div>
              )}

              {/* LGPD Consent - Signup Only */}
              {!isLogin && (
                <div className="space-y-3 pt-2 px-1 border-t border-border/30 mt-2">
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider pt-2">Consentimentos Obrigatórios (LGPD)</p>
                  
                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(!!v)} className="mt-0.5" />
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      Li e aceito os{" "}
                      <a href="/terms" target="_blank" className="text-primary underline">Termos de Uso</a>{" "}e a{" "}
                      <a href="/privacy" target="_blank" className="text-primary underline">Política de Privacidade</a>.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <Checkbox id="health" checked={acceptedHealth} onCheckedChange={(v) => setAcceptedHealth(!!v)} className="mt-0.5" />
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      Autorizo o tratamento de <strong>dados sensíveis de saúde</strong> (peso, medidas, fotos de progresso e informações médicas) conforme LGPD Art. 11.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer group">
                    <Checkbox id="ai" checked={acceptedAI} onCheckedChange={(v) => setAcceptedAI(!!v)} className="mt-0.5" />
                    <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      Autorizo o <strong>processamento de dados por Inteligência Artificial</strong> para análises nutricionais e recomendações personalizadas.
                    </span>
                  </label>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full gradient-teal font-bold h-11" 
                disabled={isLoading || (!isLogin && !allConsentsAccepted)}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "ENTRAR" : "CRIAR CONTA")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setAcceptedTerms(false); setAcceptedHealth(false); setAcceptedAI(false); }} 
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
              >
                {isLogin ? "Não tem conta? Cadastre-se aqui" : "Já possui conta? Faça login"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
