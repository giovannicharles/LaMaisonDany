import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import { DEFAULT_CONTENT, ICON_OPTIONS, mergeContent, type SiteContent } from "@/lib/siteContent";
import { AButton, Field, PageIntro, Panel, Select, TextArea, TextInput, Toggle, useFeedback } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

type SectionKey = keyof SiteContent;

const TABS: { id: string; label: string; keys: SectionKey[] }[] = [
  { id: "general", label: "Général", keys: ["general"] },
  { id: "home", label: "Accueil", keys: ["hero", "about_home", "banner"] },
  { id: "reassurance", label: "Atouts", keys: ["reassurance"] },
  { id: "order", label: "Commande", keys: ["how_to_order", "order_dialog"] },
  { id: "faq", label: "FAQ", keys: ["faq"] },
  { id: "about", label: "Valeurs", keys: ["values"] },
  { id: "chatbot", label: "Chatbot", keys: ["chatbot"] },
];

const ICON_LABELS: Record<string, string> = {
  sparkles: "Étincelles",
  message: "Message",
  tag: "Étiquette",
  handshake: "Accompagnement",
  truck: "Livraison",
  shield: "Garantie",
  gift: "Cadeau",
  clock: "Horloge",
  star: "Étoile",
};

function ListEditor<T>({
  items,
  onChange,
  blank,
  render,
  addLabel,
  max = 12,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  blank: T;
  render: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  addLabel: string;
  max?: number;
}) {
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl bg-blush/60 p-4 ring-1 ring-blush-edge/60">
          <div className="space-y-3">{render(item, (patch) => onChange(items.map((x, k) => (k === i ? { ...x, ...patch } : x))))}</div>
          <div className="mt-3 flex items-center justify-end gap-1">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="rounded-full p-2 text-wine hover:bg-blush-deep disabled:opacity-30">
              <ArrowUp className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Descendre" className="rounded-full p-2 text-wine hover:bg-blush-deep disabled:opacity-30">
              <ArrowDown className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} aria-label="Supprimer" className="rounded-full p-2 text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      {items.length < max && (
        <AButton type="button" variant="secondary" onClick={() => onChange([...items, { ...blank }])}>
          <Plus className="h-4 w-4" /> {addLabel}
        </AButton>
      )}
    </div>
  );
}

export default function AdminContent() {
  const { toast } = useFeedback();
  const [content, setContent] = useState<SiteContent>(DEFAULT_CONTENT);
  const [saved, setSaved] = useState<SiteContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(TABS[0].id);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api.settings
      .get()
      .then((res) => {
        const merged = mergeContent(res.data ?? {});
        setContent(merged);
        setSaved(merged);
      })
      .catch(() => toast("error", "Impossible de charger le contenu (valeurs par défaut affichées)."))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const set = <K extends SectionKey>(key: K, patch: Partial<SiteContent[K]>) =>
    setContent((c) => ({ ...c, [key]: { ...(c[key] as object), ...(patch as object) } as SiteContent[K] }));
  const setList = <K extends SectionKey>(key: K, value: SiteContent[K]) => setContent((c) => ({ ...c, [key]: value }));


  const dirtyKeys = useMemo(
    () => (Object.keys(content) as SectionKey[]).filter((k) => JSON.stringify(content[k]) !== JSON.stringify(saved[k])),
    [content, saved]
  );

  useEffect(() => {
    if (dirtyKeys.length === 0) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirtyKeys.length]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = Object.fromEntries(dirtyKeys.map((k) => [k, content[k]]));
      await api.settings.update(payload);
      setSaved(content);
      toast("success", "Modifications enregistrées. Elles sont déjà visibles sur le site.");
    } catch (err) {
      toast("error", err instanceof Error && err.message !== "Request failed" ? "Certaines valeurs sont invalides (ex. numéro WhatsApp : chiffres uniquement, avec l'indicatif pays)." : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const uploadHero = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast("error", "L'image dépasse 5 Mo.");
    setUploading(true);
    try {
      const res = await api.media.upload(file);
      set("hero", { image_url: res.data.url });
      toast("success", "Image envoyée. Pensez à enregistrer.");
    } catch {
      toast("error", "L'envoi de l'image a échoué.");
    } finally {
      setUploading(false);
    }
  };

  const g = content.general;

  return (
    <>
      <PageIntro title="Contenu du site" text="Modifiez ici tous les textes et réglages du site. Les changements sont visibles dès l'enregistrement." />

      <div role="tablist" aria-label="Sections" className="mb-6 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full px-5 py-2.5 text-[0.95rem] font-medium transition-colors",
              tab === t.id ? "bg-wine text-blush" : "bg-white text-ink-soft ring-1 ring-blush-edge/70 hover:text-wine"
            )}
          >
            {t.label}
            {t.keys.some((k) => dirtyKeys.includes(k)) && <span aria-label="modifié" className="ml-2 inline-block h-2 w-2 rounded-full bg-amber-400 align-middle" />}
          </button>
        ))}
      </div>

      <Panel className={cn(loading && "opacity-60 pointer-events-none")}>
        <div className="space-y-6">
          {tab === "general" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nom de la maison" htmlFor="g-brand"><TextInput id="g-brand" value={g.brand} onChange={(e) => set("general", { brand: e.target.value })} /></Field>
                <Field label="Devise des prix" htmlFor="g-cur" hint="Ex. FCFA, GDES, EUR."><TextInput id="g-cur" value={g.currency} onChange={(e) => set("general", { currency: e.target.value })} /></Field>
              </div>
              <Field label="Slogan" htmlFor="g-tag"><TextInput id="g-tag" value={g.tagline} onChange={(e) => set("general", { tagline: e.target.value })} /></Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Numéro WhatsApp" htmlFor="g-wa" hint="Format international, chiffres uniquement. Ex. 237690000000.">
                  <TextInput id="g-wa" inputMode="numeric" value={g.whatsapp_number} onChange={(e) => set("general", { whatsapp_number: e.target.value.replace(/\D/g, "") })} />
                </Field>
                <Field label="Téléphone affiché" htmlFor="g-ph"><TextInput id="g-ph" value={g.phone} onChange={(e) => set("general", { phone: e.target.value })} /></Field>
              </div>
              <Field label="Message WhatsApp par défaut" htmlFor="g-msg" hint="Utilisé par les boutons WhatsApp généraux (hors produit).">
                <TextArea id="g-msg" rows={2} value={g.whatsapp_message} onChange={(e) => set("general", { whatsapp_message: e.target.value })} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" htmlFor="g-mail"><TextInput id="g-mail" type="email" value={g.email} onChange={(e) => set("general", { email: e.target.value })} /></Field>
                <Field label="Horaires" htmlFor="g-h"><TextInput id="g-h" value={g.opening_hours} onChange={(e) => set("general", { opening_hours: e.target.value })} placeholder="Lun-Sam, 9h-18h" /></Field>
              </div>
              <Field label="Adresse" htmlFor="g-ad"><TextInput id="g-ad" value={g.address} onChange={(e) => set("general", { address: e.target.value })} /></Field>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Instagram (lien)" htmlFor="g-ig"><TextInput id="g-ig" value={g.instagram} onChange={(e) => set("general", { instagram: e.target.value })} placeholder="https://" /></Field>
                <Field label="Facebook (lien)" htmlFor="g-fb"><TextInput id="g-fb" value={g.facebook} onChange={(e) => set("general", { facebook: e.target.value })} placeholder="https://" /></Field>
                <Field label="TikTok (lien)" htmlFor="g-tt"><TextInput id="g-tt" value={g.tiktok} onChange={(e) => set("general", { tiktok: e.target.value })} placeholder="https://" /></Field>
              </div>
            </>
          )}

          {tab === "home" && (
            <>
              <h2 className="font-brand text-2xl text-wine">Bandeau d'accueil</h2>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Titre, ligne 1" htmlFor="h-1"><TextInput id="h-1" value={content.hero.line1} onChange={(e) => set("hero", { line1: e.target.value })} /></Field>
                <Field label="Titre, ligne 2" htmlFor="h-2"><TextInput id="h-2" value={content.hero.line2} onChange={(e) => set("hero", { line2: e.target.value })} /></Field>
                <Field label="Fin du titre (en rose, italique)" htmlFor="h-3"><TextInput id="h-3" value={content.hero.accent} onChange={(e) => set("hero", { accent: e.target.value })} /></Field>
              </div>
              <Field label="Texte d'introduction" htmlFor="h-t"><TextArea id="h-t" rows={3} value={content.hero.text} onChange={(e) => set("hero", { text: e.target.value })} /></Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Bouton principal" htmlFor="h-c1"><TextInput id="h-c1" value={content.hero.cta_primary} onChange={(e) => set("hero", { cta_primary: e.target.value })} /></Field>
                <Field label="Bouton secondaire" htmlFor="h-c2"><TextInput id="h-c2" value={content.hero.cta_secondary} onChange={(e) => set("hero", { cta_secondary: e.target.value })} /></Field>
                <Field label="Pastille, titre" htmlFor="h-b1"><TextInput id="h-b1" value={content.hero.badge_title} onChange={(e) => set("hero", { badge_title: e.target.value })} /></Field>
                <Field label="Pastille, sous-titre" htmlFor="h-b2"><TextInput id="h-b2" value={content.hero.badge_text} onChange={(e) => set("hero", { badge_text: e.target.value })} /></Field>
              </div>
              <Field label="Image du bandeau" hint="Photo détourée d'un produit (PNG sans fond idéal). Sans image, une composition par défaut s'affiche.">
                <div className="flex items-center gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl bg-blush-deep">
                    {content.hero.image_url ? <img src={content.hero.image_url} alt="" className="h-full w-full object-contain" /> : <ImagePlus className="h-8 w-8 text-rose" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <AButton type="button" variant="secondary" disabled={uploading} onClick={() => fileRef.current?.click()}>
                      {uploading ? "Envoi..." : content.hero.image_url ? "Changer l'image" : "Choisir une image"}
                    </AButton>
                    {content.hero.image_url && <AButton type="button" variant="ghost" onClick={() => set("hero", { image_url: "" })}>Retirer</AButton>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => uploadHero(e.target.files?.[0])} />
                </div>
              </Field>

              <hr className="border-blush-edge/70" />
              <h2 className="font-brand text-2xl text-wine">Section « La maison »</h2>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Titre, ligne 1" htmlFor="a-1"><TextInput id="a-1" value={content.about_home.line1} onChange={(e) => set("about_home", { line1: e.target.value })} /></Field>
                <Field label="Titre, ligne 2" htmlFor="a-2"><TextInput id="a-2" value={content.about_home.line2} onChange={(e) => set("about_home", { line2: e.target.value })} /></Field>
                <Field label="Fin du titre (rose)" htmlFor="a-3"><TextInput id="a-3" value={content.about_home.accent} onChange={(e) => set("about_home", { accent: e.target.value })} /></Field>
              </div>
              <Field label="Texte" htmlFor="a-t"><TextArea id="a-t" rows={4} value={content.about_home.text} onChange={(e) => set("about_home", { text: e.target.value })} /></Field>
              <Field label="Bouton" htmlFor="a-c"><TextInput id="a-c" value={content.about_home.cta} onChange={(e) => set("about_home", { cta: e.target.value })} /></Field>

              <hr className="border-blush-edge/70" />
              <h2 className="font-brand text-2xl text-wine">Bandeau final</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Titre" htmlFor="b-1"><TextInput id="b-1" value={content.banner.line1} onChange={(e) => set("banner", { line1: e.target.value })} /></Field>
                <Field label="Suite du titre (rose clair)" htmlFor="b-2"><TextInput id="b-2" value={content.banner.accent} onChange={(e) => set("banner", { accent: e.target.value })} /></Field>
              </div>
              <Field label="Texte" htmlFor="b-t"><TextArea id="b-t" rows={2} value={content.banner.text} onChange={(e) => set("banner", { text: e.target.value })} /></Field>
              <Field label="Bouton" htmlFor="b-c"><TextInput id="b-c" value={content.banner.cta} onChange={(e) => set("banner", { cta: e.target.value })} /></Field>
            </>
          )}

          {tab === "reassurance" && (
            <>
              <p className="text-ink-soft">Les atouts affichés sous le bandeau d'accueil (4 recommandés). Ne mettez que des promesses que vous tenez.</p>
              <ListEditor
                items={content.reassurance}
                onChange={(v) => setList("reassurance", v)}
                blank={{ icon: "sparkles", title: "", text: "" }}
                addLabel="Ajouter un atout"
                max={8}
                render={(item, update) => (
                  <div className="grid gap-3 sm:grid-cols-[170px_1fr_1.4fr]">
                    <Select aria-label="Icône" value={item.icon} onChange={(e) => update({ icon: e.target.value })}>
                      {ICON_OPTIONS.map((o) => <option key={o} value={o}>{ICON_LABELS[o] ?? o}</option>)}
                    </Select>
                    <TextInput aria-label="Titre" placeholder="Titre" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                    <TextInput aria-label="Texte" placeholder="Texte court" value={item.text} onChange={(e) => update({ text: e.target.value })} />
                  </div>
                )}
              />
            </>
          )}

          {tab === "order" && (
            <>
              <h2 className="font-brand text-2xl text-wine">Étapes « Comment commander »</h2>
              <ListEditor
                items={content.how_to_order}
                onChange={(v) => setList("how_to_order", v)}
                blank={{ title: "", text: "" }}
                addLabel="Ajouter une étape"
                max={6}
                render={(item, update) => (
                  <>
                    <TextInput aria-label="Titre de l'étape" placeholder="Titre" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                    <TextArea aria-label="Description" rows={2} placeholder="Description" value={item.text} onChange={(e) => update({ text: e.target.value })} />
                  </>
                )}
              />
              <hr className="border-blush-edge/70" />
              <h2 className="font-brand text-2xl text-wine">Fenêtre « Demander sur WhatsApp »</h2>
              <Field label="Texte d'introduction" htmlFor="o-i"><TextArea id="o-i" rows={2} value={content.order_dialog.intro} onChange={(e) => set("order_dialog", { intro: e.target.value })} /></Field>
              <Field label="Questions rapides proposées au client">
                <ListEditor
                  items={content.order_dialog.quick_messages.map((text) => ({ text }))}
                  onChange={(v) => set("order_dialog", { quick_messages: v.map((x) => x.text) })}
                  blank={{ text: "" }}
                  addLabel="Ajouter une question"
                  max={8}
                  render={(item, update) => <TextInput aria-label="Question rapide" value={item.text} onChange={(e) => update({ text: e.target.value })} />}
                />
              </Field>
            </>
          )}

          {tab === "faq" && (
            <>
              <p className="text-ink-soft">Affichée sur l'accueil et la page À propos. Le chatbot s'en sert aussi pour répondre.</p>
              <ListEditor
                items={content.faq}
                onChange={(v) => setList("faq", v)}
                blank={{ q: "", a: "" }}
                addLabel="Ajouter une question"
                max={30}
                render={(item, update) => (
                  <>
                    <TextInput aria-label="Question" placeholder="Question" value={item.q} onChange={(e) => update({ q: e.target.value })} />
                    <TextArea aria-label="Réponse" rows={3} placeholder="Réponse" value={item.a} onChange={(e) => update({ a: e.target.value })} />
                  </>
                )}
              />
            </>
          )}

          {tab === "about" && (
            <>
              <p className="text-ink-soft">Les trois valeurs présentées sur la page À propos. Le texte « Notre histoire » se modifie dans « Pages ».</p>
              <ListEditor
                items={content.values}
                onChange={(v) => setList("values", v)}
                blank={{ title: "", desc: "" }}
                addLabel="Ajouter une valeur"
                max={6}
                render={(item, update) => (
                  <>
                    <TextInput aria-label="Titre" placeholder="Titre" value={item.title} onChange={(e) => update({ title: e.target.value })} />
                    <TextArea aria-label="Description" rows={2} placeholder="Description" value={item.desc} onChange={(e) => update({ desc: e.target.value })} />
                  </>
                )}
              />
            </>
          )}

          {tab === "chatbot" && (
            <>
              <Toggle checked={content.chatbot.enabled} onChange={(v) => set("chatbot", { enabled: v })} label="Afficher le chatbot sur le site" />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nom de l'assistant" htmlFor="c-n"><TextInput id="c-n" value={content.chatbot.name} onChange={(e) => set("chatbot", { name: e.target.value })} /></Field>
              </div>
              <Field label="Message d'accueil" htmlFor="c-w"><TextArea id="c-w" rows={2} value={content.chatbot.welcome} onChange={(e) => set("chatbot", { welcome: e.target.value })} /></Field>
              <Field label="Quand il ne sait pas répondre" htmlFor="c-f" hint="Il propose alors de continuer sur WhatsApp."><TextArea id="c-f" rows={2} value={content.chatbot.fallback} onChange={(e) => set("chatbot", { fallback: e.target.value })} /></Field>
              <Field label="Réponses rapides" hint="Chaque bouton pose une question et le chatbot donne la réponse que vous écrivez ici.">
                <ListEditor
                  items={content.chatbot.quick_replies}
                  onChange={(v) => set("chatbot", { quick_replies: v })}
                  blank={{ label: "", answer: "" }}
                  addLabel="Ajouter une réponse rapide"
                  max={12}
                  render={(item, update) => (
                    <>
                      <TextInput aria-label="Question du bouton" placeholder="Question (texte du bouton)" value={item.label} onChange={(e) => update({ label: e.target.value })} />
                      <TextArea aria-label="Réponse" rows={3} placeholder="Réponse du chatbot" value={item.answer} onChange={(e) => update({ answer: e.target.value })} />
                    </>
                  )}
                />
              </Field>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-blush-edge/70 pt-5">
          <AButton type="button" variant="secondary" onClick={load} disabled={dirtyKeys.length === 0}>Annuler les changements</AButton>
          <AButton type="button" onClick={save} disabled={saving || dirtyKeys.length === 0}>{saving ? "Enregistrement..." : dirtyKeys.length === 0 ? "Aucun changement" : "Enregistrer"}</AButton>
        </div>
      </Panel>
    </>
  );
}
