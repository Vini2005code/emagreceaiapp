 import { useState } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import { Plus, X, AlertTriangle, Heart, Ban } from "lucide-react";
 import { motion, AnimatePresence } from "framer-motion";
 import { useLanguage } from "@/contexts/LanguageContext";
 
 interface RecipePreferencesProps {
   preferences: string[];
   restrictions: string[];
   excludeIngredients: string[];
   onPreferencesChange: (preferences: string[]) => void;
   onRestrictionsChange: (restrictions: string[]) => void;
   onExcludeChange: (exclude: string[]) => void;
   disabled?: boolean;
 }
 
 export function RecipePreferences({
   preferences,
   restrictions,
   excludeIngredients,
   onPreferencesChange,
   onRestrictionsChange,
   onExcludeChange,
   disabled,
 }: RecipePreferencesProps) {
   const { language } = useLanguage();
   const [prefInput, setPrefInput] = useState("");
   const [restrictInput, setRestrictInput] = useState("");
   const [excludeInput, setExcludeInput] = useState("");
 
   const addItem = (
     value: string,
     list: string[],
     setter: (items: string[]) => void,
     inputSetter: (val: string) => void
   ) => {
     const trimmed = value.trim().toLowerCase();
     if (trimmed && !list.includes(trimmed)) {
       setter([...list, trimmed]);
       inputSetter("");
     }
   };
 
   const removeItem = (item: string, list: string[], setter: (items: string[]) => void) => {
     setter(list.filter((i) => i !== item));
   };
 
   const commonRestrictions = [
     { pt: "Sem glúten", en: "Gluten-free" },
     { pt: "Sem lactose", en: "Lactose-free" },
     { pt: "Vegetariano", en: "Vegetarian" },
     { pt: "Vegano", en: "Vegan" },
     { pt: "Low carb", en: "Low carb" },
   ];
 
   return (
     <div className="space-y-4">
       {/* Restrictions */}
       <Card variant="gradient" className="border-destructive/30">
         <CardHeader className="pb-2">
           <CardTitle className="text-sm flex items-center gap-2">
             <AlertTriangle className="h-4 w-4 text-destructive" />
             {language === "pt" ? "Restrições Alimentares" : "Dietary Restrictions"}
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           <div className="flex flex-wrap gap-2">
             {commonRestrictions.map((item) => {
               const label = item[language];
               const isActive = restrictions.includes(label.toLowerCase());
               return (
                 <Badge
                   key={label}
                   variant={isActive ? "destructive" : "outline"}
                   className="cursor-pointer"
                   onClick={() => {
                     if (!disabled) {
                       if (isActive) {
                         removeItem(label.toLowerCase(), restrictions, onRestrictionsChange);
                       } else {
                         onRestrictionsChange([...restrictions, label.toLowerCase()]);
                       }
                     }
                   }}
                 >
                   {label}
                 </Badge>
               );
             })}
           </div>
           <div className="flex gap-2">
             <Input
               placeholder={language === "pt" ? "Adicionar outra..." : "Add another..."}
               value={restrictInput}
               onChange={(e) => setRestrictInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && addItem(restrictInput, restrictions, onRestrictionsChange, setRestrictInput)}
               disabled={disabled}
               className="text-sm"
             />
             <Button
               size="icon"
               variant="outline"
               onClick={() => addItem(restrictInput, restrictions, onRestrictionsChange, setRestrictInput)}
               disabled={disabled || !restrictInput.trim()}
             >
               <Plus className="h-4 w-4" />
             </Button>
           </div>
           <AnimatePresence>
             {restrictions.filter(r => !commonRestrictions.some(c => c[language].toLowerCase() === r)).length > 0 && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-wrap gap-1"
               >
                 {restrictions
                   .filter(r => !commonRestrictions.some(c => c[language].toLowerCase() === r))
                   .map((item) => (
                     <Badge key={item} variant="destructive" className="text-xs">
                       {item}
                       <button
                         onClick={() => removeItem(item, restrictions, onRestrictionsChange)}
                         className="ml-1 hover:bg-background/20 rounded-full"
                         disabled={disabled}
                       >
                         <X className="h-3 w-3" />
                       </button>
                     </Badge>
                   ))}
               </motion.div>
             )}
           </AnimatePresence>
         </CardContent>
       </Card>
 
       {/* Exclude Ingredients (tired of these) */}
       <Card variant="gradient" className="border-yellow-500/30">
         <CardHeader className="pb-2">
           <CardTitle className="text-sm flex items-center gap-2">
             <Ban className="h-4 w-4 text-yellow-500" />
             {language === "pt" ? "Ingredientes para Excluir (cansado destes)" : "Exclude Ingredients (tired of these)"}
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           <div className="flex gap-2">
             <Input
               placeholder={language === "pt" ? "Ex: ovo, frango..." : "e.g., eggs, chicken..."}
               value={excludeInput}
               onChange={(e) => setExcludeInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && addItem(excludeInput, excludeIngredients, onExcludeChange, setExcludeInput)}
               disabled={disabled}
               className="text-sm"
             />
             <Button
               size="icon"
               variant="outline"
               onClick={() => addItem(excludeInput, excludeIngredients, onExcludeChange, setExcludeInput)}
               disabled={disabled || !excludeInput.trim()}
             >
               <Plus className="h-4 w-4" />
             </Button>
           </div>
           <AnimatePresence>
             {excludeIngredients.length > 0 && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-wrap gap-1"
               >
                 {excludeIngredients.map((item) => (
                   <Badge key={item} className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                     {item}
                     <button
                       onClick={() => removeItem(item, excludeIngredients, onExcludeChange)}
                       className="ml-1 hover:bg-background/20 rounded-full"
                       disabled={disabled}
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </Badge>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
         </CardContent>
       </Card>
 
       {/* Preferences */}
       <Card variant="gradient" className="border-primary/30">
         <CardHeader className="pb-2">
           <CardTitle className="text-sm flex items-center gap-2">
             <Heart className="h-4 w-4 text-primary" />
             {language === "pt" ? "Preferências" : "Preferences"}
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-3">
           <div className="flex gap-2">
             <Input
               placeholder={language === "pt" ? "Ex: comida mexicana, doces..." : "e.g., mexican food, sweets..."}
               value={prefInput}
               onChange={(e) => setPrefInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && addItem(prefInput, preferences, onPreferencesChange, setPrefInput)}
               disabled={disabled}
               className="text-sm"
             />
             <Button
               size="icon"
               variant="outline"
               onClick={() => addItem(prefInput, preferences, onPreferencesChange, setPrefInput)}
               disabled={disabled || !prefInput.trim()}
             >
               <Plus className="h-4 w-4" />
             </Button>
           </div>
           <AnimatePresence>
             {preferences.length > 0 && (
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex flex-wrap gap-1"
               >
                 {preferences.map((item) => (
                   <Badge key={item} variant="secondary" className="text-xs">
                     {item}
                     <button
                       onClick={() => removeItem(item, preferences, onPreferencesChange)}
                       className="ml-1 hover:bg-background/20 rounded-full"
                       disabled={disabled}
                     >
                       <X className="h-3 w-3" />
                     </button>
                   </Badge>
                 ))}
               </motion.div>
             )}
           </AnimatePresence>
         </CardContent>
       </Card>
     </div>
   );
 }