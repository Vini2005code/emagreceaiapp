-- Create progress_photos table for before/after tracking
CREATE TABLE public.progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    photo_type TEXT NOT NULL CHECK (photo_type IN ('before', 'after', 'progress')),
    weight NUMERIC(5,2),
    notes TEXT,
    ai_analysis JSONB,
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only manage their own photos
CREATE POLICY "Users can view their own photos"
ON public.progress_photos FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own photos"
ON public.progress_photos FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photos"
ON public.progress_photos FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photos"
ON public.progress_photos FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_progress_photos_updated_at
BEFORE UPDATE ON public.progress_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_progress_photos_user_id ON public.progress_photos(user_id);
CREATE INDEX idx_progress_photos_taken_at ON public.progress_photos(taken_at DESC);

-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('progress-photos', 'progress-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies - users can only access their own photos
CREATE POLICY "Users can view their own progress photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own progress photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own progress photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own progress photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'progress-photos' AND auth.uid()::text = (storage.foldername(name))[1]);