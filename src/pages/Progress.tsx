import { useState, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, Calendar, ArrowLeftRight, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProgressPhoto } from "@/types/app";

const samplePhotos: ProgressPhoto[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
    date: new Date("2024-01-01"),
    weight: 85,
    notes: "Início da jornada",
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&h=400&fit=crop",
    date: new Date("2024-02-01"),
    weight: 82,
    notes: "1 mês de progresso",
  },
];

const Progress = () => {
  const [photos, setPhotos] = useState<ProgressPhoto[]>(samplePhotos);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ProgressPhoto = {
          id: Date.now().toString(),
          imageUrl: reader.result as string,
          date: new Date(),
          notes: "",
        };
        setPhotos([newPhoto, ...photos]);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePhotoSelection = (id: string) => {
    if (selectedPhotos.includes(id)) {
      setSelectedPhotos(selectedPhotos.filter((p) => p !== id));
    } else if (selectedPhotos.length < 2) {
      setSelectedPhotos([...selectedPhotos, id]);
    }
  };

  const deletePhoto = (id: string) => {
    setPhotos(photos.filter((p) => p.id !== id));
    setSelectedPhotos(selectedPhotos.filter((p) => p !== id));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const comparedPhotos = selectedPhotos.map((id) =>
    photos.find((p) => p.id === id)
  );

  return (
    <AppLayout title="Progresso" subtitle="Galeria antes e depois">
      <div className="space-y-6">
        <div className="flex gap-3">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Foto
          </Button>
          <Button
            variant={compareMode ? "accent" : "outline"}
            onClick={() => {
              setCompareMode(!compareMode);
              setSelectedPhotos([]);
            }}
          >
            <ArrowLeftRight className="mr-2 h-5 w-5" />
            Comparar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <AnimatePresence>
          {compareMode && selectedPhotos.length === 2 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle className="text-center">Comparação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {comparedPhotos.map((photo, index) =>
                      photo ? (
                        <div key={photo.id} className="text-center">
                          <div className="aspect-[3/4] rounded-xl overflow-hidden mb-2">
                            <img
                              src={photo.imageUrl}
                              alt={`Foto ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-semibold text-foreground">
                            {formatDate(photo.date)}
                          </p>
                          {photo.weight && (
                            <p className="text-xs text-muted-foreground">
                              {photo.weight}kg
                            </p>
                          )}
                        </div>
                      ) : null
                    )}
                  </div>
                  {comparedPhotos[0]?.weight && comparedPhotos[1]?.weight && (
                    <div className="mt-4 p-3 bg-success/10 rounded-xl text-center">
                      <p className="font-bold text-success">
                        -{comparedPhotos[0].weight - comparedPhotos[1].weight}kg
                      </p>
                      <p className="text-xs text-muted-foreground">
                        de diferença
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {compareMode && selectedPhotos.length < 2 && (
          <Card variant="outline" className="border-dashed">
            <CardContent className="py-6 text-center">
              <ArrowLeftRight className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Selecione 2 fotos para comparar
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedPhotos.length}/2 selecionadas
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Sua Galeria
          </h3>

          {photos.length === 0 ? (
            <Card variant="outline" className="border-dashed">
              <CardContent className="py-12 text-center">
                <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-2">
                  Nenhuma foto ainda
                </p>
                <p className="text-xs text-muted-foreground">
                  Adicione sua primeira foto de progresso
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant={
                      selectedPhotos.includes(photo.id) ? "primary" : "elevated"
                    }
                    className={`overflow-hidden cursor-pointer ${
                      compareMode ? "ring-2 ring-offset-2" : ""
                    } ${
                      selectedPhotos.includes(photo.id)
                        ? "ring-primary"
                        : "ring-transparent"
                    }`}
                    onClick={() => compareMode && togglePhotoSelection(photo.id)}
                  >
                    <div className="aspect-[3/4] relative">
                      <img
                        src={photo.imageUrl}
                        alt={`Progresso ${formatDate(photo.date)}`}
                        className="w-full h-full object-cover"
                      />
                      {!compareMode && (
                        <Button
                          size="iconSm"
                          variant="destructive"
                          className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto(photo.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(photo.date)}
                      </div>
                      {photo.weight && (
                        <p className="font-semibold text-sm text-foreground">
                          {photo.weight}kg
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Progress;
