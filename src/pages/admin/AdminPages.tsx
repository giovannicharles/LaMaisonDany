import { useCallback, useEffect, useState } from "react";
import { api } from "@/api/client";
import { AButton, Field, PageIntro, Panel, TextArea, TextInput, useFeedback } from "@/components/admin/kit";

const SLOTS = [
  { slug: "about", label: "À propos", hint: "Texte de la section « Notre histoire » de la page À propos." },
];

export default function AdminPages() {
  const { toast } = useFeedback();
  const active = SLOTS[0].slug;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const slot = SLOTS.find((s) => s.slug === active) ?? SLOTS[0];

  const load = useCallback(() => {
    setLoading(true);
    api.pages
      .get(active)
      .then((res) => {
        setTitle(res.data.title);
        setContent(res.data.content ?? "");
      })
      .catch(() => {
        setTitle(slot.label);
        setContent("");
      })
      .finally(() => setLoading(false));
  }, [active, slot.label]);

  useEffect(load, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.pages.upsert({ slug: active, title: title.trim() || slot.label, content });
      toast("success", "Page enregistrée.");
    } catch {
      toast("error", "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageIntro title="Pages" text="Les textes longs du site. Les autres textes (accueil, FAQ, chatbot…) se modifient dans « Contenu du site »." />
      <Panel>
        <form onSubmit={save} className="space-y-5">
          <p className="text-ink-soft">{slot.hint}</p>
          <Field label="Titre" htmlFor="pg-title">
            <TextInput id="pg-title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={loading} />
          </Field>
          <Field label="Contenu" htmlFor="pg-content" hint="Les retours à la ligne sont conservés sur le site.">
            <TextArea id="pg-content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} disabled={loading} />
          </Field>
          <div className="flex justify-end">
            <AButton type="submit" disabled={saving || loading}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </AButton>
          </div>
        </form>
      </Panel>
    </>
  );
}
