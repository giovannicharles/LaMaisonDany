import { useState, type ReactNode } from "react";
import {
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PenLine,
  UserRound,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FeedbackProvider } from "./kit";

export const ADMIN_SECTIONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { key: "products", label: "Produits", icon: Package },
  { key: "categories", label: "Catégories", icon: Tags },
  { key: "content", label: "Contenu du site", icon: PenLine },
  { key: "pages", label: "Pages", icon: FileText },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "account", label: "Mon compte", icon: UserRound },
];

interface AdminLayoutProps {
  selected: string;
  setSelected: (key: string) => void;
  onLogout: () => void;
  newMessages: number;
  children: ReactNode;
}

export default function AdminLayout({ selected, setSelected, onLogout, newMessages, children }: AdminLayoutProps) {
  const [open, setOpen] = useState(false);
  const current = ADMIN_SECTIONS.find((s) => s.key === selected);

  const nav = (
    <nav className="flex h-full flex-col" aria-label="Administration">
      <div className="px-5 pb-6 pt-6">
        <p className="font-brand text-2xl leading-none text-wine">
          LaMaison <span className="italic text-rose">Dany</span>
        </p>
        <p className="mt-1 text-sm text-ink-soft">Administration</p>
      </div>

      <ul className="flex-1 space-y-1 px-3">
        {ADMIN_SECTIONS.map(({ key, label, icon: Icon }) => {
          const active = selected === key;
          return (
            <li key={key}>
              <button
                onClick={() => {
                  setSelected(key);
                  setOpen(false);
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[0.95rem] font-medium transition-colors",
                  active ? "bg-wine text-blush" : "text-ink-soft hover:bg-blush-deep hover:text-wine"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.7} />
                {label}
                {key === "messages" && newMessages > 0 && (
                  <span className={cn("ml-auto rounded-full px-2 py-0.5 text-xs", active ? "bg-blush text-wine" : "bg-rose text-white")}>
                    {newMessages}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="space-y-1 border-t border-blush-edge/70 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-[0.95rem] font-medium text-ink-soft hover:bg-blush-deep hover:text-wine"
        >
          <ExternalLink className="h-5 w-5" strokeWidth={1.7} />
          Voir le site
        </a>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[0.95rem] font-medium text-ink-soft hover:bg-blush-deep hover:text-wine"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.7} />
          Déconnexion
        </button>
      </div>
    </nav>
  );

  return (
    <FeedbackProvider>
      <div className="lmd flex min-h-screen bg-blush">
        <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-blush-edge/70 bg-white/60 lg:block">
          {nav}
        </aside>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Fermer le menu" className="absolute inset-0 bg-wine-deep/50" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[280px] bg-blush shadow-2xl">{nav}</div>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-blush-edge/70 bg-blush/90 px-4 py-3 backdrop-blur lg:hidden">
            <button onClick={() => setOpen(!open)} aria-label="Menu" className="rounded-full p-2 text-wine hover:bg-blush-deep">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <span className="font-brand text-xl text-wine">{current?.label}</span>
          </header>
          <main className="mx-auto max-w-[1100px] px-4 py-8 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
    </FeedbackProvider>
  );
}
