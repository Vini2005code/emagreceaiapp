-- Adicionar constraint UNIQUE no CPF para garantir cadastro único
-- Primeiro, remover CPFs duplicados se existirem (manter o registro mais antigo)
DELETE FROM public.profiles
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY cpf ORDER BY created_at ASC) AS rn
    FROM public.profiles
    WHERE cpf IS NOT NULL AND cpf != ''
  ) ranked
  WHERE rn > 1
);

-- Adicionar unique constraint no CPF (apenas quando não nulo)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_cpf_unique 
  ON public.profiles (cpf) 
  WHERE cpf IS NOT NULL AND cpf != '';
