import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Flame, Beef, Wheat, Droplet, RotateCcw, Utensils } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface AnalysisResult {
  isFood: boolean;
  foodName?: string;
  nutrition?: NutritionInfo;
  error?: string;
}

const Scanner = () => {
  const { t, language } = useLanguage();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [foodName, setFoodName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setResult(null);
    setFoodName(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      analyzeImage(base64);
    };
    reader.readAsDataURL(selectedFile);
  };

  const analyzeImage = async (imageBase64: string) => {
    setIsAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64 }
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error(t("scanner.errorAnalyzing"));
        setResult({ isFood: false, error: t("scanner.errorAnalyzing") });
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setResult({ isFood: false, error: data.error });
        return;
      }

      if (!data.isFood) {
        toast.warning(t("scanner.notFood"));
        setResult({ isFood: false });
        return;
      }

      setFoodName(data.foodName || null);
      setResult({
        isFood: true,
        nutrition: data.nutrition
      });
      toast.success(t("scanner.analysisComplete"));
    } catch (err) {
      console.error("Analysis error:", err);
      toast.error(t("scanner.errorAnalyzing"));
      setResult({ isFood: false, error: t("scanner.errorAnalyzing") });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setResult(null);
    setFoodName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const nutritionItems = result?.nutrition
    ? [
        { icon: Flame, label: t("scanner.calories"), value: result.nutrition.calories, unit: "kcal", color: "text-orange-500" },
        { icon: Beef, label: t("scanner.protein"), value: result.nutrition.protein, unit: "g", color: "text-red-500" },
        { icon: Wheat, label: t("scanner.carbs"), value: result.nutrition.carbs, unit: "g", color: "text-amber-500" },
        { icon: Droplet, label: t("scanner.fat"), value: result.nutrition.fat, unit: "g", color: "text-blue-500" },
      ]
    : [];

  const disclaimerText = language === "pt" 
    ? "📸 A análise por foto é uma estimativa baseada em inteligência artificial. Para valores nutricionais precisos, consulte embalagens ou um nutricionista."
    : "📸 Photo analysis is an AI-based estimate. For precise nutritional values, check labels or consult a nutritionist.";

  return (
    <AppLayout title={t("scanner.title")} subtitle={t("scanner.subtitle")}>
      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-secondary/50 border border-border rounded-xl">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          {disclaimerText}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!imagePreview ? (
          <motion.div 
            key="upload" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("scanner.uploadTitle")}</h3>
                  <p className="text-muted-foreground text-sm">{t("scanner.uploadDesc")}</p>
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="gap-2"
                >
                  <Upload className="h-5 w-5" />
                  {t("scanner.uploadPhoto")}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div 
            key="result" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="overflow-hidden">
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Food preview"
                  className="w-full h-48 object-cover" 
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">{t("scanner.analyzing")}</p>
                    </div>
                  </div>
                )}
              </div>

              {foodName && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <span className="font-medium">{foodName}</span>
                  </div>
                </div>
              )}

              {result && !result.isFood && (
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                    <Camera className="h-8 w-8 text-destructive" />
                  </div>
                  <div>
                    <p className="font-semibold text-destructive">{t("scanner.notFoodTitle")}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t("scanner.notFoodDesc")}</p>
                  </div>
                </CardContent>
              )}

              {result?.nutrition && (
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3">
                    {nutritionItems.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-muted/50 rounded-lg p-3 text-center"
                      >
                        <item.icon className={`h-6 w-6 mx-auto mb-1 ${item.color}`} />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-bold text-lg">
                          {item.value}
                          <span className="text-xs font-normal text-muted-foreground ml-1">{item.unit}</span>
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {(result.nutrition.fiber !== undefined || result.nutrition.sugar !== undefined) && (
                    <div className="mt-4 pt-4 border-t flex justify-around text-center">
                      {result.nutrition.fiber !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t("scanner.fiber")}</p>
                          <p className="font-semibold">{result.nutrition.fiber}g</p>
                        </div>
                      )}
                      {result.nutrition.sugar !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">{t("scanner.sugar")}</p>
                          <p className="font-semibold">{result.nutrition.sugar}g</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            <Button 
              onClick={resetScanner} 
              variant="outline" 
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              {t("scanner.scanAnother")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Scanner;
