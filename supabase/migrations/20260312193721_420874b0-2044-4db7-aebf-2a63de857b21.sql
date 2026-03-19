
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  result TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own generations"
  ON public.generations FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own generations"
  ON public.generations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations"
  ON public.generations FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  generations_used INTEGER NOT NULL DEFAULT 0,
  generation_limit INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

ALTER TABLE public.usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON public.usage FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.usage FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.usage FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_usage_updated_at
  BEFORE UPDATE ON public.usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bncc_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  ano TEXT NOT NULL,
  objeto_conhecimento TEXT,
  habilidade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bncc_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bncc_skills"
  ON public.bncc_skills FOR SELECT USING (true);
