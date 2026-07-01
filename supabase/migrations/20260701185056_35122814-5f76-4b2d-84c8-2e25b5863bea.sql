
-- pgvector for semantic memory
CREATE EXTENSION IF NOT EXISTS vector;

-- Long-term semantic memories with embeddings
CREATE TABLE IF NOT EXISTS public.semantic_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'general',
  importance REAL NOT NULL DEFAULT 0.5,
  source TEXT NOT NULL DEFAULT 'manual',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived BOOLEAN NOT NULL DEFAULT false,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.semantic_memories TO authenticated;
GRANT ALL ON public.semantic_memories TO service_role;

ALTER TABLE public.semantic_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own semantic memories select" ON public.semantic_memories
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own semantic memories insert" ON public.semantic_memories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own semantic memories update" ON public.semantic_memories
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own semantic memories delete" ON public.semantic_memories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS semantic_memories_user_idx ON public.semantic_memories(user_id);
CREATE INDEX IF NOT EXISTS semantic_memories_embedding_idx
  ON public.semantic_memories USING hnsw (embedding vector_cosine_ops);

CREATE TRIGGER semantic_memories_updated_at
BEFORE UPDATE ON public.semantic_memories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Similarity search RPC scoped to a user id (edge functions call with service context)
CREATE OR REPLACE FUNCTION public.match_semantic_memories(
  query_embedding vector(1536),
  match_count int DEFAULT 6,
  p_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  kind text,
  importance real,
  similarity float
)
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id,
    m.content,
    m.kind,
    m.importance,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM public.semantic_memories m
  WHERE m.archived = false
    AND m.embedding IS NOT NULL
    AND (p_user_id IS NULL OR m.user_id = p_user_id)
  ORDER BY (CASE WHEN m.pinned THEN 0 ELSE 1 END),
           m.embedding <=> query_embedding
  LIMIT match_count;
$$;

REVOKE EXECUTE ON FUNCTION public.match_semantic_memories(vector, int, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_semantic_memories(vector, int, uuid) TO authenticated, service_role;
