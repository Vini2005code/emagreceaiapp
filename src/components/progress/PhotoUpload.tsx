import React, { useRef, useState } from "react";
import { Camera, Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface PhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (
    file: File,
    photoType: "before" | "after" | "progress",
    weight?: number,
    notes?: string
  ) => Promise<any>;
  isUploading: boolean;
}

export function PhotoUpload({ isOpen, onClose, onUpload, isUploading }: PhotoUploadProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<"before" | "after" | "progress">("progress");
  const [weight, setWeight] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const t = {
    title: language === "pt" ? "Adicionar Foto" : "Add Photo",
    description: language === "pt" 
      ? "Envie uma foto para acompanhar sua evolução" 
      : "Upload a photo to track your progress",
    selectPhoto: language === "pt" ? "Selecionar da galeria" : "Select from gallery",
    takePhoto: language === "pt" ? "Tirar foto" : "Take photo",
    photoType: language === "pt" ? "Tipo de foto" : "Photo type",
    before: language === "pt" ? "Antes" : "Before",
    after: language === "pt" ? "Depois" : "After",
    progress: language === "pt" ? "Progresso" : "Progress",
    weight: language === "pt" ? "Peso atual (kg)" : "Current weight (kg)",
    weightPlaceholder: language === "pt" ? "Ex: 75.5" : "e.g. 75.5",
    notes: language === "pt" ? "Observações (opcional)" : "Notes (optional)",
    notesPlaceholder: language === "pt" 
      ? "Como você está se sentindo? Alguma mudança notável?" 
      : "How are you feeling? Any notable changes?",
    upload: language === "pt" ? "Enviar Foto" : "Upload Photo",
    uploading: language === "pt" ? "Enviando..." : "Uploading...",
    cancel: language === "pt" ? "Cancelar" : "Cancel",
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    await onUpload(
      selectedFile,
      photoType,
      weight ? parseFloat(weight) : undefined,
      notes || undefined
    );
    
    // Reset form
    setSelectedFile(null);
    setPreview(null);
    setPhotoType("progress");
    setWeight("");
    setNotes("");
    onClose();
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreview(null);
      setPhotoType("progress");
      setWeight("");
      setNotes("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo preview or upload buttons */}
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-24 flex-col gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
                <span className="text-xs">{t.selectPhoto}</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-24 flex-col gap-2"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-6 w-6" />
                <span className="text-xs">{t.takePhoto}</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}

          {/* Photo type selector */}
          <div className="space-y-2">
            <Label>{t.photoType}</Label>
            <Select value={photoType} onValueChange={(v) => setPhotoType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="before">{t.before}</SelectItem>
                <SelectItem value="after">{t.after}</SelectItem>
                <SelectItem value="progress">{t.progress}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Weight input */}
          <div className="space-y-2">
            <Label>{t.weight}</Label>
            <Input
              type="number"
              step="0.1"
              placeholder={t.weightPlaceholder}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{t.notes}</Label>
            <Textarea
              placeholder={t.notesPlaceholder}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isUploading}
            >
              {t.cancel}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.uploading}
                </>
              ) : (
                t.upload
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
