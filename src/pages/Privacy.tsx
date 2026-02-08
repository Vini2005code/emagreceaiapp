import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const pt = language === "pt";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />{pt ? "Voltar" : "Back"}
        </Button>
        <h1 className="text-2xl font-bold text-foreground mb-6">{pt ? "Política de Privacidade" : "Privacy Policy"}</h1>
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-muted-foreground">
          <p className="text-xs">{pt ? "Última atualização: Fevereiro de 2026" : "Last updated: February 2026"}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "1. Dados Coletados" : "1. Data Collected"}</h2>
          <p>{pt
            ? "Coletamos dados pessoais fornecidos voluntariamente: nome, e-mail, CPF (para identificação única), dados corporais (peso, altura, idade, gênero), preferências alimentares, limitações médicas e fotos de progresso. Também coletamos dados de uso do aplicativo para melhoria contínua."
            : "We collect personal data voluntarily provided: name, email, CPF (for unique identification), body data (weight, height, age, gender), food preferences, medical limitations, and progress photos. We also collect app usage data for continuous improvement."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "2. Uso dos Dados" : "2. Data Usage"}</h2>
          <p>{pt
            ? "Seus dados são utilizados exclusivamente para: personalização de recomendações nutricionais e de treino via IA, cálculos de métricas corporais (IMC, TDEE, percentual de gordura), geração de cardápios personalizados, análise de fotos de progresso, e comunicação sobre o serviço."
            : "Your data is used exclusively for: personalization of nutritional and training recommendations via AI, body metrics calculations (BMI, TDEE, body fat percentage), personalized meal plan generation, progress photo analysis, and service communication."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "3. Inteligência Artificial" : "3. Artificial Intelligence"}</h2>
          <p>{pt
            ? "Utilizamos modelos de IA para análise de imagens (scanner nutricional), chat com treinador virtual, geração de receitas e cardápios. As respostas da IA são estimativas e não substituem orientação profissional de saúde. Seus dados são processados de forma segura e não são compartilhados com terceiros."
            : "We use AI models for image analysis (nutritional scanner), virtual trainer chat, recipe and meal plan generation. AI responses are estimates and do not replace professional health guidance. Your data is processed securely and is not shared with third parties."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "4. Armazenamento e Segurança" : "4. Storage and Security"}</h2>
          <p>{pt
            ? "Seus dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. Utilizamos políticas de segurança em nível de linha (RLS) para garantir que cada usuário acesse apenas seus próprios dados. O CPF é armazenado de forma protegida."
            : "Your data is stored on secure servers with encryption in transit and at rest. We use row-level security (RLS) policies to ensure each user accesses only their own data. CPF is stored in a protected manner."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "5. Seus Direitos (LGPD)" : "5. Your Rights (LGPD)"}</h2>
          <p>{pt
            ? "Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a: acessar seus dados, corrigir informações, exportar seus dados, revogar consentimentos e solicitar a exclusão completa da sua conta e histórico. Todas essas funcionalidades estão disponíveis diretamente no aplicativo, na seção de Perfil."
            : "Under the General Data Protection Law (Law 13,709/2018), you have the right to: access your data, correct information, export your data, revoke consents, and request complete deletion of your account and history. All these features are available directly in the app, in the Profile section."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "6. Fotos e Imagens" : "6. Photos and Images"}</h2>
          <p>{pt
            ? "Fotos de progresso e fotos enviadas ao scanner são armazenadas de forma segura e acessíveis apenas pelo próprio usuário. As imagens são analisadas por IA exclusivamente para fornecer feedback nutricional ou corporal. Você pode excluir suas fotos a qualquer momento."
            : "Progress photos and scanner photos are stored securely and accessible only by the user. Images are analyzed by AI exclusively to provide nutritional or body feedback. You can delete your photos at any time."}</p>

          <h2 className="text-foreground text-lg font-semibold">{pt ? "7. Contato" : "7. Contact"}</h2>
          <p>{pt
            ? "Para dúvidas sobre privacidade ou exercício dos seus direitos, utilize o canal de feedback dentro do aplicativo ou entre em contato pelo e-mail disponibilizado na seção de suporte."
            : "For privacy questions or to exercise your rights, use the feedback channel within the app or contact us through the email provided in the support section."}</p>
        </div>
      </div>
    </div>
  );
}
