import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Link de recuperação enviado! Verifique seu email.");
    } catch {
      toast.error("Erro ao enviar o link. Verifique o email e tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Emagrece AI" className="h-16 w-16 rounded-2xl shadow-lg" />
        </div>

        <Card className="glass-strong border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-xl font-bold">Recuperar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-success" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada e spam.
                </p>
                <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                  <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Informe seu email e enviaremos um link para redefinir sua senha.
                </p>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Seu email"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-teal font-bold h-11" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : "ENVIAR LINK"}
                </Button>
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors underline decoration-dotted"
                >
                  Voltar ao Login
                </button>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
