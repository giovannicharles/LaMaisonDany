import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Pagination, { usePagination } from "@/components/ui/Pagination";
import { Archive, CheckCheck, Mail, MessageCircle, Package, Phone, Search, StickyNote, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import type { Message, MessageCounts, MessageStatus } from "@/types";
import { AButton, PageIntro, Panel, Select, TextArea, TextInput, useFeedback } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

const STATUS: { value: MessageStatus; label: string; tone: string }[] = [
  { value: "new", label: "Nouveau", tone: "bg-rose/15 text-rose" },
  { value: "read", label: "Lu", tone: "bg-blush-deep text-wine" },
  { value: "responded", label: "Répondu", tone: "bg-emerald-100 text-emerald-800" },
  { value: "archived", label: "Archivé", tone: "bg-stone-200 text-stone-700" },
];

type Tab = MessageStatus | "all";

const ago = (iso: string) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 3600) return `il y a ${Math.max(1, Math.round(s / 60))} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  if (s < 86400 * 7) return `il y a ${Math.round(s / 86400)} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

export default function AdminMessages({ goTo, onChanged }: { goTo?: (key: string) => void; onChanged?: () => void }) {
  const { toast, confirm } = useFeedback();
  const [messages, setMessages] = useState<Message[]>([]);
  const [counts, setCounts] = useState<MessageCounts | null>(null);
  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openNote, setOpenNote] = useState<number | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(() => {
    api.messages
      .list(tab === "all" ? undefined : tab, { q: query })
      .then((res) => setMessages(res.data))
      .catch(() => toast("error", "Impossible de charger les messages."))
      .finally(() => setLoading(false));
    api.messages.counts().then((r) => setCounts(r.data)).catch(() => {});
  }, [tab, query, toast]);

  useEffect(load, [load]);
  useEffect(() => setSelected(new Set()), [tab, query]);

  const refresh = () => {
    load();
    onChanged?.();
  };

  const setStatus = async (m: Message, status: MessageStatus) => {
    try {
      await api.messages.update(m.id, { status });
      refresh();
    } catch {
      toast("error", "Modification impossible.");
    }
  };

  const saveNote = async (m: Message) => {
    try {
      await api.messages.update(m.id, { admin_note: noteDraft });
      toast("success", "Note enregistrée.");
      setOpenNote(null);
      load();
    } catch {
      toast("error", "Enregistrement impossible.");
    }
  };

  const remove = async (m: Message) => {
    if (!(await confirm(`Supprimer le message de ${m.name} ? Il sera placé dans la corbeille.`))) return;
    try {
      await api.messages.bulk([m.id], "delete");
      toast("success", "Message placé dans la corbeille.");
      refresh();
    } catch {
      toast("error", "Suppression impossible.");
    }
  };

  const bulk = async (action: "read" | "responded" | "archive" | "delete") => {
    const ids = [...selected];
    if (!ids.length) return;
    if (action === "delete" && !(await confirm(`Supprimer ${ids.length} message(s) ? Ils seront placés dans la corbeille.`))) return;
    if (action === "archive" && !(await confirm(`Archiver ${ids.length} message(s) ?`, "Archiver"))) return;
    try {
      await api.messages.bulk(ids, action);
      toast("success", action === "delete" ? "Messages placés dans la corbeille." : "Messages mis à jour.");
      setSelected(new Set());
      refresh();
    } catch {
      toast("error", "Action impossible.");
    }
  };

  const toggle = (id: number) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const pg = usePagination(messages, 8, `${tab}|${query}`);
  const allSelected = messages.length > 0 && selected.size === messages.length;

  const tabs = useMemo(
    () => [
      { id: "all" as Tab, label: "Tous", n: counts?.total },
      { id: "new" as Tab, label: "Nouveaux", n: counts?.new },
      { id: "read" as Tab, label: "Lus", n: counts?.read },
      { id: "responded" as Tab, label: "Répondus", n: counts?.responded },
      { id: "archived" as Tab, label: "Archivés", n: counts?.archived },
    ],
    [counts]
  );

  return (
    <>
      <PageIntro
        title="Messages"
        text="Les demandes laissées depuis le formulaire de contact. Répondez sur WhatsApp ou par email, classez et gardez une note."
        action={
          <div className="flex flex-wrap gap-2">
            <AButton variant="secondary" onClick={() => goTo?.("broadcast")}>
              Envoyer un message groupé
            </AButton>
            <AButton variant="ghost" onClick={() => goTo?.("trash")}>
              <Trash2 className="h-4 w-4" /> Corbeille{counts?.trash ? ` (${counts.trash})` : ""}
            </AButton>
          </div>
        }
      />

      <div role="tablist" aria-label="Statut des messages" className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2.5 text-[0.95rem] font-medium transition-colors",
              tab === t.id ? "bg-wine text-blush" : "bg-white text-ink-soft ring-1 ring-blush-edge/70 hover:text-wine"
            )}
          >
            {t.label}
            {t.n != null && <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs", tab === t.id ? "bg-blush/20" : "bg-blush-deep")}>{t.n}</span>}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un nom, un numéro, un mot du message" aria-label="Rechercher dans les messages" className="!rounded-full !pl-11" />
        </div>
        {messages.length > 0 && (
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={() => setSelected(allSelected ? new Set() : new Set(messages.map((m) => m.id)))}
              className="h-5 w-5 accent-[var(--color-wine)]"
            />
            Tout sélectionner
          </label>
        )}
      </div>

      {selected.size > 0 && (
        <div className="sticky top-16 z-20 mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-wine p-3 text-blush shadow-lg">
          <span className="px-2 text-sm font-medium">{selected.size} sélectionné(s)</span>
          <span className="flex-1" />
          <button onClick={() => bulk("read")} className="inline-flex items-center gap-2 rounded-full bg-blush/15 px-4 py-2 text-sm hover:bg-blush/25">
            <CheckCheck className="h-4 w-4" /> Marquer lus
          </button>
          <button onClick={() => bulk("responded")} className="inline-flex items-center gap-2 rounded-full bg-blush/15 px-4 py-2 text-sm hover:bg-blush/25">
            <MessageCircle className="h-4 w-4" /> Répondus
          </button>
          <button onClick={() => bulk("archive")} className="inline-flex items-center gap-2 rounded-full bg-blush/15 px-4 py-2 text-sm hover:bg-blush/25">
            <Archive className="h-4 w-4" /> Archiver
          </button>
          <button onClick={() => bulk("delete")} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm text-[#fff] hover:bg-red-800">
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        </div>
      )}

      {loading ? (
        <div role="status" aria-label="Chargement" className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="lmd-skel h-28 rounded-2xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Panel className="py-14 text-center">
          <p className="font-brand text-2xl text-wine">{query || tab !== "all" ? "Aucun message ne correspond." : "Aucun message."}</p>
          <p className="mt-2 text-ink-soft">Les messages du formulaire de contact apparaîtront ici.</p>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {pg.slice.map((m) => {
            const status = STATUS.find((s) => s.value === m.status);
            const digits = m.phone?.replace(/\D/g, "");
            const reply = `Bonjour ${m.name}, merci pour votre message sur LaMaison Dany. `;
            return (
              <motion.li key={m.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className={cn("rounded-2xl bg-white p-5 ring-1 transition-colors", m.status === "new" ? "ring-rose/60" : "ring-blush-edge/70", selected.has(m.id) && "bg-blush")}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.has(m.id)}
                    onChange={() => toggle(m.id)}
                    aria-label={`Sélectionner le message de ${m.name}`}
                    className="mt-1.5 h-5 w-5 shrink-0 accent-[var(--color-wine)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-2 font-medium text-wine">
                          {m.status === "new" && <span aria-label="non lu" className="h-2.5 w-2.5 rounded-full bg-rose" />}
                          {m.name}
                        </p>
                        <p className="text-sm text-ink-soft" title={new Date(m.created_at).toLocaleString("fr-FR")}>
                          {ago(m.created_at)}
                        </p>
                      </div>
                      <span className={cn("rounded-full px-3 py-1 text-sm font-medium", status?.tone)}>{status?.label}</span>
                    </div>

                    {m.product_name && (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blush px-3 py-1 text-sm text-wine">
                        <Package className="h-3.5 w-3.5" /> À propos de : {m.product_name}
                      </p>
                    )}
                    {m.message && <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{m.message}</p>}
                    {m.admin_note && openNote !== m.id && (
                      <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        <StickyNote className="mt-0.5 h-4 w-4 shrink-0" /> {m.admin_note}
                      </p>
                    )}

                    {openNote === m.id && (
                      <div className="mt-3 space-y-2">
                        <TextArea rows={2} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Note interne (visible uniquement par l'équipe)" aria-label="Note interne" />
                        <div className="flex gap-2">
                          <AButton onClick={() => saveNote(m)}>Enregistrer la note</AButton>
                          <AButton variant="secondary" onClick={() => setOpenNote(null)}>
                            Annuler
                          </AButton>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {digits && (
                        <a
                          href={`https://wa.me/${digits}?text=${encodeURIComponent(reply)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => m.status !== "responded" && setStatus(m, "responded")}
                          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-wine px-4 py-2 text-sm font-medium text-blush hover:bg-wine-deep"
                        >
                          <MessageCircle className="h-4 w-4" /> Répondre sur WhatsApp
                        </a>
                      )}
                      {m.phone && (
                        <a href={`tel:${m.phone}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-blush-edge px-4 py-2 text-sm text-wine hover:bg-blush">
                          <Phone className="h-4 w-4" /> {m.phone}
                        </a>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-blush-edge px-4 py-2 text-sm text-wine hover:bg-blush">
                          <Mail className="h-4 w-4" /> {m.email}
                        </a>
                      )}
                      <span className="flex-1" />
                      <button
                        onClick={() => {
                          setOpenNote(m.id);
                          setNoteDraft(m.admin_note ?? "");
                        }}
                        aria-label="Ajouter une note"
                        title="Note interne"
                        className="rounded-full p-2.5 text-wine hover:bg-blush-deep"
                      >
                        <StickyNote className="h-4 w-4" />
                      </button>
                      <Select value={m.status} onChange={(e) => setStatus(m, e.target.value as MessageStatus)} aria-label="Statut du message" className="!w-auto !rounded-full !py-2 !text-sm">
                        {STATUS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </Select>
                      <AButton variant="ghost" onClick={() => remove(m)} aria-label="Supprimer" className="!px-3 !text-red-700 hover:!bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </AButton>
                    </div>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
      <Pagination page={pg.page} pageCount={pg.pageCount} total={pg.total} size={pg.size} label="messages" onChange={(n) => { pg.setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    </>
  );
}
