import { useEffect, useState } from "react";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Circle, Eye, ImageOff, MessageCircleQuestion, MessageSquare, Package, Tags } from "lucide-react";
import { api, type Stats } from "@/api/client";
import type { Category, Message, Product } from "@/types";
import { PageIntro, Panel } from "@/components/admin/kit";
import WhatsAppIcon from "@/components/public/WhatsAppIcon";
import { optimizeImage } from "@/lib/images";
import { cn } from "@/lib/utils";

interface Props {
  goTo: (key: string) => void;
}

function Delta({ now, before }: { now: number; before: number }) {
  if (now === 0 && before === 0) return <span className="text-sm text-ink-soft">Pas encore de données</span>;
  if (before === 0) return <span className="text-sm text-ink-soft">Nouveau sur la période</span>;
  const pct = Math.round(((now - before) / before) * 100);
  const up = pct >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-medium", up ? "text-emerald-700" : "text-red-700")}>
      <Icon className="h-4 w-4" />
      {up ? "+" : ""}
      {pct}% vs période précédente
    </span>
  );
}

export default function AdminDashboard({ goTo }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [whatsappSet, setWhatsappSet] = useState(false);

  useEffect(() => {
    api.products.list().then((r) => setProducts(r.data)).catch(() => {});
    api.categories.list().then((r) => setCategories(r.data)).catch(() => {});
    api.messages.list().then((r) => setMessages(r.data)).catch(() => {});
    api.stats.get(30).then((r) => setStats(r.data)).catch(() => {});
    api.settings
      .get()
      .then((r) => setWhatsappSet(Boolean((r.data as { general?: { whatsapp_number?: string } })?.general?.whatsapp_number)))
      .catch(() => {});
  }, []);

  const withoutPhoto = products.filter((p) => !p.image_url).length;
  const newMessages = messages.filter((m) => m.status === "new").length;

  const cards = [
    { label: "Produits", value: products.length, icon: Package, go: "products" },
    { label: "Catégories", value: categories.length, icon: Tags, go: "categories" },
    { label: "Sans photo", value: withoutPhoto, icon: ImageOff, go: "products", warn: withoutPhoto > 0 },
    { label: "Nouveaux messages", value: newMessages, icon: MessageSquare, go: "messages", warn: newMessages > 0 },
  ];

  const steps = [
    { done: whatsappSet, label: "Renseigner le numéro WhatsApp", hint: "Sans lui, les boutons du site n'ouvrent aucune conversation.", go: "content" },
    { done: categories.length > 0, label: "Créer les catégories (parfums, cosmétiques, vins…)", hint: "", go: "categories" },
    { done: products.length > 0 && withoutPhoto === 0, label: "Ajouter les produits avec leurs photos", hint: withoutPhoto > 0 ? `${withoutPhoto} produit(s) sans photo.` : "", go: "products" },
    { done: products.some((p) => p.featured), label: "Choisir les coups de cœur de l'accueil", hint: "Étoile à droite de chaque produit.", go: "products" },
  ];
  const remaining = steps.filter((s) => !s.done).length;

  const requests = stats?.totals.whatsapp_request ?? 0;
  const views = stats?.totals.product_view ?? 0;
  const handoffs = stats?.totals.chat_handoff ?? 0;
  const maxDaily = Math.max(1, ...(stats?.daily.map((d) => d.requests) ?? [1]));

  return (
    <>
      <PageIntro title="Tableau de bord" text="Un coup d'œil sur votre boutique et ce qu'il reste à faire." />

      <ul className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, go, warn }) => (
          <li key={label}>
            <button
              onClick={() => goTo(go)}
              className="w-full rounded-2xl bg-white p-5 text-left ring-1 ring-blush-edge/70 transition-all hover:-translate-y-0.5 hover:ring-rose"
            >
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-full", warn ? "bg-amber-100 text-amber-800" : "bg-blush-deep text-wine")}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-4xl font-semibold tabular-nums text-wine">{value}</p>
              <p className="text-sm text-ink-soft">{label}</p>
            </button>
          </li>
        ))}
      </ul>

      <Panel className="mb-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-brand text-2xl text-wine">Activité des 30 derniers jours</h2>
            <p className="mt-1 text-sm text-ink-soft">Ce que font vos visiteurs, sans aucune donnée personnelle.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <ul className="grid grid-cols-3 gap-3">
              <li className="rounded-2xl bg-blush p-4">
                <WhatsAppIcon className="h-5 w-5 text-wine" />
                <p className="mt-3 text-3xl font-semibold tabular-nums text-wine">{requests}</p>
                <p className="text-sm text-ink-soft">Demandes WhatsApp</p>
              </li>
              <li className="rounded-2xl bg-blush p-4">
                <Eye className="h-5 w-5 text-wine" />
                <p className="mt-3 text-3xl font-semibold tabular-nums text-wine">{views}</p>
                <p className="text-sm text-ink-soft">Fiches vues</p>
              </li>
              <li className="rounded-2xl bg-blush p-4">
                <MessageCircleQuestion className="h-5 w-5 text-wine" />
                <p className="mt-3 text-3xl font-semibold tabular-nums text-wine">{handoffs}</p>
                <p className="text-sm text-ink-soft">Chatbot → WhatsApp</p>
              </li>
            </ul>
            <p className="mt-3">
              <Delta now={requests} before={stats?.previous.whatsapp_request ?? 0} />
            </p>

            <div className="mt-5" role="img" aria-label="Demandes WhatsApp par jour sur les 30 derniers jours">
              <div className="flex h-28 items-end gap-[3px]">
                {(stats?.daily ?? []).map((d) => (
                  <div
                    key={d.day}
                    title={`${new Date(d.day).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} : ${d.requests}`}
                    className={cn("flex-1 rounded-t-sm", d.requests > 0 ? "bg-wine" : "bg-blush-edge/60")}
                    style={{ height: `${Math.max(4, (d.requests / maxDaily) * 100)}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-soft">Demandes WhatsApp par jour</p>
            </div>
          </div>

          <div>
            <h3 className="font-brand text-xl text-wine">Produits les plus demandés</h3>
            {!stats || stats.top_products.length === 0 ? (
              <p className="mt-3 text-ink-soft">Les produits les plus consultés et demandés apparaîtront ici dès que des visiteurs utiliseront le site.</p>
            ) : (
              <ol className="mt-3 space-y-2">
                {stats.top_products.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl bg-blush p-2.5">
                    <span className="w-5 text-center font-semibold text-rose">{i + 1}</span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-blush-deep">
                      {p.image_url ? <img src={optimizeImage(p.image_url, 120)} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 text-rose" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-wine">{p.name}</span>
                      <span className="block text-sm text-ink-soft">
                        {p.requests} demande(s) · {p.views} vue(s)
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-brand text-2xl text-wine">Mise en route</h2>
          <p className="mt-1 text-sm text-ink-soft">{remaining === 0 ? "Tout est prêt, bravo." : `${remaining} étape(s) restante(s).`}</p>
          <ul className="mt-5 space-y-2">
            {steps.map((s) => (
              <li key={s.label}>
                <button onClick={() => goTo(s.go)} className="flex w-full items-start gap-3 rounded-xl p-3 text-left hover:bg-blush">
                  {s.done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-rose" />}
                  <span>
                    <span className={cn("block font-medium", s.done ? "text-ink-soft line-through" : "text-wine")}>{s.label}</span>
                    {!s.done && s.hint && <span className="block text-sm text-ink-soft">{s.hint}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-brand text-2xl text-wine">Derniers messages</h2>
          {messages.length === 0 ? (
            <p className="mt-4 text-ink-soft">Aucun message pour le moment.</p>
          ) : (
            <ul className="mt-4 divide-y divide-blush-edge/60">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", m.status === "new" ? "bg-rose" : "bg-blush-edge")} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-wine">{m.name}</p>
                    <p className="truncate text-sm text-ink-soft">{m.message || m.phone || m.email}</p>
                  </div>
                  <span className="text-sm text-ink-soft">{new Date(m.created_at).toLocaleDateString("fr-FR")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
