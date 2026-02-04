import React, { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface ProgressPhoto {
  id: string;
  user_id: string;
  image_url: string;
  photo_type: "before" | "after" | "progress";
  weight: number | null;
  notes: string | null;
  ai_analysis: BodyAnalysis | null;
  taken_at: string;
  created_at: string;
  updated_at: string;
}

export interface BodyAnalysis {
  isValidImage: boolean;
  analysisType: "comparison" | "single";
  overallProgress: {
    score: number;
    trend: "improving" | "stable" | "regressing";
    summary: string;
  };
  bodyComposition: {
    fatPercentageEstimate: string;
    muscleDefinition: "low" | "moderate" | "high";
    mainFatAreas: string[];
    muscularAreas: string[];
  };
  changes: {
    fatReduction: {
      detected: boolean;
      areas: string[];
      level: "slight" | "moderate" | "significant";
    };
    muscleGain: {
      detected: boolean;
      areas: string[];
      level: "slight" | "moderate" | "significant";
    };
    postureImprovement: {
      detected: boolean;
      details: string;
    };
    waterRetention: {
      detected: boolean;
      level: "low" | "moderate" | "high";
    };
  };
  feedback: {
    positivePoints: string[];
    attentionPoints: string[];
    suggestions: string[];
    motivationalMessage: string;
  };
  nextSteps: string[];
  confidenceLevel: string;
  analysisNotes: string;
  error?: string;
}

export function useProgressPhotos() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchPhotos = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("progress_photos")
        .select("*")
        .eq("user_id", user.id)
        .order("taken_at", { ascending: false });

      if (error) throw error;
      
      const transformedPhotos: ProgressPhoto[] = (data || []).map((photo: any) => ({
        ...photo,
        photo_type: photo.photo_type as "before" | "after" | "progress",
        ai_analysis: photo.ai_analysis as unknown as BodyAnalysis | null,
      }));
      
      setPhotos(transformedPhotos);
    } catch (error) {
      console.error("Error fetching photos:", error);
      toast({
        title: "Erro ao carregar fotos",
        description: "Não foi possível carregar suas fotos de progresso.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const uploadPhoto = useCallback(async (
    file: File,
    photoType: "before" | "after" | "progress",
    weight?: number,
    notes?: string
  ): Promise<ProgressPhoto | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para fazer upload.",
        variant: "destructive",
      });
      return null;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("progress-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: photoData, error: insertError } = await supabase
        .from("progress_photos")
        .insert({
          user_id: user.id,
          image_url: fileName,
          photo_type: photoType,
          weight: weight || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const newPhoto: ProgressPhoto = {
        ...photoData,
        photo_type: photoData.photo_type as "before" | "after" | "progress",
        ai_analysis: photoData.ai_analysis as unknown as BodyAnalysis | null,
      };

      setPhotos((prev) => [newPhoto, ...prev]);

      toast({
        title: "Foto enviada!",
        description: "Sua foto foi salva com sucesso.",
      });

      return newPhoto;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar sua foto. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [user, toast]);

  const getSignedUrl = useCallback(async (imagePath: string): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from("progress-photos")
        .createSignedUrl(imagePath, 60 * 60);
      
      return data?.signedUrl || null;
    } catch (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }
  }, []);

  const analyzePhotos = useCallback(async (
    beforePhoto?: ProgressPhoto,
    afterPhoto?: ProgressPhoto,
    currentPhoto?: ProgressPhoto
  ): Promise<BodyAnalysis | null> => {
    setIsAnalyzing(true);
    try {
      const getBase64 = async (photo: ProgressPhoto): Promise<string | null> => {
        const signedUrl = await getSignedUrl(photo.image_url);
        if (!signedUrl) return null;
        
        const response = await fetch(signedUrl);
        const blob = await response.blob();
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      };

      const [beforeBase64, afterBase64, currentBase64] = await Promise.all([
        beforePhoto ? getBase64(beforePhoto) : null,
        afterPhoto ? getBase64(afterPhoto) : null,
        currentPhoto ? getBase64(currentPhoto) : null,
      ]);

      const { data: profile } = await supabase
        .from("profiles")
        .select("weight, height, age, gender, goal")
        .eq("user_id", user?.id)
        .single();

      const { data, error } = await supabase.functions.invoke("analyze-body", {
        body: {
          beforeImageBase64: beforeBase64,
          afterImageBase64: afterBase64,
          currentImageBase64: currentBase64,
          userProfile: profile || undefined,
        },
      });

      if (error) throw error;

      if (afterPhoto || currentPhoto) {
        const targetPhoto = afterPhoto || currentPhoto;
        await supabase
          .from("progress_photos")
          .update({ ai_analysis: data })
          .eq("id", targetPhoto!.id);

        setPhotos((prev) =>
          prev.map((p) =>
            p.id === targetPhoto!.id ? { ...p, ai_analysis: data as BodyAnalysis } : p
          )
        );
      }

      return data as BodyAnalysis;
    } catch (error) {
      console.error("Error analyzing photos:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar as fotos. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [user, getSignedUrl, toast]);

  const deletePhoto = useCallback(async (photoId: string, imagePath: string) => {
    try {
      await supabase.storage.from("progress-photos").remove([imagePath]);

      const { error } = await supabase
        .from("progress_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      setPhotos((prev) => prev.filter((p) => p.id !== photoId));

      toast({
        title: "Foto excluída",
        description: "A foto foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a foto.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    photos,
    isLoading,
    isUploading,
    isAnalyzing,
    fetchPhotos,
    uploadPhoto,
    getSignedUrl,
    analyzePhotos,
    deletePhoto,
  };
}
