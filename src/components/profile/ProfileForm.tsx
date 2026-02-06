import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserProfile } from "@/hooks/useUserProfile";
import { useLanguage } from "@/contexts/LanguageContext";
import { User, Scale, Ruler, Target, Activity, Dumbbell, Heart, Apple, Clock, X, Plus } from "lucide-react";
import { useState } from "react";

interface ProfileFormProps {
  formData: UserProfile;
  onChange: (data: UserProfile) => void;
  onSave: () => void;
}

export const ProfileForm = ({ formData, onChange, onSave }: ProfileFormProps) => {
  const { t, language } = useLanguage();
  const [newPreference, setNewPreference] = useState("");
  const [newLimitation, setNewLimitation] = useState("");

  const addPreference = () => {
    if (newPreference.trim() && !formData.foodPreferences.includes(newPreference.trim())) {
      onChange({ ...formData, foodPreferences: [...formData.foodPreferences, newPreference.trim()] });
      setNewPreference("");
    }
  };

  const removePreference = (pref: string) => {
    onChange({ ...formData, foodPreferences: formData.foodPreferences.filter(p => p !== pref) });
  };

  const addLimitation = () => {
    if (newLimitation.trim() && !formData.medicalLimitations.includes(newLimitation.trim())) {
      onChange({ ...formData, medicalLimitations: [...formData.medicalLimitations, newLimitation.trim()] });
      setNewLimitation("");
    }
  };

  const removeLimitation = (lim: string) => {
    onChange({ ...formData, medicalLimitations: formData.medicalLimitations.filter(l => l !== lim) });
  };

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <User className="h-5 w-5 text-primary" />
          {t("profile.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">{t("profile.name")}</Label>
            <Input id="name" value={formData.name} onChange={(e) => onChange({ ...formData, name: e.target.value })} className="bg-background/50" />
          </div>
          
          <div>
            <Label htmlFor="age">{t("profile.age")}</Label>
            <Input id="age" type="number" value={formData.age} onChange={(e) => onChange({ ...formData, age: parseInt(e.target.value) || 0 })} className="bg-background/50" />
          </div>

          <div>
            <Label htmlFor="gender">{t("profile.gender")}</Label>
            <Select value={formData.gender} onValueChange={(value: "male" | "female") => onChange({ ...formData, gender: value })}>
              <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">{t("profile.male")}</SelectItem>
                <SelectItem value="female">{t("profile.female")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="weight" className="flex items-center gap-1"><Scale className="h-3 w-3" />{t("profile.weight")}</Label>
            <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={(e) => onChange({ ...formData, weight: parseFloat(e.target.value) || 0 })} className="bg-background/50" />
          </div>

          <div>
            <Label htmlFor="height" className="flex items-center gap-1"><Ruler className="h-3 w-3" />{t("profile.height")}</Label>
            <Input id="height" type="number" value={formData.height} onChange={(e) => onChange({ ...formData, height: parseInt(e.target.value) || 0 })} className="bg-background/50" />
          </div>

          <div>
            <Label htmlFor="goalWeight" className="flex items-center gap-1"><Target className="h-3 w-3" />{t("profile.goalWeight")}</Label>
            <Input id="goalWeight" type="number" step="0.1" value={formData.goalWeight} onChange={(e) => onChange({ ...formData, goalWeight: parseFloat(e.target.value) || 0 })} className="bg-background/50" />
          </div>

          <div>
            <Label htmlFor="activityLevel" className="flex items-center gap-1"><Activity className="h-3 w-3" />{t("profile.activityLevel")}</Label>
            <Select value={formData.activityLevel} onValueChange={(value: UserProfile["activityLevel"]) => onChange({ ...formData, activityLevel: value })}>
              <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">{t("profile.sedentary")}</SelectItem>
                <SelectItem value="light">{t("profile.light")}</SelectItem>
                <SelectItem value="moderate">{t("profile.moderate")}</SelectItem>
                <SelectItem value="active">{t("profile.active")}</SelectItem>
                <SelectItem value="veryActive">{t("profile.veryActive")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="bodyType" className="flex items-center gap-1"><Dumbbell className="h-3 w-3" />{t("profile.bodyType")}</Label>
            <Select value={formData.bodyType} onValueChange={(value: UserProfile["bodyType"]) => onChange({ ...formData, bodyType: value })}>
              <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ectomorph">{t("profile.ectomorph")}</SelectItem>
                <SelectItem value="mesomorph">{t("profile.mesomorph")}</SelectItem>
                <SelectItem value="endomorph">{t("profile.endomorph")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <Label className="flex items-center gap-1"><Clock className="h-3 w-3" />{language === "pt" ? "Rotina Diária" : "Daily Routine"}</Label>
            <Select value={formData.dailyRoutine} onValueChange={(value: UserProfile["dailyRoutine"]) => onChange({ ...formData, dailyRoutine: value })}>
              <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">{language === "pt" ? "Horário comercial (8h-18h)" : "Regular hours (8am-6pm)"}</SelectItem>
                <SelectItem value="shift">{language === "pt" ? "Trabalho por turnos" : "Shift work"}</SelectItem>
                <SelectItem value="nocturnal">{language === "pt" ? "Rotina noturna" : "Night shift"}</SelectItem>
                <SelectItem value="irregular">{language === "pt" ? "Horários irregulares" : "Irregular hours"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Food Preferences */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Apple className="h-3 w-3" />{language === "pt" ? "Preferências Alimentares" : "Food Preferences"}</Label>
          <div className="flex gap-2">
            <Input
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addPreference())}
              placeholder={language === "pt" ? "Ex: vegetariano, sem glúten..." : "E.g.: vegetarian, gluten-free..."}
              className="bg-background/50 flex-1"
            />
            <Button type="button" size="icon" variant="outline" onClick={addPreference}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {formData.foodPreferences.map((pref) => (
              <Badge key={pref} variant="secondary" className="flex items-center gap-1">
                {pref}
                <button onClick={() => removePreference(pref)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Medical Limitations */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Heart className="h-3 w-3" />{language === "pt" ? "Limitações Médicas" : "Medical Limitations"}</Label>
          <div className="flex gap-2">
            <Input
              value={newLimitation}
              onChange={(e) => setNewLimitation(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLimitation())}
              placeholder={language === "pt" ? "Ex: diabetes, hipertensão..." : "E.g.: diabetes, hypertension..."}
              className="bg-background/50 flex-1"
            />
            <Button type="button" size="icon" variant="outline" onClick={addLimitation}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {formData.medicalLimitations.map((lim) => (
              <Badge key={lim} variant="destructive" className="flex items-center gap-1">
                {lim}
                <button onClick={() => removeLimitation(lim)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        </div>

        <Button onClick={onSave} className="w-full gradient-primary text-primary-foreground">
          {t("profile.save")}
        </Button>
      </CardContent>
    </Card>
  );
};
