import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Flame, Beef, Wheat, Droplet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NutritionInfo } from "@/types/app";

const Scanner = () => {
  const { t } = useLanguage();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setNutritionInfo(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const analyzeImage = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyzeImage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.isFood) {
        setError("A imagem enviada não parece ser um alimento.");
        setNutritionInfo(null);
        return;
      }

      setNutritionInfo(data.nutrition);
    } catch (err) {
      console.error(err);
      setError("Erro ao analisar a imagem. Tente novamente.");
      setNutritionInfo(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImagePreview(null);
    setFile(null);
    setNutritionInfo(null);
    setError(null);
  };

  const nutritionItems = nutritionInfo
    ? [
        { icon: Flame, label: t("scanner.calories"), value: nutritionInfo.calories, unit: "kcal" },
        { icon: Beef, label: t("scanner.protein"), value: nutritionInfo.protein, unit: "g" },
        { icon: Wheat, label: t("scanner.carbs"), value: nutritionInfo.carbs, unit: "g" },
        { icon: Droplet, label: t("scanner.fat"), value: nutritionInfo.fat, unit: "g" },
      ]
    : [];

  return (
    <AppLayout title={t("scanner.title")} subtitle={t("scanner.subtitle")}>
      <AnimatePresence mode="wait">
        {!imagePreview ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Camera className="mx-auto h-12 w-12" />
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("scanner.uploadPhoto")}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card>
              <img src={imagePreview} className="w-full object-cover rounded" />

              {isAnalyzing && (
                <div className="p-4 text-center">
                  <Loader2 className="animate-spin mx-auto mb-2" />
                  <p>{t("scanner.analyzing")}</p>
                </div>
              )}
            </Card>

            {!isAnalyzing && !nutritionInfo && !error && (
              <Button onClick={analyzeImage} className="w-full">
                Analisar imagem
              </Button>
            )}

            {error && (
              <Card className="border-destructive">
                <CardContent className="p-4 text-center text-destructive">
                  {error}
                </CardContent>
              </Card>
            )}

            {nutritionInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("scanner.nutritionInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  {nutritionItems.map((item) => (
                    <div key={item.label} className="text-center">
                      <item.icon className="mx-auto mb-1" />
                      <p className="font-bold">
                        {item.value}
                        {item.unit}
                      </p>
                      <p className="text-sm">{item.label}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Button onClick={resetScanner} className="w-full" variant="outline">
              {t("scanner.analyzeAnother")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Scanner;
