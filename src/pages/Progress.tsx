import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, Camera, ArrowLeftRight, Sparkles, Loader2, TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgressPhotos, ProgressPhoto, BodyAnalysis } from "@/hooks/useProgressPhotos";
import { PhotoUpload } from "@/components/progress/PhotoUpload";
import { PhotoCard } from "@/components/progress/PhotoCard";
import { AnalysisResult } from "@/components/progress/AnalysisResult";
import { ProgressReport } from "@/components/progress/ProgressReport";

const Progress = () => {
  const { language } = useLanguage();
  const {
    photos, isLoading, isUploading, isAnalyzing,
    fetchPhotos, uploadPhoto, getSignedUrl, analyzePhotos, deletePhoto,
  } = useProgressPhotos();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedBefore, setSelectedBefore] = useState<ProgressPhoto | null>(null);
  const [selectedAfter, setSelectedAfter] = useState<ProgressPhoto | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<BodyAnalysis | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const pt = language === "pt";

  const t = {
    title: pt ? "Antes e Depois" : "Before & After",
    subtitle: pt ? "Acompanhe sua evolução" : "Track your progress",
    addPhoto: pt ? "Adicionar Foto" : "Add Photo",
    compare: pt ? "Comparar" : "Compare",
    analyze: pt ? "Analisar com IA" : "Analyze with AI",
    analyzing: pt ? "Analisando..." : "Analyzing...",
    all: pt ? "Todas" : "All",
    beforePhotos: pt ? "Fotos Antes" : "Before Photos",
    afterPhotos: pt ? "Fotos Depois" : "After Photos",
    progressPhotos: pt ? "Progresso" : "Progress",
    noPhotos: pt ? "Nenhuma foto ainda" : "No photos yet",
    noPhotosDesc: pt ? "Adicione sua primeira foto para começar a acompanhar sua evolução" : "Add your first photo to start tracking your progress",
    selectBefore: pt ? "Selecione a foto ANTES" : "Select BEFORE photo",
    selectAfter: pt ? "Selecione a foto DEPOIS" : "Select AFTER photo",
    compareDesc: pt ? "Selecione uma foto ANTES e uma DEPOIS para comparar sua evolução" : "Select a BEFORE and AFTER photo to compare your progress",
  };

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);

  useEffect(() => {
    const loadUrls = async () => {
      const urlPromises = photos.map(async (photo) => {
        if (!photoUrls[photo.id]) {
          const url = await getSignedUrl(photo.image_url);
          return { id: photo.id, url };
        }
        return null;
      });
      const results = await Promise.all(urlPromises);
      const newUrls: Record<string, string> = {};
      results.forEach((result) => { if (result?.url) newUrls[result.id] = result.url; });
      if (Object.keys(newUrls).length > 0) setPhotoUrls((prev) => ({ ...prev, ...newUrls }));
    };
    if (photos.length > 0) loadUrls();
  }, [photos, getSignedUrl, photoUrls]);

  const beforePhotos = useMemo(() => photos.filter((p) => p.photo_type === "before"), [photos]);
  const afterPhotos = useMemo(() => photos.filter((p) => p.photo_type === "after"), [photos]);
  const progressPhotos = useMemo(() => photos.filter((p) => p.photo_type === "progress"), [photos]);

  const handlePhotoSelect = (photo: ProgressPhoto) => {
    if (!compareMode) return;
    if (photo.photo_type === "before") setSelectedBefore(photo);
    else setSelectedAfter(photo);
  };

  const handleAnalyze = async () => {
    const analysis = await analyzePhotos(selectedBefore || undefined, selectedAfter || undefined);
    if (analysis) setCurrentAnalysis(analysis);
  };

  const canAnalyze = selectedBefore || selectedAfter;

  return (
    <AppLayout title={t.title} subtitle={t.subtitle}>
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button onClick={() => setIsUploadOpen(true)} className="flex-1">
            <Plus className="mr-2 h-5 w-5" />{t.addPhoto}
          </Button>
          <Button
            variant={compareMode ? "default" : "outline"}
            onClick={() => {
              setCompareMode(!compareMode);
              if (compareMode) { setSelectedBefore(null); setSelectedAfter(null); setCurrentAnalysis(null); }
            }}
          >
            <ArrowLeftRight className="mr-2 h-5 w-5" />{t.compare}
          </Button>
          <ProgressReport photos={photos} photoUrls={photoUrls} />
        </div>

        {/* Compare Mode */}
        <AnimatePresence>
          {compareMode && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center mb-4">{t.compareDesc}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">{t.selectBefore}</p>
                      {selectedBefore ? (
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                          <img src={photoUrls[selectedBefore.id]} alt="Before" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">{t.selectAfter}</p>
                      {selectedAfter ? (
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                          <img src={photoUrls[selectedAfter.id]} alt="After" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="aspect-[3/4] rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button className="w-full" disabled={!canAnalyze || isAnalyzing} onClick={handleAnalyze}>
                    {isAnalyzing ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.analyzing}</>) : (<><Sparkles className="mr-2 h-5 w-5" />{t.analyze}</>)}
                  </Button>
                </CardContent>
              </Card>
              {currentAnalysis && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <AnalysisResult analysis={currentAnalysis} />
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo Gallery */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : photos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">{t.noPhotos}</p>
              <p className="text-xs text-muted-foreground">{t.noPhotosDesc}</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="all">{t.all}</TabsTrigger>
              <TabsTrigger value="before">{t.beforePhotos}</TabsTrigger>
              <TabsTrigger value="after">{t.afterPhotos}</TabsTrigger>
              <TabsTrigger value="progress">{t.progressPhotos}</TabsTrigger>
            </TabsList>

            {["all", "before", "after", "progress"].map(tab => {
              const filtered = tab === "all" ? photos
                : tab === "before" ? beforePhotos
                : tab === "after" ? afterPhotos
                : progressPhotos;
              return (
                <TabsContent key={tab} value={tab} className="mt-4">
                  {filtered.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {pt ? "Nenhuma foto nesta categoria" : "No photos in this category"}
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {filtered.map((photo) => (
                        <PhotoCard
                          key={photo.id}
                          photo={photo}
                          imageUrl={photoUrls[photo.id] || null}
                          onDelete={deletePhoto}
                          onSelect={compareMode ? handlePhotoSelect : undefined}
                          isSelected={compareMode && (selectedBefore?.id === photo.id || selectedAfter?.id === photo.id)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        )}

        <PhotoUpload isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onUpload={uploadPhoto} isUploading={isUploading} />
      </div>
    </AppLayout>
  );
};

export default Progress;
