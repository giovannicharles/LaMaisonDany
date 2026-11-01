import { useEffect, useRef, useState } from "react";
import { api } from "@/api/client";
import { AButton, Field, TextInput } from "@/components/admin/kit";
import { PerfumeBottle, WineBottle, CreamJar } from "@/components/art/Bottles";

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

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
            ? "Impossible de joindre le serveur. Vérifiez que l'API est démarrée."
            : "Numéro ou mot de passe incorrect. Vérifiez puis réessayez."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lmd grid min-h-screen bg-blush lg:grid-cols-2">
      <div className="relative hidden items-end justify-center overflow-hidden bg-gradient-to-br from-wine to-wine-deep lg:flex">
        <div aria-hidden className="relative h-[70%] w-[80%]">
          <WineBottle className="absolute bottom-0 left-[6%] h-[78%] -rotate-6 opacity-95" label="D" />
          <PerfumeBottle className="absolute bottom-0 left-1/2 h-[92%] -translate-x-1/2" />
          <CreamJar className="absolute bottom-0 right-0 w-[40%]" />
        </div>
        <p className="absolute left-12 top-12 font-brand text-4xl text-blush">
          LaMaison <span className="italic text-blush-edge">Dany</span>
        </p>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <p className="font-brand text-3xl text-wine lg:hidden">
            LaMaison <span className="italic text-rose">Dany</span>
          </p>
          <h1 className="mt-6 font-brand text-4xl text-wine lg:mt-0">Administration</h1>
          <p className="mt-2 text-ink-soft">Connectez-vous pour gérer votre boutique.</p>

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
              <TextInput id="l-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
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
        </form>
      </div>
    </main>
  );
}
