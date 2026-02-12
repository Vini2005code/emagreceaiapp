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

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Começa sempre no Login
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");

  // Checkboxes de Segurança
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedHealth, setAcceptedHealth] = useState(false);
  const [acceptedAI, setAcceptedAI] = useState(false);

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
        // --- LÓGICA DE LOGIN SIMPLES ---
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate("/");
        
      } else {
        // --- LÓGICA DE CADASTRO COM TRAVA LGPD ---
        if (!acceptedTerms || !acceptedHealth || !acceptedAI) {
          toast.error("É obrigatório aceitar todos os termos de segurança.");
          setIsLoading(false);
          return;
        }

        const cleanCpf = cpf.replace(/\D/g, "");
        if (!isValidCPF(cleanCpf)) {
          toast.error("CPF inválido.");
          setIsLoading(false);
          return;
        }

        // Verifica CPF duplicado antes de tentar criar
        const { data: existingUser } = await supabase.from("profiles").select("id").eq("cpf", cleanCpf).maybeSingle();
        if (existingUser) {
          toast.error("CPF já cadastrado. Faça login.");
          setIsLogin(true);
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              cpf: cleanCpf,
              onboarding_completed: false // Garante que vá para o Setup Rápido depois
            },
          },
        });

        if (error) throw error;
        toast.success("Conta criada!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message.includes("Invalid login") ? "Credenciais inválidas." : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        
        {/* Logo Centralizada */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16 rounded-2xl shadow-lg" />
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
                <Input type={showPassword ? "text" : "password"} placeholder="Senha" className="pl-9 pr-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-primary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* TRAVA DE SEGURANÇA E LGPD (Apenas no Cadastro) */}
              {!isLogin && (
                <div className="space-y-3 pt-2 px-1">
                  <div className="flex items-center gap-2">
                    <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={(v) => setAcceptedTerms(!!v)} />
                    <Label htmlFor="terms" className="text-[11px] cursor-pointer text-muted-foreground">Aceito os Termos e Privacidade.</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="health" checked={acceptedHealth} onCheckedChange={(v) => setAcceptedHealth(!!v)} />
                    <Label htmlFor="health" className="text-[11px] cursor-pointer text-muted-foreground">Autorizo uso de dados de saúde.</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="ai" checked={acceptedAI} onCheckedChange={(v) => setAcceptedAI(!!v)} />
                    <Label htmlFor="ai" className="text-[11px] cursor-pointer text-muted-foreground">Autorizo análise por IA.</Label>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full gradient-teal font-bold h-11" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : (isLogin ? "ENTRAR" : "CRIAR CONTA")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setAcceptedTerms(false); }} 
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
