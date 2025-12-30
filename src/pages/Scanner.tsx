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
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/analyzeImage", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data?.isFood && data.nutrition) {
        setNutritionInfo(data.nutrition);
      } else {
        alert("A imagem enviada não parece ser um alimento.");
        setNutritionInfo(null);
      }
    } catch (error) {
      alert("Erro ao analisar imagem.");
      setNutritionInfo(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetScanner = () => {
    setImage(null);
    setNutritionInfo(null);
  };
