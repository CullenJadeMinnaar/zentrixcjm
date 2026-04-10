import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Memory {
  id: string;
  person_name: string;
  relationship: string | null;
  past_events: string | null;
  emotional_context: string | null;
  notes: string | null;
}

export default function MemoriesTab() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ person_name: "", relationship: "", past_events: "", emotional_context: "", notes: "" });

  const fetchMemories = async () => {
    const { data } = await supabase.from("memories").select("*").order("created_at", { ascending: false });
    setMemories((data as Memory[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchMemories(); }, []);

  const resetForm = () => {
    setForm({ person_name: "", relationship: "", past_events: "", emotional_context: "", notes: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.person_name.trim()) { toast.error("Name is required"); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase.from("memories").update({
        person_name: form.person_name,
        relationship: form.relationship || null,
        past_events: form.past_events || null,
        emotional_context: form.emotional_context || null,
        notes: form.notes || null,
      }).eq("id", editingId);
      if (error) { toast.error(error.message); return; }
      toast.success("Memory updated");
    } else {
      const { error } = await supabase.from("memories").insert({
        user_id: user.id,
        person_name: form.person_name,
        relationship: form.relationship || null,
        past_events: form.past_events || null,
        emotional_context: form.emotional_context || null,
        notes: form.notes || null,
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Memory saved — Morpheus will remember");
    }
    resetForm();
    fetchMemories();
  };

  const handleEdit = (m: Memory) => {
    setForm({
      person_name: m.person_name,
      relationship: m.relationship || "",
      past_events: m.past_events || "",
      emotional_context: m.emotional_context || "",
      notes: m.notes || "",
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Memory removed");
    fetchMemories();
  };

  const inputClass = "w-full bg-secondary/50 border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl font-bold mb-1">Memory Vault</h2>
          <p className="text-sm text-muted-foreground">People Morpheus remembers for you</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold"
        >
          + Add Person
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="bg-card/60 border border-border rounded-xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-sm">{editingId ? "Edit Memory" : "New Memory"}</h3>
              <input className={inputClass} placeholder="Person's name *" value={form.person_name} onChange={e => setForm(f => ({ ...f, person_name: e.target.value }))} />
              <input className={inputClass} placeholder="Relationship (e.g. best friend, ex, boss)" value={form.relationship} onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))} />
              <textarea className={inputClass + " resize-none"} rows={3} placeholder="Past events & interactions..." value={form.past_events} onChange={e => setForm(f => ({ ...f, past_events: e.target.value }))} />
              <textarea className={inputClass + " resize-none"} rows={3} placeholder="Emotional context (how they make you feel, what they did...)" value={form.emotional_context} onChange={e => setForm(f => ({ ...f, emotional_context: e.target.value }))} />
              <textarea className={inputClass + " resize-none"} rows={2} placeholder="Extra notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              <div className="flex gap-3">
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave} className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold">
                  {editingId ? "Update" : "Save Memory"}
                </motion.button>
                <button onClick={resetForm} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading memories...</div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🧠</div>
          <p className="text-muted-foreground text-sm">No memories yet. Add someone and Morpheus will never forget.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {memories.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card/60 border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-display font-semibold text-base">{m.person_name}</h4>
                  {m.relationship && <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">{m.relationship}</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(m)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                  <button onClick={() => handleDelete(m.id)} className="text-xs text-destructive/70 hover:text-destructive transition-colors">Delete</button>
                </div>
              </div>
              {m.past_events && <p className="text-sm text-muted-foreground mt-2 leading-relaxed"><span className="text-foreground/70 font-medium">Events:</span> {m.past_events}</p>}
              {m.emotional_context && <p className="text-sm text-muted-foreground mt-1 leading-relaxed"><span className="text-foreground/70 font-medium">Emotions:</span> {m.emotional_context}</p>}
              {m.notes && <p className="text-xs text-muted-foreground/60 mt-2 italic">{m.notes}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
