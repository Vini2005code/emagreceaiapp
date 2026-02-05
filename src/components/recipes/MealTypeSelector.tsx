 import { Button } from "@/components/ui/button";
 import { Card, CardContent } from "@/components/ui/card";
 import { Coffee, UtensilsCrossed, Moon, Apple } from "lucide-react";
 import { motion } from "framer-motion";
 import { useLanguage } from "@/contexts/LanguageContext";
 import type { MealType } from "@/hooks/useRecipeGenerator";
 
 interface MealTypeSelectorProps {
   selected: MealType | null;
   onSelect: (type: MealType) => void;
   disabled?: boolean;
 }
 
 const mealTypes: { type: MealType; icon: typeof Coffee; labelPt: string; labelEn: string }[] = [
   { type: "breakfast", icon: Coffee, labelPt: "Café da manhã", labelEn: "Breakfast" },
   { type: "lunch", icon: UtensilsCrossed, labelPt: "Almoço", labelEn: "Lunch" },
   { type: "dinner", icon: Moon, labelPt: "Jantar", labelEn: "Dinner" },
   { type: "snack", icon: Apple, labelPt: "Lanche", labelEn: "Snack" },
 ];
 
 export function MealTypeSelector({ selected, onSelect, disabled }: MealTypeSelectorProps) {
   const { language } = useLanguage();
 
   return (
     <div className="grid grid-cols-2 gap-3">
       {mealTypes.map(({ type, icon: Icon, labelPt, labelEn }, index) => (
         <motion.div
           key={type}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: index * 0.05 }}
         >
           <Card
             variant={selected === type ? "gradient" : "interactive"}
             className={`cursor-pointer transition-all ${
               selected === type ? "ring-2 ring-primary" : ""
             } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
             onClick={() => !disabled && onSelect(type)}
           >
             <CardContent className="p-4 flex flex-col items-center gap-2">
               <div className={`p-3 rounded-full ${selected === type ? "bg-primary/20" : "bg-muted"}`}>
                 <Icon className={`h-5 w-5 ${selected === type ? "text-primary" : "text-muted-foreground"}`} />
               </div>
               <span className={`text-sm font-medium ${selected === type ? "text-foreground" : "text-muted-foreground"}`}>
                 {language === "pt" ? labelPt : labelEn}
               </span>
             </CardContent>
           </Card>
         </motion.div>
       ))}
     </div>
   );
 }