import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Droplets, Utensils, Timer, AlertCircle } from "lucide-react";

const iconMap: Record<string, any> = {
  water: Droplets,
  meal: Utensils,
  fasting: Timer,
};

const intervalOptions = [
  { value: "30", label: { pt: "30 min", en: "30 min" } },
  { value: "60", label: { pt: "1 hora", en: "1 hour" } },
  { value: "90", label: { pt: "1h30", en: "1h30" } },
  { value: "120", label: { pt: "2 horas", en: "2 hours" } },
  { value: "180", label: { pt: "3 horas", en: "3 hours" } },
];

export function ReminderSettings() {
  const { language } = useLanguage();
  const pt = language === "pt";
  const { reminders, isSupported, permission, toggleReminder, updateInterval } = useNotifications();

  const labels: Record<string, { title: string; desc: string }> = {
    water: {
      title: pt ? "Lembrete de água" : "Water reminder",
      desc: pt ? "Receba alertas para beber água" : "Get alerts to drink water",
    },
    meal: {
      title: pt ? "Lembrete de refeição" : "Meal reminder",
      desc: pt ? "Registre suas refeições no horário" : "Log your meals on time",
    },
    fasting: {
      title: pt ? "Alerta de jejum" : "Fasting alert",
      desc: pt ? "Notificação ao fim da janela de jejum" : "Notification at fasting window end",
    },
  };

  if (!isSupported) {
    return (
      <Card className="glass border-border/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            {pt ? "Notificações não suportadas neste navegador" : "Notifications not supported in this browser"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-5 w-5 text-primary" />
          {pt ? "Lembretes" : "Reminders"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "denied" && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded p-2">
            <AlertCircle className="h-4 w-4" />
            {pt
              ? "Notificações bloqueadas. Ative nas configurações do navegador."
              : "Notifications blocked. Enable in browser settings."}
          </div>
        )}

        {reminders.map((reminder) => {
          const Icon = iconMap[reminder.type] || Bell;
          const label = labels[reminder.type];
          return (
            <div key={reminder.id} className="flex items-center gap-3">
              <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{label?.title}</p>
                <p className="text-xs text-muted-foreground">{label?.desc}</p>
              </div>
              {reminder.type !== "fasting" && reminder.enabled && (
                <Select
                  value={String(reminder.intervalMinutes)}
                  onValueChange={(v) => updateInterval(reminder.id, Number(v))}
                >
                  <SelectTrigger className="w-20 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intervalOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {pt ? opt.label.pt : opt.label.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Switch
                checked={reminder.enabled}
                onCheckedChange={() => toggleReminder(reminder.id)}
                disabled={permission === "denied"}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
