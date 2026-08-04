CREATE TABLE public.mood_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_checkins TO authenticated;
GRANT ALL ON public.mood_checkins TO service_role;

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own mood checkins select" ON public.mood_checkins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own mood checkins insert" ON public.mood_checkins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mood checkins update" ON public.mood_checkins FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own mood checkins delete" ON public.mood_checkins FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX mood_checkins_user_created_idx ON public.mood_checkins (user_id, created_at DESC);