import { supabase } from "@/integrations/supabase/client";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  url: string;
  textContent?: string;
}

const BUCKET = "chat-attachments";
const MAX_BYTES = 15 * 1024 * 1024;

const TEXTY = /^(text\/|application\/(json|xml|javascript|typescript|x-yaml|sql))/;

export async function uploadAttachment(file: File): Promise<Attachment> {
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 15MB`);
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) throw new Error("You must be signed in to attach files");

  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const path = `${uid}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) throw error;

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24);

  let textContent: string | undefined;
  if (TEXTY.test(file.type) || /\.(txt|md|csv|json|log)$/i.test(file.name)) {
    try { textContent = (await file.text()).slice(0, 4000); } catch { /* ignore */ }
  }

  return {
    id: path,
    name: file.name,
    size: file.size,
    type: file.type || "file",
    path,
    url: signed?.signedUrl ?? "",
    textContent,
  };
}

export async function removeAttachment(a: Attachment) {
  await supabase.storage.from(BUCKET).remove([a.path]);
}

/** Build the text block appended to a chat message so Morpheus can reference the files. */
export function attachmentsToPrompt(attachments: Attachment[]): string {
  if (!attachments.length) return "";
  const parts = attachments.map((a) => {
    const head = `- ${a.name} (${a.type}, ${Math.round(a.size / 1024)} KB)${a.url ? `\n  URL: ${a.url}` : ""}`;
    return a.textContent ? `${head}\n  Contents:\n\`\`\`\n${a.textContent}\n\`\`\`` : head;
  });
  return `\n\n[Attached files]\n${parts.join("\n")}`;
}
