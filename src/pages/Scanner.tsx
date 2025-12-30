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
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionInfo, setNutritionInfo] = useState<NutritionInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

const analyzeImage = async () => {
  if (!image) return;

  setIsAnalyzing(true);

  try {
    const response = await fetch("/api/analyzeImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image }),
    });

    const data = await response.json();

    setNutritionInfo(data);
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
  } finally {
    setIsAnalyzing(false);
  }
};


  const resetScanner = () => {
    setImage(null);
    setNutritionInfo(null);
  };

  const nutritionItems = nutritionInfo
    ? [
        { icon: Flame, label: t("scanner.calories"), value: `${nutritionInfo.calories}`, unit: "kcal", color: "text-accent" },
        { icon: Beef, label: t("scanner.protein"), value: `${nutritionInfo.protein}`, unit: "g", color: "text-primary" },
        { icon: Wheat, label: t("scanner.carbs"), value: `${nutritionInfo.carbs}`, unit: "g", color: "text-warning" },
        { icon: Droplet, label: t("scanner.fat"), value: `${nutritionInfo.fat}`, unit: "g", color: "text-destructive" },
      ]
    : [];

  return (
    <AppLayout title={t("scanner.title")} subtitle={t("scanner.subtitle")}>
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {!image ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card variant="outline" className="border-dashed border-2">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                  <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-glow">
                    <Camera className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground">
                    {t("scanner.takePhoto")}
                  </h3>
                  <p className="text-muted-foreground text-center mb-6 max-w-xs">
                    {t("scanner.aiAnalyze")}
                  </p>
                  <div className="flex gap-3">
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Upload className="mr-2 h-5 w-5" />
                      {t("scanner.uploadPhoto")}
                    </Button>
                    <Button variant="outline">
                      <Camera className="mr-2 h-5 w-5" />
                      {t("scanner.camera")}
                    </Button>
                  </div>
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
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card variant="elevated" className="overflow-hidden">
                <div className="relative aspect-video">
                  <img
                    src={image}
                    alt={t("scanner.title")}
                    className="w-full h-full object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-3" />
                        <p className="font-semibold text-foreground">{t("scanner.analyzing")}</p>
                        <p className="text-sm text-muted-foreground">{t("scanner.aiWorking")}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {nutritionInfo && (
                <Card variant="gradient">
                  <CardHeader>
                    <CardTitle className="text-center">
                      {t("scanner.nutritionInfo")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {nutritionItems.map((item, index) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-secondary/50 rounded-xl p-4 text-center"
                        >
                          <item.icon className={`h-6 w-6 ${item.color} mx-auto mb-2`} />
                          <p className="text-2xl font-bold text-foreground">
                            {item.value}
                            <span className="text-sm text-muted-foreground ml-1">
                              {item.unit}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-primary/10 rounded-xl">
                      <p className="text-sm text-center text-foreground">
                        <span className="font-semibold">{t("scanner.fiber")}:</span> {nutritionInfo.fiber}g •{" "}
                        <span className="font-semibold">{t("scanner.sugar")}:</span> {nutritionInfo.sugar}g
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button variant="outline" onClick={resetScanner} className="w-full">
                {t("scanner.analyzeAnother")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Scanner;
