
-- Add CPF and enhanced profile fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS cpf text UNIQUE,
  ADD COLUMN IF NOT EXISTS food_preferences text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS medical_limitations text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS daily_routine text DEFAULT 'regular',
  ADD COLUMN IF NOT EXISTS goal_weight numeric,
  ADD COLUMN IF NOT EXISTS body_type text DEFAULT 'mesomorph';

-- Create index on CPF for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf) WHERE cpf IS NOT NULL;
