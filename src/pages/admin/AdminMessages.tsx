import { useCallback, useEffect, useState } from "react";
import { Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import type { Message, MessageStatus } from "@/types";
import { AButton, PageIntro, Panel, Select, useFeedback } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

const STATUS: { value: MessageStatus; label: string; tone: string }[] = [
  { value: "new", label: "Nouveau", tone: "bg-rose/15 text-rose" },
  { value: "read", label: "Lu", tone: "bg-blush-deep text-wine" },
  { value: "responded", label: "Répondu", tone: "bg-emerald-100 text-emerald-800" },
  { value: "archived", label: "Archivé", tone: "bg-stone-200 text-stone-700" },
];

export default function AdminMessages() {
  const { toast, confirm } = useFeedback();
  const [messages, setMessages] = useState<Message[]>([]);
  const [filter, setFilter] = useState<MessageStatus | "">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.messages
      .list(filter || undefined)
      .then((res) => setMessages(res.data))
      .catch(() => toast("error", "Impossible de charger les messages."))
      .finally(() => setLoading(false));
  }, [filter, toast]);

  useEffect(load, [load]);

  const setStatus = async (m: Message, status: MessageStatus) => {
    try {
      await api.messages.updateStatus(m.id, status);
      load();
    } catch {
      toast("error", "Modification impossible.");
    }
  };

  const remove = async (m: Message) => {
    if (!(await confirm(`Supprimer le message de ${m.name} ?`))) return;
    try {
      await api.messages.delete(m.id);
      toast("success", "Message supprimé.");
      load();
    } catch {
      toast("error", "Suppression impossible.");
    }
  };

  return (
    <>
      <PageIntro
        title="Messages"
        text="Les demandes laissées depuis le formulaire de contact. Répondez directement sur WhatsApp ou par email."
        action={
          <Select value={filter} onChange={(e) => setFilter(e.target.value as MessageStatus | "")} aria-label="Filtrer par statut" className="sm:!w-52 !rounded-full">
            <option value="">Tous les statuts</option>
            {STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-blush-deep" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <Panel className="py-14 text-center">
          <p className="font-brand text-2xl text-wine">Aucun message.</p>
          <p className="mt-2 text-ink-soft">Les messages du formulaire de contact apparaîtront ici.</p>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const status = STATUS.find((s) => s.value === m.status);
            const phoneDigits = m.phone?.replace(/\D/g, "");
            return (
              <li key={m.id} className="rounded-2xl bg-white p-5 ring-1 ring-blush-edge/70">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-wine">{m.name}</p>
                    <p className="text-sm text-ink-soft">{new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </div>
                  <span className={cn("rounded-full px-3 py-1 text-sm font-medium", status?.tone)}>{status?.label}</span>
                </div>
                {m.message && <p className="mt-3 whitespace-pre-line leading-relaxed text-ink">{m.message}</p>}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {m.phone && (
                    <a
                      href={phoneDigits ? `https://wa.me/${phoneDigits}` : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-wine px-4 py-2 text-sm font-medium text-blush hover:bg-wine-deep"
                    >
                      <MessageCircle className="h-4 w-4" /> Répondre sur WhatsApp
                    </a>
                  )}
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="inline-flex items-center gap-2 rounded-full border border-blush-edge px-4 py-2 text-sm text-wine hover:bg-blush">
                      <Phone className="h-4 w-4" /> {m.phone}
                    </a>
                  )}
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 rounded-full border border-blush-edge px-4 py-2 text-sm text-wine hover:bg-blush">
                      <Mail className="h-4 w-4" /> {m.email}
                    </a>
                  )}
                  <span className="flex-1" />
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
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
