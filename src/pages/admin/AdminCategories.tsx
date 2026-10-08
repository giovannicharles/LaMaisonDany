import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { api } from "@/api/client";
import type { Category } from "@/types";
import { AButton, PageIntro, Panel, TextInput, useFeedback } from "@/components/admin/kit";

export default function AdminCategories() {
  const { toast, confirm } = useFeedback();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(() => {
    api.categories
      .list()
      .then((res) => setCategories(res.data))
      .catch(() => toast("error", "Impossible de charger les catégories."))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(load, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.categories.create({ name: name.trim() });
      setName("");
      toast("success", "Catégorie ajoutée.");
      load();
    } catch (err) {
      toast("error", err instanceof Error && /duplicate|unique/i.test(err.message) ? "Cette catégorie existe déjà." : "Ajout impossible.");
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    try {
      await api.categories.reorder(next.map((c) => c.id));
    } catch {
      toast("error", "L'ordre n'a pas pu être enregistré.");
      load();
    }
  };

  const rename = async (id: number) => {
    if (!editName.trim()) return;
    try {
      await api.categories.update(id, { name: editName.trim() });
      setEditingId(null);
      toast("success", "Catégorie renommée.");
      load();
    } catch {
      toast("error", "Modification impossible.");
    }
  };

  const remove = async (c: Category) => {
    const count = Number(c.product_count ?? 0);
    const msg =
      count > 0
        ? `Supprimer « ${c.name} » ? Ses ${count} produit(s) seront conservés mais sans catégorie.`
        : `Supprimer la catégorie « ${c.name} » ?`;
    if (!(await confirm(msg))) return;
    try {
      await api.categories.delete(c.id);
      toast("success", "Catégorie supprimée.");
      load();
    } catch {
      toast("error", "Suppression impossible.");
    }
  };

  return (
    <>
      <PageIntro
        title="Catégories"
        text="Parfums, cosmétiques, vins, autres… Créez les rayons de votre boutique. L'ordre ci-dessous est celui de la page d'accueil et des filtres."
      />

      <Panel className="mb-6">
        <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom de la nouvelle catégorie (ex. Vins)" aria-label="Nom de la catégorie" />
          <AButton type="submit" disabled={!name.trim()} className="sm:shrink-0">
            <Plus className="h-5 w-5" /> Ajouter
          </AButton>
        </form>
      </Panel>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-blush-deep" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <Panel className="py-14 text-center">
          <p className="font-brand text-2xl text-wine">Aucune catégorie.</p>
          <p className="mt-2 text-ink-soft">Ajoutez par exemple « Parfums », « Cosmétiques » et « Vins ».</p>
        </Panel>
      ) : (
        <ul className="space-y-3">
          {categories.map((c, index) => (
            <li key={c.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-blush-edge/70">
              {editingId === c.id ? (
                <>
                  <TextInput
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && rename(c.id)}
                    aria-label="Nouveau nom"
                    autoFocus
                  />
                  <button onClick={() => rename(c.id)} aria-label="Valider" className="rounded-full p-2.5 text-wine hover:bg-blush-deep">
                    <Check className="h-5 w-5" />
                  </button>
                  <button onClick={() => setEditingId(null)} aria-label="Annuler" className="rounded-full p-2.5 text-ink-soft hover:bg-blush-deep">
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-wine">{c.name}</p>
                    <p className="text-sm text-ink-soft">{Number(c.product_count ?? 0)} produit(s)</p>
                  </div>
                  <button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Monter ${c.name}`} className="rounded-full p-2.5 text-ink-soft hover:bg-blush-deep disabled:opacity-30">
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === categories.length - 1} aria-label={`Descendre ${c.name}`} className="rounded-full p-2.5 text-ink-soft hover:bg-blush-deep disabled:opacity-30">
                    <ArrowDown className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditName(c.name);
                    }}
                    aria-label={`Renommer ${c.name}`}
                    className="rounded-full p-2.5 text-wine hover:bg-blush-deep"
                  >
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button onClick={() => remove(c)} aria-label={`Supprimer ${c.name}`} className="rounded-full p-2.5 text-red-700 hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
