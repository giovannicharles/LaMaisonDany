import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  ChevronRight,
  Command,
  Download,
  ExternalLink,
  FileText,
  Hash,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  PenLine,
  Search,
  Sun,
  Tags,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePwaInstall } from "@/lib/pwa";
import { FeedbackProvider } from "./kit";

export type NavItemData = {
  id: string;
  title: string;
  icon: LucideIcon;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

const CONTENT_TABS: [string, string][] = [
  ["general", "Général"],
  ["options", "Réglages"],
  ["texts", "Titres et textes"],
  ["seo", "Référencement"],
  ["home", "Accueil"],
  ["reassurance", "Atouts"],
  ["order", "Commande"],
  ["faq", "FAQ"],
  ["about", "Valeurs"],
  ["videos", "Vidéos"],
  ["chatbot", "Chatbot"],
];

function buildGroups(newMessages: number): NavGroupData[] {
  return [
    {
      items: [
        { id: "search", title: "Rechercher", icon: Search, shortcut: "Ctrl K" },
        { id: "dashboard", title: "Tableau de bord", icon: LayoutDashboard },
        { id: "messages", title: "Messages", icon: MessageSquare, badge: newMessages > 0 ? newMessages : undefined },
      ],
    },
    {
      heading: "Boutique",
      items: [
        { id: "products", title: "Produits", icon: Package },
        { id: "categories", title: "Catégories", icon: Tags },
      ],
    },
    {
      heading: "Site",
      items: [
        {
          id: "content",
          title: "Contenu du site",
          icon: PenLine,
          children: CONTENT_TABS.map(([id, title]) => ({ id: `content:${id}`, title, icon: Hash })),
        },
        { id: "pages", title: "Pages", icon: FileText },
      ],
    },
  ];
}

const BOTTOM_ITEMS: NavItemData[] = [{ id: "account", title: "Mon compte", icon: UserRound }];

const flatten = (items: NavItemData[]): NavItemData[] =>
  items.reduce<NavItemData[]>((acc, item) => {
    acc.push(item);
    if (item.children) acc.push(...flatten(item.children));
    return acc;
  }, []);

export const ADMIN_SECTIONS = [
  { key: "dashboard", label: "Tableau de bord" },
  { key: "products", label: "Produits" },
  { key: "categories", label: "Catégories" },
  { key: "content", label: "Contenu du site" },
  { key: "pages", label: "Pages" },
  { key: "messages", label: "Messages" },
  { key: "account", label: "Mon compte" },
];

function BrandSwitcher({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn("mb-4 flex select-none items-center rounded-lg px-2 py-2", collapsed ? "justify-center" : "gap-3")}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-wine font-brand text-[15px] text-blush shadow-sm">D</div>
      {!collapsed && (
        <div className="flex flex-col overflow-hidden">
          <span className="mb-1 truncate font-brand text-[15px] leading-none text-wine">
            LaMaison <span className="italic text-rose">Dany</span>
          </span>
          <span className="text-[11px] leading-none text-ink-soft">Administration</span>
        </div>
      )}
    </div>
  );
}

function NavItem({
  item,
  activeId,
  onSelect,
  collapsed,
  level = 0,
}: {
  item: NavItemData;
  activeId: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  level?: number;
}) {
  const section = activeId.split(":")[0];
  const hasChildren = !!item.children && !collapsed;
  const childActive = !!item.children && section === item.id;
  const [open, setOpen] = useState(childActive);

  useEffect(() => {
    if (childActive) setOpen(true);
  }, [childActive]);

  const handleClick = () => {
    if (item.children) {
      if (collapsed) onSelect(item.id);
      else {
        setOpen(!open);
        if (!childActive) onSelect(item.children[0].id);
      }
    } else onSelect(item.id);
  };

  const active = item.children ? childActive && collapsed : activeId === item.id;

  return (
    <div className="flex w-full flex-col">
      <button
        type="button"
        onClick={handleClick}
        title={collapsed ? item.title : undefined}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group relative flex w-full items-center justify-between rounded-[6px] py-[7px] pr-2.5 text-left transition-all duration-200",
          collapsed && "justify-center px-0",
          active ? "bg-wine/10 font-medium text-wine" : "text-ink-soft hover:bg-wine/5 hover:text-wine"
        )}
        style={collapsed ? undefined : { paddingLeft: `${level * 12 + 10}px` }}
      >
        <span className="flex items-center gap-2.5">
          <item.icon className={cn("h-[16px] w-[16px] transition-colors", active ? "text-wine" : "text-ink-soft/80 group-hover:text-wine")} strokeWidth={1.5} />
          {!collapsed && <span className="truncate text-[13px] tracking-wide">{item.title}</span>}
        </span>
        {!collapsed && (
          <span className="flex items-center gap-2">
            {item.shortcut && (
              <kbd className="hidden h-5 items-center justify-center rounded-[4px] border border-blush-edge/70 bg-blush/60 px-1.5 font-mono text-[10px] font-medium text-ink-soft/70 group-hover:inline-flex">
                {item.shortcut}
              </kbd>
            )}
            {item.badge !== undefined && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose px-1.5 text-[10px] font-medium text-[#fff]">{item.badge}</span>
            )}
            {hasChildren && <ChevronRight className={cn("h-3.5 w-3.5 text-ink-soft/60 transition-transform duration-200", open && "rotate-90")} strokeWidth={2} />}
          </span>
        )}
        {collapsed && item.badge !== undefined && <span className="absolute right-1.5 top-1 h-2 w-2 rounded-full bg-rose" />}
      </button>

      {hasChildren && (
        <div className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-in-out", open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="relative mt-0.5 flex min-h-0 flex-col gap-0.5 overflow-hidden">
            <div className="absolute bottom-0 top-0 border-l border-wine/10" style={{ left: `${level * 12 + 17.5}px` }} />
            {item.children!.map((child) => (
              <NavItem key={child.id} item={child} activeId={activeId} onSelect={onSelect} collapsed={collapsed} level={level + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNav({
  groups,
  activeId,
  onSelect,
  collapsed,
  onLogout,
}: {
  groups: NavGroupData[];
  activeId: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
  onLogout: () => void;
}) {
  const pwa = usePwaInstall();
  return (
    <div className="flex h-full w-full flex-col p-3" aria-label="Administration">
      <BrandSwitcher collapsed={collapsed} />

      <div className="mt-2 flex flex-1 flex-col gap-4 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {groups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && !collapsed && (
              <span className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-ink-soft/60">{group.heading}</span>
            )}
            {group.items.map((item) => (
              <NavItem key={item.id} item={item} activeId={activeId} onSelect={onSelect} collapsed={collapsed} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-0.5 border-t border-blush-edge/70 pt-4">
        {BOTTOM_ITEMS.map((item) => (
          <NavItem key={item.id} item={item} activeId={activeId} onSelect={onSelect} collapsed={collapsed} />
        ))}
        {pwa.canInstall && (
          <button
            type="button"
            onClick={pwa.install}
            title="Installer l'administration"
            className={cn("flex w-full items-center gap-2.5 rounded-[6px] py-[7px] text-[13px] text-ink-soft transition-colors hover:bg-wine/5 hover:text-wine", collapsed ? "justify-center" : "px-2.5")}
          >
            <Download className="h-[16px] w-[16px]" strokeWidth={1.5} />
            {!collapsed && "Installer l'application"}
          </button>
        )}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Voir le site"
          className={cn("flex w-full items-center gap-2.5 rounded-[6px] py-[7px] text-[13px] text-ink-soft transition-colors hover:bg-wine/5 hover:text-wine", collapsed ? "justify-center" : "px-2.5")}
        >
          <ExternalLink className="h-[16px] w-[16px]" strokeWidth={1.5} />
          {!collapsed && "Voir le site"}
        </a>
        <button
          type="button"
          onClick={onLogout}
          title="Déconnexion"
          className={cn("flex w-full items-center gap-2.5 rounded-[6px] py-[7px] text-[13px] text-ink-soft transition-colors hover:bg-wine/5 hover:text-wine", collapsed ? "justify-center" : "px-2.5")}
        >
          <LogOut className="h-[16px] w-[16px]" strokeWidth={1.5} />
          {!collapsed && "Déconnexion"}
        </button>
      </div>
    </div>
  );
}

function CommandPalette({
  items,
  onPick,
  onClose,
  extra,
}: {
  items: NavItemData[];
  onPick: (id: string) => void;
  onClose: () => void;
  extra: { id: string; title: string; icon: LucideIcon; run: () => void }[];
}) {
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const all = [
      ...items.filter((i) => i.id !== "search").map((i) => ({ id: i.id, title: i.title, icon: i.icon, run: () => onPick(i.id) })),
      ...extra,
    ];
    const needle = q.trim().toLowerCase();
    return needle ? all.filter((r) => r.title.toLowerCase().includes(needle)) : all;
  }, [items, extra, q, onPick]);

  useEffect(() => setIndex(0), [q]);
  useEffect(() => inputRef.current?.focus(), []);

  const choose = (i: number) => {
    const r = results[i];
    if (!r) return;
    r.run();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-wine-deep/40 px-4 pt-[15vh] backdrop-blur-sm">
      <button aria-label="Fermer" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-blush-edge/70 bg-white shadow-2xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
          if (e.key === "ArrowDown") { e.preventDefault(); setIndex((n) => Math.min(results.length - 1, n + 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setIndex((n) => Math.max(0, n - 1)); }
          if (e.key === "Enter") choose(index);
        }}
      >
        <div className="flex items-center border-b border-blush-edge/70 px-4">
          <Search className="mr-3 h-[18px] w-[18px] shrink-0 text-ink-soft/70" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent py-4 text-[14px] text-ink outline-none placeholder:text-ink-soft/60"
            placeholder="Aller à une page, un réglage…"
          />
          <kbd onClick={onClose} className="ml-2 hidden h-5 cursor-pointer items-center justify-center rounded-[4px] border border-blush-edge/70 bg-blush px-1.5 font-mono text-[10px] font-medium text-ink-soft sm:inline-flex">
            ESC
          </kbd>
          <button onClick={onClose} aria-label="Fermer" className="ml-3 rounded-md p-1 text-ink-soft/70 hover:bg-blush-deep hover:text-wine">
            <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
          </button>
        </div>
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-2 py-8">
            <Command className="mb-2 h-6 w-6 text-ink-soft/40" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-ink-soft">Aucun résultat</p>
          </div>
        ) : (
          <ul className="max-h-[50vh] overflow-y-auto p-2">
            {results.map((r, i) => (
              <li key={r.id}>
                <button
                  onMouseEnter={() => setIndex(i)}
                  onClick={() => choose(i)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px]", i === index ? "bg-wine/10 text-wine" : "text-ink-soft")}
                >
                  <r.icon className="h-4 w-4" strokeWidth={1.5} />
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface AdminLayoutProps {
  selected: string;
  setSelected: (key: string) => void;
  onLogout: () => void;
  newMessages: number;
  children: ReactNode;
}

const THEME_KEY = "lmd_admin_theme";

export default function AdminLayout({ selected, setSelected, onLogout, newMessages, children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("lmd_admin_collapsed") === "1"; } catch { return false; }
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem(THEME_KEY) === "dark"; } catch { return false; }
  });
  const pwa = usePwaInstall();

  useEffect(() => {
    document.documentElement.classList.toggle("lmd-dark", dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? "#1a0e13" : "#6b1730");
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch { /* stockage indisponible */ }
    return () => {
      document.documentElement.classList.remove("lmd-dark");
    };
  }, [dark]);

  useEffect(() => {
    try { localStorage.setItem("lmd_admin_collapsed", collapsed ? "1" : "0"); } catch { /* stockage indisponible */ }
  }, [collapsed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(() => buildGroups(newMessages), [newMessages]);
  const all = useMemo(() => flatten([...groups.flatMap((g) => g.items), ...BOTTOM_ITEMS]), [groups]);
  const sectionId = selected.split(":")[0];
  const current = all.find((i) => i.id === selected) ?? all.find((i) => i.id === sectionId);
  const parent = selected.includes(":") ? all.find((i) => i.id === sectionId) : undefined;

  const select = (id: string) => {
    if (id === "search") {
      setSearchOpen(true);
      return;
    }
    setSelected(id);
    setMobileOpen(false);
  };

  const extra = [
    { id: "x-site", title: "Voir le site", icon: ExternalLink, run: () => window.open("/", "_blank", "noopener") },
    { id: "x-theme", title: dark ? "Passer en mode clair" : "Passer en mode sombre", icon: dark ? Sun : Moon, run: () => setDark(!dark) },
    ...(pwa.canInstall ? [{ id: "x-install", title: "Installer l'application", icon: Download, run: () => void pwa.install() }] : []),
    { id: "x-logout", title: "Déconnexion", icon: LogOut, run: onLogout },
  ];

  return (
    <FeedbackProvider>
      <div className="lmd flex min-h-screen w-full bg-blush text-ink">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 border-r border-blush-edge/70 bg-white/60 transition-all duration-300 ease-in-out lg:block",
            collapsed ? "w-16" : "w-[260px]"
          )}
        >
          <SidebarNav groups={groups} activeId={selected} onSelect={select} collapsed={collapsed} onLogout={onLogout} />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Fermer le menu" className="absolute inset-0 bg-wine-deep/50" onClick={() => setMobileOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[280px] bg-blush shadow-2xl">
              <SidebarNav groups={groups} activeId={selected} onSelect={select} collapsed={false} onLogout={onLogout} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-blush-edge/70 bg-blush/90 px-4 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3">
              <button onClick={() => setMobileOpen(true)} aria-label="Menu" className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-wine/5 hover:text-wine lg:hidden">
                <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Déplier le menu" : "Replier le menu"}
                className="hidden rounded-md p-1.5 text-ink-soft transition-colors hover:bg-wine/5 hover:text-wine lg:block"
              >
                {collapsed ? <PanelLeftOpen className="h-[18px] w-[18px]" strokeWidth={1.5} /> : <PanelLeftClose className="h-[18px] w-[18px]" strokeWidth={1.5} />}
              </button>
              <div className="flex min-w-0 items-center gap-2 text-sm text-ink-soft">
                <span className="hidden truncate sm:inline">LaMaison Dany</span>
                <span className="hidden sm:inline">/</span>
                {parent && (
                  <>
                    <span className="hidden truncate sm:inline">{parent.title}</span>
                    <span className="hidden sm:inline">/</span>
                  </>
                )}
                <span className="truncate font-medium text-wine">{current?.title ?? "Tableau de bord"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden h-8 w-64 items-center gap-2 rounded-md bg-wine/5 px-3 text-[13px] text-ink-soft transition-colors hover:bg-wine/10 md:flex"
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
                Rechercher…
                <kbd className="ml-auto font-mono text-[10px] text-ink-soft/70">Ctrl K</kbd>
              </button>
              <button onClick={() => setSearchOpen(true)} aria-label="Rechercher" className="rounded-md p-2 text-ink-soft hover:bg-wine/5 hover:text-wine md:hidden">
                <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => select("messages")}
                aria-label={newMessages > 0 ? `${newMessages} nouveau(x) message(s)` : "Messages"}
                className="relative rounded-md p-2 text-ink-soft transition-colors hover:bg-wine/5 hover:text-wine"
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
                {newMessages > 0 && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose" />}
              </button>
              <button
                onClick={() => setDark(!dark)}
                aria-label={dark ? "Mode clair" : "Mode sombre"}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-blush-edge/70 bg-white text-ink-soft transition-colors hover:text-wine"
              >
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button onClick={() => select("account")} aria-label="Mon compte" className="flex h-8 w-8 items-center justify-center rounded-full border border-wine/20 bg-wine/10 text-wine">
                <UserRound className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1100px] px-4 py-8 md:px-8 md:py-10">{children}</main>
        </div>

        {searchOpen && <CommandPalette items={all} extra={extra} onPick={select} onClose={() => setSearchOpen(false)} />}
      </div>
    </FeedbackProvider>
  );
}
