
-- Drop the old permissive signature and replace with one that enforces auth.uid() internally.
DROP FUNCTION IF EXISTS public.match_semantic_memories(vector, int, uuid);

CREATE OR REPLACE FUNCTION public.match_semantic_memories(
  query_embedding vector(1536),
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  content text,
  kind text,
  importance real,
  similarity float
)
LANGUAGE sql STABLE
SECURITY INVOKER
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
    AND m.user_id = auth.uid()
  ORDER BY (CASE WHEN m.pinned THEN 0 ELSE 1 END),
           m.embedding <=> query_embedding
  LIMIT match_count;
$$;

REVOKE EXECUTE ON FUNCTION public.match_semantic_memories(vector, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_semantic_memories(vector, int) TO authenticated, service_role;
