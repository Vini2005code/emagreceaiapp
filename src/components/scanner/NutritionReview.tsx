import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle2, Edit3, Save, X } from "lucide-react";
import { motion } from "framer-motion";

interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface FoodItem {
  item: string;
  porcao_estimada: string;
  calorias: number;
  macros: { p: number; c: number; g: number };
}

interface NutritionReviewProps {
  nutrition: NutritionData;
  alimentos?: FoodItem[];
  onConfirm: (nutrition: NutritionData, alimentos?: FoodItem[]) => void;
  onCancel: () => void;
}

export function NutritionReview({ nutrition, alimentos, onConfirm, onCancel }: NutritionReviewProps) {
  const { language } = useLanguage();
  const pt = language === "pt";

  const [editedNutrition, setEditedNutrition] = useState<NutritionData>({ ...nutrition });
  const [editedAlimentos, setEditedAlimentos] = useState<FoodItem[]>(alimentos ? [...alimentos] : []);
  const [isEditing, setIsEditing] = useState(false);

  const handleNutritionChange = (field: keyof NutritionData, value: string) => {
    setEditedNutrition(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleAlimentoChange = (index: number, field: string, value: string) => {
    setEditedAlimentos(prev => {
      const updated = [...prev];
      if (field === "item" || field === "porcao_estimada") {
        updated[index] = { ...updated[index], [field]: value };
      } else if (field === "calorias") {
        updated[index] = { ...updated[index], calorias: Number(value) || 0 };
      }
      return updated;
    });
  };

  const removeAlimento = (index: number) => {
    setEditedAlimentos(prev => prev.filter((_, i) => i !== index));
  };

  const fields = [
    { key: "calories" as const, label: pt ? "Calorias (kcal)" : "Calories (kcal)" },
    { key: "protein" as const, label: pt ? "Proteína (g)" : "Protein (g)" },
    { key: "carbs" as const, label: pt ? "Carboidratos (g)" : "Carbs (g)" },
    { key: "fat" as const, label: pt ? "Gordura (g)" : "Fat (g)" },
    { key: "fiber" as const, label: pt ? "Fibra (g)" : "Fiber (g)" },
    { key: "sugar" as const, label: pt ? "Açúcar (g)" : "Sugar (g)" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              {pt ? "📝 Revise os valores antes de salvar" : "📝 Review values before saving"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              {isEditing ? (pt ? "Pronto" : "Done") : (pt ? "Editar" : "Edit")}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {pt
              ? "Os valores abaixo foram estimados pela IA. Você pode editá-los para maior precisão."
              : "Values below were estimated by AI. You can edit them for better accuracy."}
          </p>

          {/* Nutrition fields */}
          <div className="grid grid-cols-2 gap-2">
            {fields.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label}</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedNutrition[key] ?? ""}
                    onChange={(e) => handleNutritionChange(key, e.target.value)}
                    className="h-8 text-sm"
                    min={0}
                  />
                ) : (
                  <p className="text-sm font-medium text-foreground px-3 py-1.5 bg-muted/50 rounded-md">
                    {editedNutrition[key] ?? 0}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Alimentos list */}
          {editedAlimentos.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                {pt ? "Ingredientes detectados:" : "Detected ingredients:"}
              </p>
              {editedAlimentos.map((alimento, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs bg-muted/30 rounded p-2">
                  {isEditing ? (
                    <>
                      <Input
                        value={alimento.item}
                        onChange={(e) => handleAlimentoChange(idx, "item", e.target.value)}
                        className="h-7 text-xs flex-1"
                      />
                      <Input
                        value={alimento.porcao_estimada}
                        onChange={(e) => handleAlimentoChange(idx, "porcao_estimada", e.target.value)}
                        className="h-7 text-xs w-20"
                      />
                      <Input
                        type="number"
                        value={alimento.calorias}
                        onChange={(e) => handleAlimentoChange(idx, "calorias", e.target.value)}
                        className="h-7 text-xs w-16"
                        min={0}
                      />
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeAlimento(idx)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-foreground flex-1">{alimento.item}</span>
                      <span className="text-muted-foreground">
                        {alimento.porcao_estimada} • {alimento.calorias} kcal
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              {pt ? "Descartar" : "Discard"}
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onConfirm(editedNutrition, editedAlimentos)}>
              <Save className="h-4 w-4 mr-1" />
              {pt ? "Salvar Registro" : "Save Record"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
