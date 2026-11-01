import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Pagination, { usePagination } from "@/components/ui/Pagination";
import { Bell, Check, MessageCircle, Send, Trash2, Users } from "lucide-react";
import { api } from "@/api/client";
import type { Broadcast, Contact } from "@/types";
import { AButton, Field, PageIntro, Panel, TextArea, TextInput, useFeedback } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

type Channel = "whatsapp" | "push";

const personalize = (text: string, c: Contact) => text.split("{nom}").join(c.name.split(" ")[0] || c.name);

export default function AdminBroadcast() {
  const { toast, confirm } = useFeedback();
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("/");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [queue, setQueue] = useState<Contact[] | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<Broadcast[]>([]);
  const [visitors, setVisitors] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    api.broadcasts.contacts().then((r) => setContacts(r.data)).catch(() => {});
    api.broadcasts.list().then((r) => setHistory(r.data)).catch(() => {});
    api.push.stats().then((r) => setVisitors(r.data.visitors)).catch(() => {});
  }, []);

  useEffect(load, [load]);

  const withPhone = useMemo(() => contacts.filter((c) => c.phone), [contacts]);
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? withPhone.filter((c) => `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(q)) : withPhone;
  }, [withPhone, search]);

  const contactsPg = usePagination(shown, 8, search);
  const historyPg = usePagination(history, 5);

  const toggle = (key: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const prepare = async () => {
    const chosen = withPhone.filter((c) => selected.has(c.key));
    if (!body.trim()) return toast("error", "Écrivez d'abord votre message.");
    if (!chosen.length) return toast("error", "Choisissez au moins un contact.");
    if (!(await confirm(`Préparer l'envoi à ${chosen.length} contact(s) ? Vous validerez chaque envoi dans WhatsApp.`, "Préparer"))) return;
    setQueue(chosen);
    setDone(new Set());
  };

  const cancelQueue = async () => {
    if (done.size > 0 && !(await confirm("Annuler l'envoi en cours ? Les messages déjà envoyés ne seront pas enregistrés dans l'historique.", "Annuler l'envoi"))) return;
    setQueue(null);
    setDone(new Set());
  };

  const finishQueue = async () => {
    if (!queue) return;
    try {
      await api.broadcasts.create({ channel: "whatsapp", body: body.trim(), recipients: done.size });
      toast("success", "Envoi enregistré dans l'historique.");
      setQueue(null);
      setDone(new Set());
      setBody("");
      setSelected(new Set());
      load();
    } catch {
      toast("error", "Enregistrement impossible.");
    }
  };

  const sendPush = async () => {
    if (!body.trim()) return toast("error", "Écrivez d'abord votre message.");
    if (!(await confirm(`Envoyer cette notification à ${visitors ?? 0} visiteur(s) abonné(s) ?`, "Envoyer"))) return;
    setSending(true);
    try {
      const res = await api.broadcasts.create({ channel: "push", title: title.trim(), body: body.trim(), url: url.trim() || "/" });
      toast("success", `Notification envoyée à ${res.data.sent} visiteur(s).`);
      setBody("");
      setTitle("");
      load();
    } catch (err) {
      toast("error", err instanceof Error && err.message ? err.message : "Envoi impossible.");
    } finally {
      setSending(false);
    }
  };

  const removeHistory = async (b: Broadcast) => {
    if (!(await confirm("Supprimer cet envoi de l'historique ? Il sera placé dans la corbeille."))) return;
    try {
      await api.broadcasts.delete(b.id);
      toast("success", "Envoi placé dans la corbeille.");
      load();
    } catch {
      toast("error", "Suppression impossible.");
    }
  };

  return (
    <>
      <PageIntro title="Messages groupés" text="Écrivez une fois, envoyez à plusieurs clients : par WhatsApp (vous validez chaque envoi) ou par notification aux visiteurs abonnés." />

      <div role="tablist" aria-label="Canal d'envoi" className="mb-6 flex gap-2">
        {([
          ["whatsapp", "WhatsApp", MessageCircle],
          ["push", "Notification", Bell],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={channel === id}
            onClick={() => setChannel(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.95rem] font-medium transition-colors",
              channel === id ? "bg-wine text-blush" : "bg-white text-ink-soft ring-1 ring-blush-edge/70 hover:text-wine"
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <Panel className="mb-6">
        <div className="space-y-5">
          {channel === "push" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Titre" htmlFor="b-title" hint="Court, par exemple « Nouveautés en boutique ».">
                <TextInput id="b-title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Page à ouvrir au clic" htmlFor="b-url" hint="Par exemple /catalogue ou /produit/nom-du-produit.">
                <TextInput id="b-url" value={url} onChange={(e) => setUrl(e.target.value)} />
              </Field>
            </div>
          )}
          <Field
            label="Message"
            htmlFor="b-body"
            hint={channel === "whatsapp" ? "Écrivez {nom} pour insérer le prénom du client. Exemple : Bonjour {nom}, nous avons de nouveaux parfums." : `${body.length}/500 caractères.`}
          >
            <TextArea id="b-body" rows={4} maxLength={500} value={body} onChange={(e) => setBody(e.target.value)} placeholder={channel === "whatsapp" ? "Bonjour {nom}, ..." : "Votre message"} />
          </Field>

          {channel === "push" && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blush px-4 py-3">
              <p className="flex items-center gap-2 text-sm text-ink-soft">
                <Users className="h-4 w-4 text-wine" />
                {visitors == null ? "Chargement…" : visitors === 0 ? "Aucun visiteur abonné pour le moment. Ils s'abonnent depuis le pied de page du site." : `${visitors} visiteur(s) abonné(s) aux notifications.`}
              </p>
              <AButton onClick={sendPush} disabled={sending || !visitors || !body.trim()}>
                <Send className="h-4 w-4" /> {sending ? "Envoi…" : "Envoyer la notification"}
              </AButton>
            </div>
          )}
        </div>
      </Panel>

      {channel === "whatsapp" && !queue && (
        <Panel className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-brand text-2xl text-wine">Destinataires</h2>
            <label className="flex items-center gap-2 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[var(--color-wine)]"
                checked={shown.length > 0 && shown.every((c) => selected.has(c.key))}
                onChange={() => setSelected(shown.every((c) => selected.has(c.key)) ? new Set() : new Set(shown.map((c) => c.key)))}
              />
              Tout sélectionner
            </label>
          </div>
          <p className="mt-1 text-sm text-ink-soft">Les contacts viennent des messages reçus via le formulaire de contact (avec un numéro de téléphone).</p>
          <TextInput className="mt-4 !rounded-full" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un contact" aria-label="Rechercher un contact" />

          {shown.length === 0 ? (
            <p className="mt-5 text-ink-soft">Aucun contact pour le moment.</p>
          ) : (
            <ul className="mt-4 divide-y divide-blush-edge/60">
              {contactsPg.slice.map((c) => (
                <motion.li key={c.key} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
                  <label className="flex cursor-pointer items-center gap-3 py-3">
                    <input type="checkbox" className="h-5 w-5 accent-[var(--color-wine)]" checked={selected.has(c.key)} onChange={() => toggle(c.key)} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-wine">{c.name}</span>
                      <span className="block text-sm text-ink-soft">+{c.phone} · {c.count} message(s)</span>
                    </span>
                  </label>
                </motion.li>
              ))}
            </ul>
          )}
          <Pagination page={contactsPg.page} pageCount={contactsPg.pageCount} total={contactsPg.total} size={contactsPg.size} label="contacts" onChange={(n) => { contactsPg.setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />

          <div className="mt-5 flex justify-end">
            <AButton onClick={prepare} disabled={!selected.size || !body.trim()}>
              <Send className="h-4 w-4" /> Préparer l'envoi ({selected.size})
            </AButton>
          </div>
        </Panel>
      )}

      {channel === "whatsapp" && queue && (
        <Panel className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-brand text-2xl text-wine">Envoi en cours</h2>
              <p className="text-sm text-ink-soft">
                {done.size} / {queue.length} envoyé(s). Touchez « Envoyer » : WhatsApp s'ouvre avec le message prêt, validez-le puis revenez ici.
              </p>
            </div>
            <div className="flex gap-2">
              <AButton variant="secondary" onClick={cancelQueue}>
                Annuler
              </AButton>
              <AButton onClick={finishQueue} disabled={done.size === 0}>
                Terminer et enregistrer
              </AButton>
            </div>
          </div>
          <div className="mt-4 h-2 w-full rounded-full bg-blush-edge/60">
            <div className="h-2 rounded-full bg-rose transition-[width] duration-500" style={{ width: `${(done.size / queue.length) * 100}%` }} />
          </div>
          <ul className="mt-4 divide-y divide-blush-edge/60">
            {queue.map((c) => {
              const sent = done.has(c.key);
              return (
                <li key={c.key} className="flex items-center gap-3 py-3">
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate font-medium", sent ? "text-ink-soft line-through" : "text-wine")}>{c.name}</span>
                    <span className="block truncate text-sm text-ink-soft">{personalize(body, c)}</span>
                  </span>
                  <a
                    href={`https://wa.me/${c.phone}?text=${encodeURIComponent(personalize(body, c))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDone((d) => new Set(d).add(c.key))}
                    className={cn(
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                      sent ? "bg-emerald-100 text-emerald-800" : "bg-wine text-blush hover:bg-wine-deep"
                    )}
                  >
                    {sent ? <Check className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                    {sent ? "Envoyé" : "Envoyer"}
                  </a>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <Panel>
        <h2 className="font-brand text-2xl text-wine">Historique</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-ink-soft">Aucun envoi pour le moment.</p>
        ) : (
          <ul className="mt-3 divide-y divide-blush-edge/60">
            {historyPg.slice.map((b) => (
              <motion.li key={b.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="flex items-start gap-3 py-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-deep text-wine">
                  {b.channel === "push" ? <Bell className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-wine">{b.title || b.body}</p>
                  <p className="line-clamp-2 text-sm text-ink-soft">{b.body}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {new Date(b.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} · {b.sent}/{b.recipients} envoyé(s)
                    {b.failed > 0 ? ` · ${b.failed} échec(s)` : ""}
                  </p>
                </div>
                <AButton variant="ghost" onClick={() => removeHistory(b)} aria-label="Supprimer" className="!px-3 !text-red-700 hover:!bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </AButton>
              </motion.li>
            ))}
          </ul>
        )}
        <Pagination page={historyPg.page} pageCount={historyPg.pageCount} total={historyPg.total} size={historyPg.size} label="envois" onChange={(n) => { historyPg.setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
      </Panel>
    </>
  );
}
