 import { useState } from "react";
 import { Card, CardContent } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { Clock, Flame, ChevronDown, ChevronUp, ArrowRightLeft, Lightbulb } from "lucide-react";
 import { motion } from "framer-motion";
 import { useLanguage } from "@/contexts/LanguageContext";
 import type { GeneratedRecipe } from "@/hooks/useRecipeGenerator";
 
 interface RecipeCardProps {
   recipe: GeneratedRecipe;
   index: number;
 }
 
 const difficultyColors = {
   easy: "bg-green-500/20 text-green-400 border-green-500/30",
   medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
   hard: "bg-red-500/20 text-red-400 border-red-500/30",
 };
 
 const difficultyLabels = {
   easy: { pt: "Fácil", en: "Easy" },
   medium: { pt: "Médio", en: "Medium" },
   hard: { pt: "Difícil", en: "Hard" },
 };
 
 export function RecipeCard({ recipe, index }: RecipeCardProps) {
   const { language, t } = useLanguage();
   const [isOpen, setIsOpen] = useState(false);
 
   return (
     <motion.div
       initial={{ opacity: 0, y: 20 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: index * 0.1 }}
     >
       <Card variant="interactive" className="overflow-hidden">
         <CardContent className="p-4 space-y-4">
           {/* Header */}
           <div>
             <div className="flex items-start justify-between gap-2 mb-2">
               <h4 className="font-bold text-lg text-foreground leading-tight">
                 {recipe.name}
               </h4>
               <Badge className={difficultyColors[recipe.difficulty]}>
                 {difficultyLabels[recipe.difficulty][language]}
               </Badge>
             </div>
             <p className="text-sm text-muted-foreground">{recipe.description}</p>
           </div>
 
           {/* Quick Info */}
           <div className="flex flex-wrap gap-3 text-sm">
             <span className="flex items-center gap-1 text-muted-foreground">
               <Clock className="h-4 w-4" />
               {recipe.prepTime} {language === "pt" ? "min" : "min"}
             </span>
             <span className="flex items-center gap-1 text-accent font-medium">
               <Flame className="h-4 w-4" />
               {recipe.nutrition.calories} kcal
             </span>
           </div>
 
           {/* Nutrition */}
           <div className="grid grid-cols-4 gap-2 p-3 bg-muted/50 rounded-lg text-center text-xs">
             <div>
               <div className="font-bold text-primary">{recipe.nutrition.protein}g</div>
               <div className="text-muted-foreground">{t("diet.protein")}</div>
             </div>
             <div>
               <div className="font-bold text-accent">{recipe.nutrition.carbs}g</div>
               <div className="text-muted-foreground">{t("diet.carbs")}</div>
             </div>
             <div>
               <div className="font-bold text-yellow-500">{recipe.nutrition.fat}g</div>
               <div className="text-muted-foreground">{t("diet.fat")}</div>
             </div>
             <div>
               <div className="font-bold text-green-500">{recipe.nutrition.fiber}g</div>
               <div className="text-muted-foreground">{language === "pt" ? "Fibras" : "Fiber"}</div>
             </div>
           </div>
 
           {/* Expandable Content */}
           <Collapsible open={isOpen} onOpenChange={setIsOpen}>
             <CollapsibleTrigger asChild>
               <Button variant="ghost" size="sm" className="w-full">
                 {isOpen ? (
                   <>
                     <ChevronUp className="h-4 w-4 mr-2" />
                     {language === "pt" ? "Ver menos" : "Show less"}
                   </>
                 ) : (
                   <>
                     <ChevronDown className="h-4 w-4 mr-2" />
                     {language === "pt" ? "Ver receita completa" : "Show full recipe"}
                   </>
                 )}
               </Button>
             </CollapsibleTrigger>
 
             <CollapsibleContent className="space-y-4 pt-4">
               {/* Ingredients */}
               <div>
                 <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                   {t("recipes.ingredients")}
                 </h5>
                 <ul className="space-y-1">
                   {recipe.ingredients.map((ing, i) => (
                     <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                       <span className="text-primary">•</span>
                       <span>
                         <span className="font-medium text-foreground">{ing.amount} {ing.unit}</span>{" "}
                         {ing.name}
                       </span>
                     </li>
                   ))}
                 </ul>
               </div>
 
               {/* Instructions */}
               <div>
                 <h5 className="font-semibold text-foreground mb-2">
                   {t("recipes.howTo")}
                 </h5>
                 <ol className="space-y-2">
                   {recipe.instructions.map((step, i) => (
                     <li key={i} className="text-sm text-muted-foreground flex gap-2">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                         {i + 1}
                       </span>
                       <span className="pt-0.5">{step}</span>
                     </li>
                   ))}
                 </ol>
               </div>
 
               {/* Substitutions */}
               {recipe.substitutions && recipe.substitutions.length > 0 && (
                 <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                   <h5 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
                     <ArrowRightLeft className="h-4 w-4 text-blue-400" />
                     {language === "pt" ? "Substituições" : "Substitutions"}
                   </h5>
                   <ul className="space-y-1">
                     {recipe.substitutions.map((sub, i) => (
                       <li key={i} className="text-xs text-muted-foreground">
                         <span className="font-medium text-foreground">{sub.original}</span>
                         {" → "}
                         <span className="text-blue-400">{sub.substitute}</span>
                         {sub.reason && (
                           <span className="text-muted-foreground"> ({sub.reason})</span>
                         )}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
 
               {/* Tips */}
               {recipe.tips && (
                 <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                   <div className="flex items-start gap-2">
                     <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                     <p className="text-xs text-muted-foreground">{recipe.tips}</p>
                   </div>
                 </div>
               )}
             </CollapsibleContent>
           </Collapsible>
         </CardContent>
       </Card>
     </motion.div>
   );
 }