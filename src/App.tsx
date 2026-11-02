import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useCallback, useState, useEffect } from "react";
import { lazyRetry } from "@/lib/lazyRetry";
import PublicLayout from "@/components/public/PublicLayout";
import HomePage from "@/pages/public/HomePage";
import CataloguePage from "@/pages/public/CataloguePage";
import ProductDetailPage from "@/pages/public/ProductDetailPage";
import AboutPage from "@/pages/public/AboutPage";
import ContactPage from "@/pages/public/ContactPage";
import FavoritesPage from "@/pages/public/FavoritesPage";
import NotFoundPage from "@/pages/public/NotFoundPage";
import { ApiError, api } from "@/api/client";
import { SiteProvider } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";

const AdminLogin = lazyRetry(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazyRetry(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazyRetry(() => import("@/pages/admin/AdminProducts"));
const AdminCategories = lazyRetry(() => import("@/pages/admin/AdminCategories"));
const AdminPages = lazyRetry(() => import("@/pages/admin/AdminPages"));
const AdminMessages = lazyRetry(() => import("@/pages/admin/AdminMessages"));
const AdminAccount = lazyRetry(() => import("@/pages/admin/AdminAccount"));
const AdminContent = lazyRetry(() => import("@/pages/admin/AdminContent"));
const AdminBroadcast = lazyRetry(() => import("@/pages/admin/AdminBroadcast"));
const AdminTrash = lazyRetry(() => import("@/pages/admin/AdminTrash"));
const AdminLayout = lazyRetry(() => import("@/components/admin/AdminLayout"));

const AdminFallback = (
  <div className="lmd flex min-h-screen bg-blush" role="status" aria-label="Chargement">
    <div className="hidden w-[260px] shrink-0 space-y-3 border-r border-blush-edge/70 bg-white/60 p-4 lg:block">
      <div className="lmd-skel h-10 rounded-lg" />
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="lmd-skel h-8 rounded-md" />
      ))}
    </div>
    <div className="flex-1">
      <div className="h-14 border-b border-blush-edge/70" />
      <div className="mx-auto max-w-[1100px] space-y-5 px-4 py-10 md:px-8">
        <div className="lmd-skel h-10 w-1/3 rounded-xl" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="lmd-skel h-36 rounded-2xl" />
          ))}
        </div>
        <div className="lmd-skel h-64 rounded-2xl" />
      </div>
    </div>
  </div>
);

function AdminApp() {
  const [authed, setAuthed] = useState<boolean>(() => Boolean(localStorage.getItem("lmd_token")));
  const [selected, setSelected] = useState(() => {
    const go = new URLSearchParams(window.location.search).get("go") ?? "";
    return ["products", "categories", "content", "pages", "messages", "broadcast", "trash", "account"].includes(go) ? go : "dashboard";
  });
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    if (!authed) return;
    api.auth.me().catch((err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        localStorage.removeItem("lmd_token");
        setAuthed(false);
      }
    });
  }, [authed]);

  const refreshMessages = useCallback(() => {
    api.messages.counts().then((res) => setNewMessages(res.data.new)).catch(() => {});
  }, []);

  useEffect(() => {
    if (authed) refreshMessages();
  }, [authed, selected, refreshMessages]);

  if (!authed) return <><Seo title="Administration" noindex /><AdminLogin onSuccess={() => setAuthed(true)} /></>;

  const handleLogout = () => {
    localStorage.removeItem("lmd_token");
    setAuthed(false);
  };

  const [section, sub] = selected.split(":");
  const renderContent = () => {
    switch (section) {
      case "products": return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "content": return <AdminContent key={sub} initialTab={sub} />;
      case "pages": return <AdminPages />;
      case "messages": return <AdminMessages goTo={setSelected} onChanged={refreshMessages} />;
      case "broadcast": return <AdminBroadcast />;
      case "trash": return <AdminTrash onChanged={refreshMessages} />;
      case "account": return <AdminAccount />;
      default: return <AdminDashboard goTo={setSelected} />;
    }
  };

  return (
    <>
      <Seo title="Administration" noindex />
      <AdminLayout selected={selected} setSelected={setSelected} onLogout={handleLogout} newMessages={newMessages}>
        {renderContent()}
      </AdminLayout>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/produit/:slug" element={<ProductDetailPage />} />
          <Route path="/a-propos" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/favoris" element={<FavoritesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/admin" element={<SiteProvider><Suspense fallback={AdminFallback}><AdminApp /></Suspense></SiteProvider>} />
      </Routes>
    </BrowserRouter>
  );
}
