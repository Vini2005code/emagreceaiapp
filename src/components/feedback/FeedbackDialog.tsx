import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFeedback } from "@/hooks/useFeedback";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquarePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function FeedbackDialog() {
  const { language } = useLanguage();
  const { submitFeedback, isSubmitting } = useFeedback();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"feedback" | "bug" | "suggestion">("feedback");

  const pt = language === "pt";

  const handleSubmit = async () => {
    if (!message.trim()) return;
    const ok = await submitFeedback(message, type);
    if (ok) {
      toast.success(pt ? "Obrigado pelo seu feedback! 🙏" : "Thanks for your feedback! 🙏");
      setMessage("");
      setOpen(false);
    } else {
      toast.error(pt ? "Erro ao enviar. Tente novamente." : "Error sending. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title={pt ? "Feedback" : "Feedback"}>
          <MessageSquarePlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{pt ? "Enviar Feedback" : "Send Feedback"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={type} onValueChange={(v: "feedback" | "bug" | "suggestion") => setType(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feedback">{pt ? "💬 Feedback geral" : "💬 General feedback"}</SelectItem>
              <SelectItem value="bug">{pt ? "🐛 Reportar bug" : "🐛 Report bug"}</SelectItem>
              <SelectItem value="suggestion">{pt ? "💡 Sugestão" : "💡 Suggestion"}</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={pt ? "Descreva aqui..." : "Describe here..."}
            rows={4}
            maxLength={2000}
          />
          <Button onClick={handleSubmit} disabled={!message.trim() || isSubmitting} className="w-full" variant="cta">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {pt ? "Enviar" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
