import React, { useState, useEffect } from "react";
import { Trash2, ZoomIn, Calendar, Scale, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProgressPhoto } from "@/hooks/useProgressPhotos";

interface PhotoCardProps {
  photo: ProgressPhoto;
  imageUrl: string | null;
  onDelete: (id: string, imagePath: string) => void;
  onSelect?: (photo: ProgressPhoto) => void;
  isSelected?: boolean;
}

export function PhotoCard({ photo, imageUrl, onDelete, onSelect, isSelected }: PhotoCardProps) {
  const { language } = useLanguage();
  const [isZoomed, setIsZoomed] = useState(false);
  const locale = language === "pt" ? ptBR : enUS;

  const t = {
    before: language === "pt" ? "Antes" : "Before",
    after: language === "pt" ? "Depois" : "After",
    progress: language === "pt" ? "Progresso" : "Progress",
    deleteTitle: language === "pt" ? "Excluir foto?" : "Delete photo?",
    deleteDescription: language === "pt" 
      ? "Esta ação não pode ser desfeita. A foto será removida permanentemente." 
      : "This action cannot be undone. The photo will be permanently removed.",
    cancel: language === "pt" ? "Cancelar" : "Cancel",
    delete: language === "pt" ? "Excluir" : "Delete",
    viewFull: language === "pt" ? "Ver em tela cheia" : "View fullscreen",
  };

  const typeLabels = {
    before: { label: t.before, variant: "secondary" as const },
    after: { label: t.after, variant: "default" as const },
    progress: { label: t.progress, variant: "outline" as const },
  };

  const typeInfo = typeLabels[photo.photo_type];

  return (
    <>
      <Card 
        className={`overflow-hidden cursor-pointer transition-all ${
          isSelected ? "ring-2 ring-primary" : "hover:shadow-lg"
        }`}
        onClick={() => onSelect?.(photo)}
      >
        <div className="relative aspect-[3/4]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Progress photo - ${photo.photo_type}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {/* Type badge */}
          <Badge 
            variant={typeInfo.variant}
            className="absolute top-2 left-2"
          >
            {typeInfo.label}
          </Badge>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(true);
              }}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t.deleteDescription}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(photo.id, photo.image_url)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t.delete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <CardContent className="p-3 space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {format(new Date(photo.taken_at), "dd MMM yyyy", { locale })}
          </div>
          
          {photo.weight && (
            <div className="flex items-center gap-2 text-sm">
              <Scale className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{photo.weight} kg</span>
            </div>
          )}
          
          {photo.notes && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">{photo.notes}</span>
            </div>
          )}
          
          {photo.ai_analysis && (
            <Badge variant="secondary" className="mt-2">
              IA ✓
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen view */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-4xl p-0">
          <DialogHeader className="p-4">
            <DialogTitle>
              {typeInfo.label} - {format(new Date(photo.taken_at), "dd/MM/yyyy")}
            </DialogTitle>
          </DialogHeader>
          {imageUrl && (
            <img
              src={imageUrl}
              alt={`Progress photo - ${photo.photo_type}`}
              className="w-full max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
