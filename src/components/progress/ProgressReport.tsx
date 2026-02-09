import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface ProgressPhoto {
  id: string;
  photo_type: string;
  taken_at: string | null;
  weight: number | null;
  notes: string | null;
}

interface ProgressReportProps {
  photos: ProgressPhoto[];
  photoUrls: Record<string, string>;
}

export function ProgressReport({ photos, photoUrls }: ProgressReportProps) {
  const { language } = useLanguage();
  const pt = language === "pt";
  const { profile } = useUserProfile();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      let y = 15;

      // Header
      doc.setFillColor(34, 197, 94);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.text("Emagrece AI", 15, 15);
      doc.setFontSize(10);
      doc.text(pt ? "Relatório de Progresso" : "Progress Report", 15, 22);
      doc.text(new Date().toLocaleDateString(pt ? "pt-BR" : "en-US"), pageWidth - 15, 22, { align: "right" });

      y = 40;
      doc.setTextColor(0, 0, 0);

      // Profile section
      doc.setFontSize(14);
      doc.text(pt ? "📊 Dados do Perfil" : "📊 Profile Data", 15, y);
      y += 8;
      doc.setFontSize(10);
      
      const profileLines = [
        `${pt ? "Nome" : "Name"}: ${profile.name || "-"}`,
        `${pt ? "Idade" : "Age"}: ${profile.age || "-"} ${pt ? "anos" : "years"}`,
        `${pt ? "Peso atual" : "Current weight"}: ${profile.weight || "-"} kg`,
        `${pt ? "Altura" : "Height"}: ${profile.height || "-"} cm`,
        `${pt ? "Meta de peso" : "Goal weight"}: ${profile.goalWeight || "-"} kg`,
        `${pt ? "Nível de atividade" : "Activity level"}: ${profile.activityLevel || "-"}`,
      ];

      profileLines.forEach(line => {
        doc.text(line, 15, y);
        y += 6;
      });

      y += 5;

      // Weight evolution
      const weightPhotos = photos.filter(p => p.weight).sort((a, b) => 
        new Date(a.taken_at || "").getTime() - new Date(b.taken_at || "").getTime()
      );

      if (weightPhotos.length > 0) {
        doc.setFontSize(14);
        doc.text(pt ? "📈 Evolução de Peso" : "📈 Weight Evolution", 15, y);
        y += 8;
        doc.setFontSize(10);

        weightPhotos.forEach(photo => {
          const date = photo.taken_at ? new Date(photo.taken_at).toLocaleDateString(pt ? "pt-BR" : "en-US") : "-";
          doc.text(`${date}: ${photo.weight} kg`, 20, y);
          y += 6;
          if (y > 270) {
            doc.addPage();
            y = 15;
          }
        });

        // Simple weight chart using lines
        if (weightPhotos.length >= 2) {
          y += 5;
          const chartX = 20;
          const chartW = pageWidth - 40;
          const chartH = 40;
          const weights = weightPhotos.map(p => p.weight!);
          const minW = Math.min(...weights) - 2;
          const maxW = Math.max(...weights) + 2;

          doc.setDrawColor(200, 200, 200);
          doc.rect(chartX, y, chartW, chartH);

          doc.setFontSize(7);
          doc.text(`${maxW}kg`, chartX - 2, y + 3, { align: "right" });
          doc.text(`${minW}kg`, chartX - 2, y + chartH, { align: "right" });

          doc.setDrawColor(34, 197, 94);
          doc.setLineWidth(0.5);
          for (let i = 0; i < weights.length - 1; i++) {
            const x1 = chartX + (i / (weights.length - 1)) * chartW;
            const x2 = chartX + ((i + 1) / (weights.length - 1)) * chartW;
            const y1 = y + chartH - ((weights[i] - minW) / (maxW - minW)) * chartH;
            const y2 = y + chartH - ((weights[i + 1] - minW) / (maxW - minW)) * chartH;
            doc.line(x1, y1, x2, y2);
          }
          y += chartH + 10;
        }
      }

      // Before/After comparison
      const beforePhotos = photos.filter(p => p.photo_type === "before");
      const afterPhotos = photos.filter(p => p.photo_type === "after");

      if (beforePhotos.length > 0 && afterPhotos.length > 0 && y < 200) {
        doc.setFontSize(14);
        doc.text(pt ? "📸 Antes e Depois" : "📸 Before & After", 15, y);
        y += 8;
        doc.setFontSize(10);

        const loadImage = async (url: string): Promise<string | null> => {
          try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(blob);
            });
          } catch {
            return null;
          }
        };

        const beforeUrl = photoUrls[beforePhotos[0].id];
        const afterUrl = photoUrls[afterPhotos[afterPhotos.length - 1].id];

        if (beforeUrl && afterUrl) {
          const [beforeImg, afterImg] = await Promise.all([
            loadImage(beforeUrl),
            loadImage(afterUrl),
          ]);

          const imgW = (pageWidth - 45) / 2;
          const imgH = imgW * 1.33;

          if (beforeImg) {
            doc.text(pt ? "Antes" : "Before", 15, y);
            y += 3;
            try { doc.addImage(beforeImg, "JPEG", 15, y, imgW, imgH); } catch { /* skip */ }
          }
          if (afterImg) {
            doc.text(pt ? "Depois" : "After", 15 + imgW + 15, y - 3);
            try { doc.addImage(afterImg, "JPEG", 15 + imgW + 15, y, imgW, imgH); } catch { /* skip */ }
          }
        }
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          pt
            ? "⚠️ Este relatório é gerado automaticamente e não substitui acompanhamento médico profissional."
            : "⚠️ This report is auto-generated and does not replace professional medical guidance.",
          pageWidth / 2,
          290,
          { align: "center" }
        );
      }

      doc.save(`emagrece-ai-report-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success(pt ? "Relatório gerado com sucesso!" : "Report generated successfully!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error(pt ? "Erro ao gerar relatório" : "Error generating report");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button variant="outline" onClick={generatePDF} disabled={isGenerating} className="gap-2">
      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      {pt ? "Exportar PDF" : "Export PDF"}
    </Button>
  );
}
