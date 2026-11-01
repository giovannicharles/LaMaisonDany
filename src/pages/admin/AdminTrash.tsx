import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import { AButton, PageIntro, Panel, useFeedback } from "@/components/admin/kit";
import Pagination, { usePagination } from "@/components/ui/Pagination";

type TrashData = Awaited<ReturnType<typeof api.trash.list>>["data"];
type Row = Record<string, unknown> & { id: number; deleted_at: string };

const SECTIONS: { type: keyof TrashData; label: string; name: (x: Record<string, unknown>) => string }[] = [
  { type: "products", label: "Produits", name: (x) => String(x.name ?? "") },
  { type: "categories", label: "Catégories", name: (x) => String(x.name ?? "") },
  { type: "messages", label: "Messages", name: (x) => `${x.name ?? ""}${x.message ? " : " + String(x.message).slice(0, 60) : ""}` },
  { type: "broadcasts", label: "Messages groupés", name: (x) => String(x.title || x.body || "").slice(0, 70) },
  { type: "pages", label: "Pages", name: (x) => String(x.title ?? "") },
];

function TrashSection({
  label,
  items,
  name,
  onRestore,
  onPurge,
}: {
  label: string;
  items: Row[];
  name: (x: Record<string, unknown>) => string;
  onRestore: (id: number) => void;
  onPurge: (id: number) => void;
}) {
  const pg = usePagination(items, 6);
  return (
    <Panel>
      <h2 className="font-brand text-2xl text-wine">
        {label} <span className="text-base text-ink-soft">({items.length})</span>
      </h2>
      <ul className="mt-4 divide-y divide-blush-edge/60">
        {pg.slice.map((item) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap items-center gap-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-wine">{name(item) || "Sans titre"}</p>
              <p className="text-sm text-ink-soft">Supprimé le {new Date(item.deleted_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</p>
            </div>
            <AButton variant="secondary" onClick={() => onRestore(item.id)}>
              <RotateCcw className="h-4 w-4" /> Restaurer
            </AButton>
            <AButton variant="ghost" onClick={() => onPurge(item.id)} aria-label="Supprimer définitivement" className="!px-3 !text-red-700 hover:!bg-red-50">
              <Trash2 className="h-4 w-4" />
            </AButton>
          </motion.li>
        ))}
      </ul>
      <Pagination page={pg.page} pageCount={pg.pageCount} total={pg.total} size={pg.size} onChange={pg.setPage} label="éléments" className="!mt-5" />
    </Panel>
  );
}

export default function AdminTrash({ onChanged }: { onChanged?: () => void }) {
  const { toast, confirm } = useFeedback();
  const [data, setData] = useState<TrashData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    api.trash
      .list()
      .then((r) => setData(r.data))
      .catch(() => toast("error", "Impossible de charger la corbeille."))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const restore = async (type: string, id: number) => {
    if (!(await confirm("Restaurer cet élément ? Il réapparaîtra sur le site et dans l'administration.", "Restaurer"))) return;
    try {
      await api.trash.restore(type, id);
      toast("success", "Élément restauré.");
      load();
      onChanged?.();
    } catch {
      toast("error", "Restauration impossible.");
    }
  };

  const purge = async (type: string, id: number) => {
    if (!(await confirm("Supprimer définitivement cet élément ? Cette action est irréversible.", "Supprimer définitivement"))) return;
    try {
      await api.trash.purge(type, id);
      toast("success", "Élément supprimé définitivement.");
      load();
    } catch {
      toast("error", "Suppression impossible.");
    }
  };

  const total = data ? SECTIONS.reduce((n, s) => n + data[s.type].length, 0) : 0;

  return (
    <>
      <PageIntro title="Corbeille" text="Tout ce qui est supprimé arrive ici. Vous pouvez le restaurer à tout moment ou le supprimer définitivement." />

      {loading ? (
        <div role="status" aria-label="Chargement" className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="lmd-skel h-20 rounded-2xl" />
          ))}
        </div>
      ) : total === 0 ? (
        <Panel className="py-14 text-center">
          <p className="font-brand text-2xl text-wine">La corbeille est vide.</p>
          <p className="mt-2 text-ink-soft">Les produits, catégories et messages supprimés apparaîtront ici.</p>
        </Panel>
      ) : (
        <div className="space-y-6">
          {SECTIONS.filter((s) => data![s.type].length > 0).map((s) => (
            <TrashSection
              key={s.type}
              label={s.label}
              name={s.name}
              items={data![s.type] as unknown as Row[]}
              onRestore={(id) => restore(s.type, id)}
              onPurge={(id) => purge(s.type, id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
