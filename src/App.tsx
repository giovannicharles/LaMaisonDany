import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import PublicLayout from "@/components/public/PublicLayout";
import HomePage from "@/pages/public/HomePage";
import CataloguePage from "@/pages/public/CataloguePage";
import ProductDetailPage from "@/pages/public/ProductDetailPage";
import AboutPage from "@/pages/public/AboutPage";
import ContactPage from "@/pages/public/ContactPage";
import { api } from "@/api/client";
import { SiteProvider } from "@/lib/siteContent";
import Seo from "@/components/public/Seo";

const AdminLogin = lazy(() => import("@/pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminPages = lazy(() => import("@/pages/admin/AdminPages"));
const AdminMessages = lazy(() => import("@/pages/admin/AdminMessages"));
const AdminAccount = lazy(() => import("@/pages/admin/AdminAccount"));
const AdminContent = lazy(() => import("@/pages/admin/AdminContent"));
const AdminLayout = lazy(() => import("@/components/admin/AdminLayout"));

const AdminFallback = (
  <div className="lmd min-h-screen flex items-center justify-center bg-blush">
    <p className="text-ink-soft">Chargement...</p>
  </div>
);

function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [selected, setSelected] = useState("dashboard");
  const [newMessages, setNewMessages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("lmd_token");
    if (!token) { setAuthed(false); return; }
    api.auth.me().then(() => setAuthed(true)).catch(() => { localStorage.removeItem("lmd_token"); setAuthed(false); });
  }, []);

  useEffect(() => {
    if (!authed) return;
    api.messages.list("new").then((res) => setNewMessages(res.data.length)).catch(() => {});
  }, [authed, selected]);

  if (authed === null) {
    return <main className="lmd min-h-screen flex items-center justify-center bg-blush"><p className="text-ink-soft">Chargement...</p></main>;
  }
  if (!authed) return <><Seo title="Administration" noindex /><AdminLogin onSuccess={() => setAuthed(true)} /></>;

  const handleLogout = () => {
    localStorage.removeItem("lmd_token");
    setAuthed(false);
  };

  const renderContent = () => {
    switch (selected) {
      case "products": return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "content": return <AdminContent />;
      case "pages": return <AdminPages />;
      case "messages": return <AdminMessages />;
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
        </Route>
        <Route path="/admin" element={<SiteProvider><Suspense fallback={AdminFallback}><AdminApp /></Suspense></SiteProvider>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
