import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BarChart3, Eye, EyeOff, MessageSquare, Package, PenLine, ShieldCheck, Smartphone, type LucideIcon } from "lucide-react";
import { api } from "@/api/client";
import { AButton, Field, TextInput } from "@/components/admin/kit";
import { Rings, Sparkle, Sprig } from "@/components/art/Ornaments";
import { PerfumeBottle, WineBottle, CreamJar } from "@/components/art/Bottles";
import { EASE } from "@/lib/motion";

interface GoogleId {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
}

function loadGoogle(): Promise<GoogleId | null> {
  const w = window as unknown as { google?: { accounts?: { id?: GoogleId } } };
  if (w.google?.accounts?.id) return Promise.resolve(w.google.accounts.id);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.onload = () => resolve(w.google?.accounts?.id ?? null);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

const FEATURES: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Package, title: "Produits et photos", text: "Ajoutez, classez et mettez en avant vos articles en quelques clics." },
  { icon: PenLine, title: "Contenu du site", text: "Textes, couleurs, sections et réglages : tout se modifie ici." },
  { icon: MessageSquare, title: "Messages clients", text: "Retrouvez chaque demande et répondez sur WhatsApp." },
  { icon: BarChart3, title: "Statistiques", text: "Voyez ce que vos visiteurs consultent et demandent." },
];

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleId, setGoogleId] = useState("");
  const googleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.auth.config().then((r) => setGoogleId(r.data.google_client_id || "")).catch(() => {});
  }, []);

  useEffect(() => {
    if (!googleId) return;
    let alive = true;
    loadGoogle().then((g) => {
      if (!alive || !g || !googleRef.current) return;
      g.initialize({
        client_id: googleId,
        callback: async ({ credential }) => {
          setError("");
          try {
            const res = await api.auth.google(credential);
            localStorage.setItem("lmd_token", res.data.token);
            onSuccess();
          } catch (err) {
            const text = err instanceof Error ? err.message : "";
            setError(/autorise/i.test(text) ? "Ce compte Google n'a pas accès à l'administration." : "Connexion Google impossible pour le moment.");
          }
        },
      });
      g.renderButton(googleRef.current, { theme: "outline", size: "large", shape: "pill", text: "continue_with", locale: "fr", width: 320 });
    });
    return () => {
      alive = false;
    };
  }, [googleId, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.login(identifier.trim(), password);
      localStorage.setItem("lmd_token", res.data.token);
      onSuccess();
    } catch (err) {
      const text = err instanceof Error ? err.message : "";
      setError(
        /trop de tentatives/i.test(text)
          ? "Trop de tentatives. Patientez quelques minutes avant de réessayer."
          : /failed to fetch|networkerror/i.test(text)
            ? "Impossible de joindre le serveur. Vérifiez votre connexion puis réessayez."
            : "Identifiant ou mot de passe incorrect. Vérifiez puis réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lmd grid min-h-screen bg-blush md:grid-cols-[1.05fr_1fr]">
      <aside className="relative isolate flex flex-col overflow-hidden bg-gradient-to-br from-wine to-wine-deep px-6 py-8 text-blush md:min-h-screen md:px-10 md:py-12 lg:px-14">
        <Rings className="lmd-spin -left-40 -top-40 h-[520px] w-[520px] text-blush/10" />
        <Rings className="lmd-spin -bottom-56 -right-40 h-[640px] w-[640px] text-blush/10" />
        <Sprig className="right-6 top-24 hidden h-[300px] rotate-12 text-blush/10 lg:block" />
        <Sparkle className="lmd-float right-[14%] top-[18%] h-5 w-5 text-blush/40" />
        <Sparkle className="lmd-float bottom-[30%] left-[10%] h-4 w-4 text-blush/30" style={{ animationDelay: "1.2s" }} />

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          <p className="font-brand text-3xl leading-none md:text-4xl">
            LaMaison <span className="italic text-blush-edge">Dany</span>
          </p>
          <p className="mt-2 text-sm uppercase tracking-[0.18em] text-blush/70">Espace d'administration</p>
        </motion.div>

        <motion.div className="mt-8 md:mt-14" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: EASE }}>
          <h2 className="max-w-[16ch] font-brand text-[2rem] leading-[1.08] sm:text-4xl lg:text-5xl">
            Votre boutique, <span className="italic text-blush-edge">entre vos mains.</span>
          </h2>
          <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-blush/80">
            Gérez les produits, les contenus et les demandes de vos clients depuis un seul endroit, sur ordinateur comme sur téléphone.
          </p>
        </motion.div>

        <ul className="mt-8 hidden gap-3 sm:grid sm:grid-cols-2 md:mt-10 md:grid-cols-1 xl:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: EASE }}
              className="flex items-start gap-3 rounded-2xl bg-blush/[0.07] p-4 ring-1 ring-blush/15 backdrop-blur-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blush/15">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="block font-medium leading-tight">{title}</span>
                <span className="mt-1 block text-sm leading-snug text-blush/75">{text}</span>
              </span>
            </motion.li>
          ))}
        </ul>

        <div className="relative mt-auto hidden pt-10 lg:block">
          <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-[210px] w-[300px] opacity-90">
            <WineBottle className="absolute bottom-0 left-[4%] h-[72%] -rotate-6" label="D" />
            <PerfumeBottle className="absolute bottom-0 left-1/2 h-full -translate-x-1/2" />
            <CreamJar className="absolute bottom-0 right-0 w-[38%]" />
          </div>
          <p className="flex max-w-[30ch] items-start gap-2.5 text-sm leading-snug text-blush/70">
            <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
            Installez l'administration sur votre téléphone pour y accéder en un geste.
          </p>
        </div>
      </aside>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 md:py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm" noValidate>
          <a href="/" className="mb-8 inline-flex min-h-10 items-center gap-2 text-sm text-ink-soft transition-colors hover:text-wine">
            <ArrowLeft className="h-4 w-4" /> Retour au site
          </a>
          <h1 className="font-brand text-4xl text-wine md:text-[2.6rem]">Connexion</h1>
          <p className="mt-2 text-ink-soft">Identifiez-vous pour accéder à votre tableau de bord.</p>

          <div className="mt-8 space-y-5">
            <Field label="Téléphone ou email" htmlFor="l-phone" hint="Téléphone avec l'indicatif du pays, par exemple 237 690 00 00 00.">
              <TextInput
                id="l-phone"
                type="text"
                autoComplete="username"
                placeholder="237 690 00 00 00"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </Field>
            <Field label="Mot de passe" htmlFor="l-pass">
              <div className="relative">
                <TextInput
                  id="l-pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="!pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush-deep hover:text-wine"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </Field>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <AButton type="submit" disabled={loading} className="mt-7 w-full !py-3.5">
            {loading ? "Connexion..." : "Se connecter"}
          </AButton>

          {googleId && (
            <div className="mt-6">
              <p className="mb-4 flex items-center gap-3 text-sm text-ink-soft before:h-px before:flex-1 before:bg-blush-edge after:h-px after:flex-1 after:bg-blush-edge">ou</p>
              <div ref={googleRef} className="flex justify-center" />
            </div>
          )}

          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-ink-soft">
            <ShieldCheck className="h-4 w-4 shrink-0 text-rose" />
            Connexion sécurisée, accès réservé à l'équipe.
          </p>
        </form>
      </section>
    </main>
  );
}
