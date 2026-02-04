import React from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  Flame,
  Dumbbell,
  Droplets,
  Target,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { BodyAnalysis } from "@/hooks/useProgressPhotos";

interface AnalysisResultProps {
  analysis: BodyAnalysis;
}

export function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { language } = useLanguage();

  if (!analysis.isValidImage) {
    return (
      <Card className="bg-destructive/10 border-destructive/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <p className="text-destructive font-medium">
              {analysis.error || (language === "pt" 
                ? "Não foi possível analisar a imagem" 
                : "Could not analyze the image")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const t = {
    title: language === "pt" ? "Análise Corporal IA" : "AI Body Analysis",
    overallProgress: language === "pt" ? "Progresso Geral" : "Overall Progress",
    bodyComposition: language === "pt" ? "Composição Corporal" : "Body Composition",
    changes: language === "pt" ? "Mudanças Detectadas" : "Detected Changes",
    positivePoints: language === "pt" ? "Pontos Positivos" : "Positive Points",
    attentionPoints: language === "pt" ? "Pontos de Atenção" : "Attention Points",
    suggestions: language === "pt" ? "Sugestões" : "Suggestions",
    nextSteps: language === "pt" ? "Próximos Passos" : "Next Steps",
    fatReduction: language === "pt" ? "Redução de Gordura" : "Fat Reduction",
    muscleGain: language === "pt" ? "Ganho Muscular" : "Muscle Gain",
    postureImprovement: language === "pt" ? "Melhora Postural" : "Posture Improvement",
    waterRetention: language === "pt" ? "Retenção Hídrica" : "Water Retention",
    fatAreas: language === "pt" ? "Áreas com gordura" : "Fat areas",
    muscleAreas: language === "pt" ? "Áreas definidas" : "Defined areas",
    confidence: language === "pt" ? "Confiança" : "Confidence",
    improving: language === "pt" ? "Melhorando" : "Improving",
    stable: language === "pt" ? "Estável" : "Stable",
    regressing: language === "pt" ? "Regredindo" : "Regressing",
    low: language === "pt" ? "Baixo" : "Low",
    moderate: language === "pt" ? "Moderado" : "Moderate",
    high: language === "pt" ? "Alto" : "High",
    slight: language === "pt" ? "Leve" : "Slight",
    significant: language === "pt" ? "Significativo" : "Significant",
    detected: language === "pt" ? "Detectado" : "Detected",
    notDetected: language === "pt" ? "Não detectado" : "Not detected",
  };

  const trendIcons = {
    improving: <TrendingUp className="h-5 w-5 text-green-500" />,
    stable: <Minus className="h-5 w-5 text-yellow-500" />,
    regressing: <TrendingDown className="h-5 w-5 text-red-500" />,
  };

  const trendLabels = {
    improving: t.improving,
    stable: t.stable,
    regressing: t.regressing,
  };

  const levelLabels = {
    low: t.low,
    moderate: t.moderate,
    high: t.high,
    slight: t.slight,
    significant: t.significant,
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {t.overallProgress}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {trendIcons[analysis.overallProgress.trend]}
              <span className="font-medium">{trendLabels[analysis.overallProgress.trend]}</span>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {analysis.overallProgress.score}/100
            </Badge>
          </div>
          <Progress value={analysis.overallProgress.score} className="h-3" />
          <p className="text-muted-foreground">{analysis.overallProgress.summary}</p>
        </CardContent>
      </Card>

      {/* Body Composition */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            {t.bodyComposition}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">% Gordura Estimado</span>
            <Badge variant="outline">{analysis.bodyComposition.fatPercentageEstimate}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Definição Muscular</span>
            <Badge variant={analysis.bodyComposition.muscleDefinition === "high" ? "default" : "secondary"}>
              {levelLabels[analysis.bodyComposition.muscleDefinition]}
            </Badge>
          </div>
          
          {analysis.bodyComposition.mainFatAreas.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">{t.fatAreas}:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.bodyComposition.mainFatAreas.map((area, i) => (
                  <Badge key={i} variant="outline" className="text-xs">{area}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {analysis.bodyComposition.muscularAreas.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground">{t.muscleAreas}:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {analysis.bodyComposition.muscularAreas.map((area, i) => (
                  <Badge key={i} variant="default" className="text-xs">{area}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Changes Detected */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t.changes}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Fat Reduction */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm">{t.fatReduction}</span>
            </div>
            {analysis.changes.fatReduction.detected ? (
              <Badge variant="default" className="bg-green-500">
                {levelLabels[analysis.changes.fatReduction.level]}
              </Badge>
            ) : (
              <Badge variant="outline">{t.notDetected}</Badge>
            )}
          </div>

          {/* Muscle Gain */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-500" />
              <span className="text-sm">{t.muscleGain}</span>
            </div>
            {analysis.changes.muscleGain.detected ? (
              <Badge variant="default" className="bg-blue-500">
                {levelLabels[analysis.changes.muscleGain.level]}
              </Badge>
            ) : (
              <Badge variant="outline">{t.notDetected}</Badge>
            )}
          </div>

          {/* Posture */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
              <span className="text-sm">{t.postureImprovement}</span>
            </div>
            {analysis.changes.postureImprovement.detected ? (
              <Badge variant="default" className="bg-purple-500">{t.detected}</Badge>
            ) : (
              <Badge variant="outline">{t.notDetected}</Badge>
            )}
          </div>

          {/* Water Retention */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              <span className="text-sm">{t.waterRetention}</span>
            </div>
            {analysis.changes.waterRetention.detected ? (
              <Badge variant={analysis.changes.waterRetention.level === "high" ? "destructive" : "secondary"}>
                {levelLabels[analysis.changes.waterRetention.level]}
              </Badge>
            ) : (
              <Badge variant="outline">{t.notDetected}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Positive Points */}
          {analysis.feedback.positivePoints.length > 0 && (
            <div>
              <h4 className="font-medium text-green-600 flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                {t.positivePoints}
              </h4>
              <ul className="space-y-1">
                {analysis.feedback.positivePoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Attention Points */}
          {analysis.feedback.attentionPoints.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-600 flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4" />
                {t.attentionPoints}
              </h4>
              <ul className="space-y-1">
                {analysis.feedback.attentionPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Suggestions */}
          {analysis.feedback.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-600 flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4" />
                {t.suggestions}
              </h4>
              <ul className="space-y-1">
                {analysis.feedback.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500 mt-1">{i + 1}.</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Motivational Message */}
          {analysis.feedback.motivationalMessage && (
            <>
              <Separator />
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm italic text-center">
                  "{analysis.feedback.motivationalMessage}"
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {analysis.nextSteps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {t.nextSteps}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {analysis.nextSteps.map((step, i) => (
                <li key={i} className="text-sm flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* Confidence */}
      <div className="text-center text-sm text-muted-foreground">
        {t.confidence}: {analysis.confidenceLevel}
      </div>
    </div>
  );
}
