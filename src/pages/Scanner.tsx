import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Flame, Beef, Wheat, Droplet, RotateCcw, Utensils, Scale, AlertCircle, CheckCircle2, Barcode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NutritionReview } from "@/components/scanner/NutritionReview";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { useAuth } from "@/hooks/useAuth";

interface MacroInfo {
  p: number;
  c: number;
  g: number;
}

interface FoodItem {
  item: string;
  porcao_estimada: string;
  calorias: number;
  macros: MacroInfo;
}

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
  alimentos?: FoodItem[];
  nutrition?: NutritionInfo;
  gorduras_ocultas_adicionadas?: string;
  confianca_da_analise?: string;
  referencias_de_escala?: string[];
  error?: string;
}

const Scanner = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const pt = language === "pt";

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [foodName, setFoodName] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showBarcode, setShowBarcode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setResult(null);
    setFoodName(null);
    setShowReview(false);
    setIsSaved(false);
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
        nutrition: data.nutrition,
        alimentos: data.alimentos,
        gorduras_ocultas_adicionadas: data.gorduras_ocultas_adicionadas,
        confianca_da_analise: data.confianca_da_analise,
        referencias_de_escala: data.referencias_de_escala,
      });
      setShowReview(true);
      toast.success(t("scanner.analysisComplete"));
    } catch {
      toast.error(t("scanner.errorAnalyzing"));
      setResult({ isFood: false, error: t("scanner.errorAnalyzing") });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBarcodeProduct = (product: any) => {
    setImagePreview(product.image_url || null);
    setFoodName(`${product.name}${product.brand ? ` (${product.brand})` : ""}`);
    setResult({
      isFood: true,
      nutrition: {
        calories: product.calories,
        protein: product.protein,
        carbs: product.carbs,
        fat: product.fat,
        fiber: product.fiber,
        sugar: product.sugar,
      },
    });
    setShowReview(true);
    setIsSaved(false);
  };

  const handleConfirmNutrition = async (nutrition: NutritionInfo, alimentos?: FoodItem[]) => {
    setShowReview(false);
    setResult(prev => prev ? { ...prev, nutrition, alimentos } : prev);
    setIsSaved(true);
    toast.success(pt ? "Registro salvo com sucesso!" : "Record saved successfully!");
  };

  const resetScanner = () => {
    setImagePreview(null);
    setResult(null);
    setFoodName(null);
    setShowReview(false);
    setIsSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const nutritionItems = result?.nutrition
    ? [
        { icon: Flame, label: t("scanner.calories"), value: result.nutrition.calories, unit: "kcal", color: "text-orange-500" },
        { icon: Beef, label: t("scanner.protein"), value: result.nutrition.protein, unit: "g", color: "text-red-500" },
        { icon: Wheat, label: t("scanner.carbs"), value: result.nutrition.carbs, unit: "g", color: "text-amber-500" },
        { icon: Droplet, label: t("scanner.fat"), value: result.nutrition.fat, unit: "g", color: "text-blue-500" },
      ]
    : [];

  const disclaimerText = pt
    ? "🔬 Esta análise utiliza Inteligência Artificial avançada com detecção de escala e inferência de gorduras ocultas. Os valores são estimativas científicas baseadas em referências nutricionais padrão — para precisão clínica, consulte um nutricionista."
    : "🔬 This analysis uses advanced AI with scale detection and hidden fats inference. Values are scientific estimates based on standard nutritional references — for clinical accuracy, consult a nutritionist.";

  const getConfidenceColor = (confidence: string) => {
    const value = parseInt(confidence);
    if (value >= 80) return "text-green-500";
    if (value >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <AppLayout title={t("scanner.title")} subtitle={t("scanner.subtitle")}>
      {/* Disclaimer */}
      <div className="mb-4 p-3 bg-secondary/50 border border-border rounded-xl">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">{disclaimerText}</p>
      </div>

      <AnimatePresence mode="wait">
        {!imagePreview && !result ? (
          <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Camera className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{t("scanner.uploadTitle")}</h3>
                  <p className="text-muted-foreground text-sm">{t("scanner.uploadDesc")}</p>
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {pt ? "Nenhum alimento escaneado ainda. Que tal começar agora? 📸" : "No food scanned yet. How about starting now? 📸"}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button onClick={() => fileInputRef.current?.click()} size="lg" className="gap-2">
                    <Upload className="h-5 w-5" />
                    {t("scanner.uploadPhoto")}
                  </Button>
                  <Button variant="outline" size="lg" className="gap-2" onClick={() => setShowBarcode(true)}>
                    <Barcode className="h-5 w-5" />
                    {pt ? "Scanner de Código de Barras" : "Barcode Scanner"}
                  </Button>
                </div>
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
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            <Card className="overflow-hidden">
              {imagePreview && (
                <div className="relative">
                  <img src={imagePreview} alt="Food preview" className="w-full h-48 object-cover" />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="animate-spin h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">{t("scanner.analyzing")}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {foodName && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-5 w-5 text-primary" />
                      <span className="font-medium">{foodName}</span>
                    </div>
                    {result?.confianca_da_analise && (
                      <div className={`flex items-center gap-1 text-xs ${getConfidenceColor(result.confianca_da_analise)}`}>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{pt ? "Confiança" : "Confidence"}: {result.confianca_da_analise}</span>
                      </div>
                    )}
                    {isSaved && (
                      <div className="flex items-center gap-1 text-xs text-green-500">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{pt ? "Salvo" : "Saved"}</span>
                      </div>
                    )}
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

              {result?.nutrition && !showReview && (
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {nutritionItems.map((item, index) => (
                      <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }} className="bg-muted/50 rounded-lg p-3 text-center">
                        <item.icon className={`h-6 w-6 mx-auto mb-1 ${item.color}`} />
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="font-bold text-lg">
                          {item.value}<span className="text-xs font-normal text-muted-foreground ml-1">{item.unit}</span>
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {(result.nutrition.fiber !== undefined || result.nutrition.sugar !== undefined) && (
                    <div className="pt-3 border-t flex justify-around text-center">
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

                  {(result.alimentos?.length || result.gorduras_ocultas_adicionadas || result.referencias_de_escala?.length) && (
                    <div className="pt-3 border-t space-y-3">
                      {result.alimentos && result.alimentos.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            {pt ? "Ingredientes detectados:" : "Detected ingredients:"}
                          </p>
                          <div className="space-y-1">
                            {result.alimentos.map((alimento, idx) => (
                              <div key={idx} className="flex justify-between text-xs bg-muted/30 rounded px-2 py-1">
                                <span className="text-foreground">{alimento.item}</span>
                                <span className="text-muted-foreground">{alimento.porcao_estimada} • {alimento.calorias} kcal</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.gorduras_ocultas_adicionadas && (
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 rounded px-2 py-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{pt ? "Gorduras ocultas (óleos/temperos):" : "Hidden fats (oils/seasonings):"} +{result.gorduras_ocultas_adicionadas}</span>
                        </div>
                      )}
                      {result.referencias_de_escala && result.referencias_de_escala.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">{pt ? "Referências de escala:" : "Scale references:"}</span> {result.referencias_de_escala.join(", ")}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Review component */}
            {showReview && result?.nutrition && (
              <NutritionReview
                nutrition={result.nutrition}
                alimentos={result.alimentos}
                onConfirm={handleConfirmNutrition}
                onCancel={() => { setShowReview(false); }}
              />
            )}

            <div className="flex gap-2">
              <Button onClick={resetScanner} variant="outline" className="flex-1 gap-2">
                <RotateCcw className="h-4 w-4" />
                {t("scanner.scanAnother")}
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowBarcode(true)}>
                <Barcode className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BarcodeScanner
        isOpen={showBarcode}
        onClose={() => setShowBarcode(false)}
        onProductFound={handleBarcodeProduct}
      />
    </AppLayout>
  );
};

export default Scanner;
