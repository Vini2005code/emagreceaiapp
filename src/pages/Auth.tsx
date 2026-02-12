import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Eye, EyeOff, CreditCard, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import logo from "@/assets/logo.png";
import { z } from "zod";
import { isValidCPF, formatCPF } from "@/lib/cpfValidator";

const emailSchema = z.string().email("Email inválido").max(255);
const passwordSchema = z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72);
const nameSchema = z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(100);

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string; cpf?: string }>({});

  // Estados de Consentimento LGPD
  const [acceptedLGPD, setAcceptedLGPD] = useState(false);
  const [acceptedHealthData, setAcceptedHealthData] = useState(false);
  const [acceptedAI, setAcceptedAI] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) navigate("/");
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleCpfChange = (value: string) => {
    setCpf(formatCPF(value));
  };

  const validateInputs = () => {
    const newErrors: { email?: string; password?: string; name?: string; cpf?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0].message;
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0].message;
    }
    
    if (!isLogin) {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) newErrors.name = e.errors[0].message;
      }

      const cleanedCpf = cpf.replace(/\D/g, "");
      if (!cleanedCpf) {
        newErrors.cpf = "CPF é obrigatório";
      } else if (!isValidCPF(cleanedCpf)) {
        newErrors.cpf = "CPF inválido";
      }

      if (!acceptedLGPD || !acceptedHealthData || !acceptedAI) {
        toast.error("Você precisa aceitar os termos de privacidade e IA.");
        return false;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          toast.error(error.message.includes("Invalid login credentials") ? "Email ou senha incorretos" : error.message);
          return;
        }

        toast.success("Bem-vindo de volta!");
        navigate("/");
      } else {
        const cleanedCpf = cpf.replace(/\D/g, "");
        
        // Verifica CPF duplicado
        const { data: existingCpf } = await supabase.from("profiles").select("cpf").eq("cpf", cleanedCpf).maybeSingle();
        if (existingCpf) {
          toast.error("Este CPF já está cadastrado.");
          setIsLogin(true);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              cpf: cleanedCpf,
              onboarding_completed: false // Marca como novo usuário para o setup inicial
            },
          },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Conta criada com sucesso!");
        navigate("/");
      }
    } catch (error) {
      toast.error("Erro ao processar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Emagrece AI" className="h-16 w-16 mx-auto mb-4 rounded-xl" />
          <h1 className="text-2xl font-bold">Emagrece <span className="text-primary">AI</span></h1>
        </div>

        <Card className="glass-strong border-border/50 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{isLogin ? "Entrar" : "Criar conta"}</CardTitle>
            <CardDescription>{isLogin ? "Acesse sua conta individual" : "Inicie sua transformação agora"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input id="name" placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                    {errors.name && <p className="text-destructive text-[10px]">{errors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" value={cpf} onChange={(e) => handleCpfChange(e.target.value)} maxLength={14} disabled={isLoading} />
                    {errors.cpf && <p className="text-destructive text-[10px]">{errors.cpf}</p>}
                  </div>
                </>
              )}

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
                {errors.email && <p className="text-destructive text-[10px]">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-[10px]">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="space-y-3 pt-2 bg-muted/40 p-3 rounded-lg border border-border/50">
                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" checked={acceptedLGPD} onCheckedChange={(v) => setAcceptedLGPD(!!v)} />
                    <Label htmlFor="terms" className="text-[10px] leading-tight text-muted-foreground">
                      Aceito os <a href="/terms" className="text-primary underline">Termos</a> e <a href="/privacy" className="text-primary underline">Privacidade</a>.
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="health" checked={acceptedHealthData} onCheckedChange={(v) => setAcceptedHealthData(!!v)} />
                    <Label htmlFor="health" className="text-[10px] leading-tight text-muted-foreground">
                      Autorizo o tratamento de meus dados de saúde.
                    </Label>
                  </div>
                  <div className="flex items-start gap-2">
                    <Checkbox id="ai" checked={acceptedAI} onCheckedChange={(v) => setAcceptedAI(!!v)} />
                    <Label htmlFor="ai" className="text-[10px] leading-tight text-muted-foreground">
                      Autorizo o processamento de dados por IA.
                    </Label>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full gradient-teal h-12" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "Entrar" : "Criar Minha Conta")}
              </Button>
            </form>

            <button onClick={() => { setIsLogin(!isLogin); setErrors({}); }} className="w-full text-center text-xs mt-6 text-muted-foreground hover:text-primary transition-colors">
              {isLogin ? "Não tem conta? Criar agora" : "Já tem conta? Fazer login"}
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
