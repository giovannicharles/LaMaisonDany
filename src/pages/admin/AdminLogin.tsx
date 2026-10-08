import { useState } from "react";
import { api } from "@/api/client";
import { AButton, Field, TextInput } from "@/components/admin/kit";
import { PerfumeBottle, WineBottle, CreamJar } from "@/components/art/Bottles";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            <Field label="Numéro de téléphone" htmlFor="l-phone" hint="Avec l'indicatif du pays, par exemple 237 690 00 00 00.">
              <TextInput
                id="l-phone"
                type="tel"
                inputMode="tel"
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
        </form>
      </div>
    </main>
  );
}
