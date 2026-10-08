import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowUp, Copy, ImagePlus, ListOrdered, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { api } from "@/api/client";
import type { Category, Product } from "@/types";
import { artKindFor, ProductArt } from "@/components/art/Bottles";
import { AButton, Field, Modal, PageIntro, Panel, Select, TextArea, TextInput, Toggle, useFeedback } from "@/components/admin/kit";
import { cn, formatPrice } from "@/lib/utils";
import { optimizeImage } from "@/lib/images";

interface FormState {
  name: string;
  description: string;
  price: string;
  photos: string[];
  category_id: string;
  featured: boolean;
  available: boolean;
  sort_order: string;
}

const EMPTY: FormState = {
  name: "",
  description: "",
  price: "",
  photos: [],
  category_id: "",
  featured: false,
  available: true,
  sort_order: "0",
};

export default function AdminProducts() {
  const { toast, confirm } = useFeedback();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reordering, setReordering] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api.products
      .list()
      .then((res) => setProducts(res.data))
      .catch(() => toast("error", "Impossible de charger les produits."))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    load();
    api.categories.list().then((res) => setCategories(res.data)).catch(() => {});
  }, [load]);

  const visible = useMemo(() => {
    if (reordering) return products;
    const q = search.trim().toLowerCase();
    return products.filter(
      (p) => (!filter || String(p.category_id) === filter) && (!q || p.name.toLowerCase().includes(q))
    );
  }, [products, search, filter, reordering]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, category_id: filter });
    setShowForm(true);
  };

  const openDuplicate = (p: Product) => {
    setEditing(null);
    setForm({
      name: `${p.name} (copie)`,
      description: p.description || "",
      price: p.price != null ? String(p.price) : "",
      photos: [],
      category_id: p.category_id != null ? String(p.category_id) : "",
      featured: false,
      available: p.available !== false,
      sort_order: String(p.sort_order ?? 0),
    });
    setShowForm(true);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= products.length) return;
    const next = [...products];
    [next[index], next[target]] = [next[target], next[index]];
    setProducts(next);
    try {
      await api.products.reorder(next.map((p) => p.id));
    } catch {
      toast("error", "L'ordre n'a pas pu être enregistré.");
      load();
    }
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price != null ? String(p.price) : "",
      photos: [p.image_url, ...(p.images ?? [])].filter((u): u is string => Boolean(u)),
      category_id: p.category_id != null ? String(p.category_id) : "",
      featured: p.featured,
      available: p.available !== false,
      sort_order: String(p.sort_order ?? 0),
    });
    setShowForm(true);
  };

  const uploadMany = async (list?: FileList | File[] | null) => {
    const files = Array.from(list ?? []);
    if (files.length === 0) return;
    setUploading(true);
    let sent = 0;
    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast("error", `« ${file.name} » n'est pas une image.`);
        continue;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast("error", `« ${file.name} » dépasse 8 Mo. Réduisez-la puis réessayez.`);
        continue;
      }
      try {
        const res = await api.media.upload(file);
        setForm((f) => (f.photos.length >= 9 ? f : { ...f, photos: [...f.photos, res.data.url] }));
        sent += 1;
      } catch {
        toast("error", `L'envoi de « ${file.name} » a échoué.`);
      }
    }
    if (sent > 0) toast("success", sent > 1 ? `${sent} photos envoyées.` : "Photo envoyée.");
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const makeMain = (index: number) =>
    setForm((f) => ({ ...f, photos: [f.photos[index], ...f.photos.filter((_, i) => i !== index)] }));

  const removePhoto = (index: number) => setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: form.price ? Number(form.price) : null,
      image_url: form.photos[0] ?? "",
      images: form.photos.slice(1),
      category_id: form.category_id ? Number(form.category_id) : null,
      featured: form.featured,
      available: form.available,
      sort_order: Number(form.sort_order) || 0,
    };
    try {
      if (editing) await api.products.update(editing.id, data);
      else await api.products.create(data);
      toast("success", editing ? "Produit mis à jour." : "Produit ajouté.");
      setShowForm(false);
      load();
    } catch (err) {
      toast("error", err instanceof Error ? `Enregistrement impossible : ${err.message}` : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    if (!(await confirm(`Supprimer « ${p.name} » ? Cette action est définitive.`))) return;
    try {
      await api.products.delete(p.id);
      toast("success", "Produit supprimé.");
      load();
    } catch {
      toast("error", "Suppression impossible.");
    }
  };

  const toggleFeatured = async (p: Product) => {
    try {
      await api.products.update(p.id, { featured: !p.featured });
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, featured: !p.featured } : x)));
    } catch {
      toast("error", "Modification impossible.");
    }
  };

  return (
    <>
      <PageIntro
        title="Produits"
        text="Ajoutez vos produits, leurs photos et leurs prix. Les modifications apparaissent tout de suite sur le site."
        action={
          <div className="flex flex-wrap gap-2">
            <AButton variant="secondary" onClick={() => setReordering((r) => !r)} aria-pressed={reordering}>
              <ListOrdered className="h-5 w-5" /> {reordering ? "Terminer" : "Réorganiser"}
            </AButton>
            <AButton onClick={openCreate}>
              <Plus className="h-5 w-5" /> Nouveau produit
            </AButton>
          </div>
        }
      />

      {reordering && (
        <p className="mb-4 rounded-xl bg-white px-4 py-3 text-[0.95rem] text-ink-soft ring-1 ring-blush-edge/70">
          Utilisez les flèches pour changer l'ordre d'affichage sur le site. L'ordre est enregistré automatiquement.
        </p>
      )}

      <div className={cn("mb-5 flex flex-col gap-3 sm:flex-row", reordering && "hidden")}>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit"
            aria-label="Rechercher un produit"
            className="lmd-field !rounded-full !py-2.5 !pl-11"
          />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filtrer par catégorie" className="sm:!w-56 !rounded-full">
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-blush-deep" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Panel className="py-16 text-center">
          <p className="font-brand text-2xl text-wine">{products.length === 0 ? "Aucun produit pour le moment." : "Aucun résultat."}</p>
          <p className="mt-2 text-ink-soft">
            {products.length === 0 ? "Commencez par ajouter votre premier produit avec sa photo." : "Essayez une autre recherche ou catégorie."}
          </p>
          {products.length === 0 && (
            <AButton onClick={openCreate} className="mt-6">
              <Plus className="h-5 w-5" /> Ajouter un produit
            </AButton>
          )}
        </Panel>
      ) : (
        <ul className="space-y-3">
          {visible.map((p, index) => (
            <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 ring-1 ring-blush-edge/70">
              <div className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-xl bg-blush-deep">
                {p.image_url ? (
                  <img src={optimizeImage(p.image_url, 200)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ProductArt seed={p.id} kind={artKindFor(p.category_name, p.category_slug)} className="h-[86%] w-auto max-w-[80%]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-wine">{p.name}</p>
                <p className="text-sm text-ink-soft">
                  {p.category_name || "Sans catégorie"} · {formatPrice(p.price)}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {!p.image_url && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900">Photo manquante</span>}
                  {p.available === false && <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-800">Indisponible</span>}
                </div>
              </div>
              {reordering ? (
                <>
                  <button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Monter ${p.name}`} className="rounded-full p-2.5 text-wine hover:bg-blush-deep disabled:opacity-30">
                    <ArrowUp className="h-5 w-5" />
                  </button>
                  <button onClick={() => move(index, 1)} disabled={index === visible.length - 1} aria-label={`Descendre ${p.name}`} className="rounded-full p-2.5 text-wine hover:bg-blush-deep disabled:opacity-30">
                    <ArrowDown className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => toggleFeatured(p)}
                    aria-pressed={p.featured}
                    aria-label={p.featured ? "Retirer des coups de cœur" : "Mettre en coup de cœur"}
                    title={p.featured ? "Retirer des coups de cœur" : "Mettre en coup de cœur"}
                    className={cn("rounded-full p-2.5 transition-colors", p.featured ? "bg-rose/15 text-rose" : "text-ink-soft hover:bg-blush-deep")}
                  >
                    <Star className={cn("h-5 w-5", p.featured && "fill-current")} />
                  </button>
                  <button onClick={() => openEdit(p)} aria-label={`Modifier ${p.name}`} title="Modifier" className="rounded-full p-2.5 text-wine hover:bg-blush-deep">
                    <Pencil className="h-5 w-5" />
                  </button>
                  <button onClick={() => openDuplicate(p)} aria-label={`Dupliquer ${p.name}`} title="Dupliquer" className="hidden rounded-full p-2.5 text-wine hover:bg-blush-deep sm:block">
                    <Copy className="h-5 w-5" />
                  </button>
                  <button onClick={() => remove(p)} aria-label={`Supprimer ${p.name}`} title="Supprimer" className="rounded-full p-2.5 text-red-700 hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <AnimatePresence>
        {showForm && (
          <Modal title={editing ? "Modifier le produit" : "Nouveau produit"} onClose={() => setShowForm(false)} wide>
            <form onSubmit={submit} className="space-y-5">
              <Field label="Photos du produit" hint="La première photo est la principale. JPG, PNG ou WebP, 8 Mo maximum chacune, 9 photos au plus.">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    uploadMany(e.dataTransfer.files);
                  }}
                  className={cn(
                    "rounded-2xl border-2 border-dashed p-4 transition-colors",
                    dragging ? "border-rose bg-blush-deep" : "border-blush-edge bg-white/60"
                  )}
                >
                  {form.photos.length > 0 && (
                    <ul className="mb-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {form.photos.map((url, i) => (
                        <li key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-blush-deep">
                          <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                          {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-wine px-2 py-0.5 text-xs text-blush">Principale</span>}
                          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-wine-deep/80 to-transparent p-1.5">
                            {i > 0 ? (
                              <button
                                type="button"
                                onClick={() => makeMain(i)}
                                aria-label={`Définir la photo ${i + 1} comme principale`}
                                title="Définir comme photo principale"
                                className="rounded-full bg-blush p-1 text-wine"
                              >
                                <Star className="h-4 w-4" />
                              </button>
                            ) : (
                              <span />
                            )}
                            <button type="button" onClick={() => removePhoto(i)} aria-label={`Retirer la photo ${i + 1}`} className="rounded-full bg-blush p-1 text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center gap-4">
                    {form.photos.length === 0 && (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-blush-deep">
                        <ImagePlus className="h-8 w-8 text-rose" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.95rem] text-ink">Glissez vos photos ici ou</p>
                      <div className="mt-2">
                        <AButton type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={uploading || form.photos.length >= 9}>
                          {uploading ? "Envoi en cours..." : form.photos.length ? "Ajouter des photos" : "Choisir des photos"}
                        </AButton>
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadMany(e.target.files)} />
                    </div>
                  </div>
                </div>
              </Field>

              <Field label="Nom du produit *" htmlFor="p-name">
                <TextInput id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Catégorie" htmlFor="p-cat">
                  <Select id="p-cat" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">Aucune</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Prix indicatif" htmlFor="p-price" hint="Laissez vide pour afficher « Prix sur demande ».">
                  <TextInput id="p-price" type="number" min="0" step="any" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </Field>
              </div>

              <Field label="Description" htmlFor="p-desc">
                <TextArea id="p-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} />
              </Field>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Position d'affichage" htmlFor="p-order" hint="Plus petit = affiché en premier.">
                  <TextInput id="p-order" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </Field>
                <div className="space-y-4 sm:pt-7">
                  <Toggle checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} label="Coup de cœur (page d'accueil)" />
                  <Toggle checked={form.available} onChange={(v) => setForm({ ...form, available: v })} label="Disponible" />
                </div>
              </div>

              <div className="sticky -bottom-6 -mx-6 -mb-6 flex justify-end gap-3 border-t border-blush-edge/70 bg-blush px-6 py-4">
                <AButton type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Annuler
                </AButton>
                <AButton type="submit" disabled={saving || uploading || !form.name.trim()}>
                  {saving ? "Enregistrement..." : editing ? "Enregistrer" : "Ajouter le produit"}
                </AButton>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
