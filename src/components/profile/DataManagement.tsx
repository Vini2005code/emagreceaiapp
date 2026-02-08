import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Download, Trash2, AlertTriangle, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function DataManagement() {
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const pt = language === "pt";

  const handleExport = async () => {
    if (!user) return;
    setIsExporting(true);
    try {
      const [profileRes, photosRes, feedbackRes, consentsRes, usageRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("progress_photos").select("*").eq("user_id", user.id),
        supabase.from("user_feedback").select("*").eq("user_id", user.id),
        supabase.from("consent_records").select("*").eq("user_id", user.id),
        supabase.from("ai_usage_logs").select("*").eq("user_id", user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        profile: profileRes.data,
        progress_photos: photosRes.data,
        feedback: feedbackRes.data,
        consent_records: consentsRes.data,
        ai_usage_logs: usageRes.data,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `emagrece-ai-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(pt ? "Dados exportados com sucesso!" : "Data exported successfully!");
    } catch {
      toast.error(pt ? "Erro ao exportar dados" : "Error exporting data");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETAR" || !user) return;
    setIsDeleting(true);
    try {
      // Delete all user data from all tables
      await Promise.all([
        supabase.from("progress_photos").delete().eq("user_id", user.id),
        supabase.from("analytics_events").delete().eq("user_id", user.id),
        supabase.from("ai_usage_logs").delete().eq("user_id", user.id),
        supabase.from("user_feedback").delete().eq("user_id", user.id),
        supabase.from("consent_records").delete().eq("user_id", user.id),
        supabase.from("user_subscriptions").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("user_id", user.id),
      ]);

      await signOut();
      toast.success(pt ? "Conta e dados excluídos permanentemente" : "Account and data permanently deleted");
      navigate("/auth");
    } catch {
      toast.error(pt ? "Erro ao excluir conta" : "Error deleting account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Shield className="h-5 w-5 text-primary" />
            {pt ? "Privacidade e Dados (LGPD)" : "Privacy & Data (LGPD)"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {pt ? "Exportar meus dados" : "Export my data"}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {pt ? "Excluir minha conta e dados" : "Delete my account and data"}
          </Button>

          <div className="flex gap-2 pt-2">
            <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => navigate("/privacy")}>
              {pt ? "Política de Privacidade" : "Privacy Policy"}
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => navigate("/terms")}>
              {pt ? "Termos de Uso" : "Terms of Use"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {pt ? "Excluir Conta Permanentemente" : "Permanently Delete Account"}
            </DialogTitle>
            <DialogDescription>
              {pt ? "Esta ação é irreversível." : "This action is irreversible."}
            </DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              {pt
                ? "Todos os seus dados serão permanentemente excluídos: perfil, fotos, histórico de uso, feedbacks e consentimentos. Esta ação NÃO pode ser desfeita."
                : "All your data will be permanently deleted: profile, photos, usage history, feedback, and consents. This action CANNOT be undone."}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            {pt ? 'Digite "DELETAR" para confirmar:' : 'Type "DELETAR" to confirm:'}
          </p>
          <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="DELETAR" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>{pt ? "Cancelar" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deleteConfirm !== "DELETAR" || isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {pt ? "Excluir Tudo" : "Delete Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
