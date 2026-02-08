import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const pt = language === "pt";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />{pt ? "Voltar" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold text-foreground mb-6">{pt ? "Termos de Uso" : "Terms of Use"}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p className="text-xs">{pt ? "Última atualização: Fevereiro de 2026" : "Last updated: February 2026"}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "1. Aceitação dos Termos" : "1. Acceptance of Terms"}</h2>
          <p>{pt
            ? "Ao utilizar o aplicativo Emagrece AI, você concorda com estes Termos de Uso. Se não concordar, não utilize o serviço."
            : "By using the Emagrece AI app, you agree to these Terms of Use. If you don't agree, do not use the service."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "2. Descrição do Serviço" : "2. Service Description"}</h2>
          <p>{pt
            ? "O Emagrece AI é um aplicativo de suporte ao emagrecimento que utiliza inteligência artificial para fornecer recomendações personalizadas de alimentação, treino e hábitos saudáveis."
            : "Emagrece AI is a weight loss support app that uses artificial intelligence to provide personalized recommendations for nutrition, training, and healthy habits."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "3. Limitação de Responsabilidade — Saúde" : "3. Liability Limitation — Health"}</h2>
          <p className="font-semibold text-foreground">{pt
            ? "⚠️ IMPORTANTE: O Emagrece AI NÃO é um serviço médico, nutricional ou de educação física. Todas as informações, recomendações e análises fornecidas pela inteligência artificial são de caráter INFORMATIVO e EDUCACIONAL. NÃO substituem a consulta e o acompanhamento de profissionais de saúde habilitados (médicos, nutricionistas, educadores físicos)."
            : "⚠️ IMPORTANT: Emagrece AI is NOT a medical, nutritional, or physical education service. All information, recommendations, and analyses provided by artificial intelligence are INFORMATIONAL and EDUCATIONAL. They do NOT replace consultation and monitoring by qualified health professionals (doctors, nutritionists, physical educators)."}</p>
          <p>{pt
            ? "Ao utilizar o serviço, você reconhece e aceita que: as análises de imagens são estimativas baseadas em IA; os cardápios e receitas são sugestões e não prescrições; as orientações do treinador virtual são genéricas; e qualquer decisão sobre dieta, exercício ou saúde deve ser consultada com um profissional."
            : "By using the service, you acknowledge and accept that: image analyses are AI-based estimates; meal plans and recipes are suggestions, not prescriptions; virtual trainer guidance is generic; and any decision about diet, exercise, or health should be consulted with a professional."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "4. Conta e Segurança" : "4. Account and Security"}</h2>
          <p>{pt
            ? "Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas com sua conta. O CPF é utilizado exclusivamente para identificação única e prevenção de duplicidade."
            : "You are responsible for maintaining password confidentiality and all activities performed with your account. CPF is used exclusively for unique identification and duplicate prevention."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "5. Uso Aceitável" : "5. Acceptable Use"}</h2>
          <p>{pt
            ? "Você concorda em não: compartilhar sua conta com terceiros; tentar burlar limites de uso; utilizar o serviço para fins ilegais; enviar conteúdo ofensivo ou inapropriado."
            : "You agree not to: share your account with third parties; attempt to circumvent usage limits; use the service for illegal purposes; send offensive or inappropriate content."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "6. Propriedade Intelectual" : "6. Intellectual Property"}</h2>
          <p>{pt
            ? "Todo o conteúdo, design, código e funcionalidades do Emagrece AI são propriedade exclusiva dos seus criadores. É proibida a reprodução sem autorização."
            : "All content, design, code, and features of Emagrece AI are the exclusive property of its creators. Reproduction without authorization is prohibited."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "7. Cancelamento" : "7. Cancellation"}</h2>
          <p>{pt
            ? "Você pode cancelar sua conta a qualquer momento através da seção de Perfil. Ao cancelar, todos os seus dados serão permanentemente excluídos conforme a LGPD."
            : "You can cancel your account at any time through the Profile section. Upon cancellation, all your data will be permanently deleted in accordance with LGPD."}</p>
        </div>
      </div>
    </div>
  );
}
