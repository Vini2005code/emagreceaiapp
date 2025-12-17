import { AppLayout } from "@/components/layout/AppLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { 
  AlertTriangle, 
  Dumbbell, 
  Brain, 
  Heart, 
  Apple,
  Moon,
  Footprints,
  Flame,
  BookOpen
} from "lucide-react";
import { useUserProfile } from "@/hooks/useUserProfile";

export default function Trainer() {
  const { t } = useLanguage();
  const { profile } = useUserProfile();

  const tips = [
    {
      icon: Dumbbell,
      titleKey: "trainer.tips.exercise.title",
      descKey: "trainer.tips.exercise.desc",
      category: "fitness"
    },
    {
      icon: Apple,
      titleKey: "trainer.tips.nutrition.title",
      descKey: "trainer.tips.nutrition.desc",
      category: "nutrition"
    },
    {
      icon: Moon,
      titleKey: "trainer.tips.sleep.title",
      descKey: "trainer.tips.sleep.desc",
      category: "lifestyle"
    },
    {
      icon: Heart,
      titleKey: "trainer.tips.cardio.title",
      descKey: "trainer.tips.cardio.desc",
      category: "fitness"
    },
    {
      icon: Brain,
      titleKey: "trainer.tips.mindset.title",
      descKey: "trainer.tips.mindset.desc",
      category: "mental"
    },
    {
      icon: Footprints,
      titleKey: "trainer.tips.steps.title",
      descKey: "trainer.tips.steps.desc",
      category: "fitness"
    },
    {
      icon: Flame,
      titleKey: "trainer.tips.metabolism.title",
      descKey: "trainer.tips.metabolism.desc",
      category: "nutrition"
    }
  ];

  const studies = [
    {
      titleKey: "trainer.studies.hiit.title",
      descKey: "trainer.studies.hiit.desc",
      sourceKey: "trainer.studies.hiit.source"
    },
    {
      titleKey: "trainer.studies.protein.title",
      descKey: "trainer.studies.protein.desc",
      sourceKey: "trainer.studies.protein.source"
    },
    {
      titleKey: "trainer.studies.sleep.title",
      descKey: "trainer.studies.sleep.desc",
      sourceKey: "trainer.studies.sleep.source"
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fitness": return "bg-primary/20 text-primary";
      case "nutrition": return "bg-green-500/20 text-green-400";
      case "lifestyle": return "bg-purple-500/20 text-purple-400";
      case "mental": return "bg-blue-500/20 text-blue-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const bmi = useMemo(() => {
    if (profile.weight && profile.height) {
      const heightInMeters = profile.height / 100;
      return profile.weight / (heightInMeters * heightInMeters);
    }
    return null;
  }, [profile.weight, profile.height]);

  return (
    <AppLayout>
      <div className="p-4 space-y-6 pb-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">{t("trainer.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("trainer.subtitle")}</p>
        </div>

        {/* Disclaimer */}
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200/90 text-sm">
            {t("trainer.disclaimer")}
          </AlertDescription>
        </Alert>

        {/* Profile Status */}
        {profile.weight && profile.height && bmi && (
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t("trainer.personalizedFor")}</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">IMC: {bmi.toFixed(1)}</Badge>
                  {profile.age && <Badge variant="secondary">{profile.age} {t("profile.age")}</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            {t("trainer.tipsTitle")}
          </h2>
          <div className="grid gap-3">
            {tips.map((tip, index) => {
              const Icon = tip.icon;
              return (
                <Card key={index} className="glass border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(tip.category)}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{t(tip.titleKey)}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{t(tip.descKey)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Studies Section */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {t("trainer.studiesTitle")}
          </h2>
          <div className="grid gap-3">
            {studies.map((study, index) => (
              <Card key={index} className="glass border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t(study.titleKey)}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{t(study.descKey)}</p>
                  <p className="text-xs text-primary/70 mt-2 italic">{t(study.sourceKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
