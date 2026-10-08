import { useEffect, useState } from "react";
import { api } from "@/api/client";
import { AButton, Field, PageIntro, Panel, TextInput, useFeedback } from "@/components/admin/kit";

export default function AdminAccount() {
  const { toast } = useFeedback();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api.auth
      .me()
      .then((res) => {
        setName(res.data.name ?? "");
        setPhone(res.data.phone ?? "");
        setEmail(res.data.email ?? "");
      })
      .catch(() => toast("error", "Impossible de charger votre compte."));
  }, [toast]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.auth.updateProfile({ name: name.trim(), phone: phone.trim(), email: email.trim() });
      toast("success", "Informations enregistrées. Utilisez ce numéro pour vous connecter.");
    } catch (err) {
      toast("error", err instanceof Error && err.message ? err.message : "Enregistrement impossible.");
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) return toast("error", "Les deux nouveaux mots de passe ne correspondent pas.");
    setSavingPassword(true);
    try {
      await api.auth.changePassword({ current_password: current, new_password: next });
      setCurrent("");
      setNext("");
      setConfirm("");
      toast("success", "Mot de passe modifié.");
    } catch (err) {
      toast("error", err instanceof Error && err.message ? err.message : "Modification impossible.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <PageIntro title="Mon compte" text="Votre numéro de téléphone est votre identifiant de connexion." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel>
          <h2 className="font-brand text-2xl text-wine">Mes informations</h2>
          <form onSubmit={saveProfile} className="mt-5 space-y-5">
            <Field label="Nom" htmlFor="ac-name">
              <TextInput id="ac-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label="Numéro de téléphone" htmlFor="ac-phone" hint="Avec l'indicatif du pays. C'est ce numéro qui sert à vous connecter.">
              <TextInput id="ac-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label="Email (facultatif)" htmlFor="ac-email">
              <TextInput id="ac-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <div className="flex justify-end">
              <AButton type="submit" disabled={savingProfile}>
                {savingProfile ? "Enregistrement..." : "Enregistrer"}
              </AButton>
            </div>
          </form>
        </Panel>

        <Panel>
          <h2 className="font-brand text-2xl text-wine">Mot de passe</h2>
          <form onSubmit={savePassword} className="mt-5 space-y-5">
            <Field label="Mot de passe actuel" htmlFor="ac-cur">
              <TextInput id="ac-cur" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
            </Field>
            <Field label="Nouveau mot de passe" htmlFor="ac-new" hint="8 caractères minimum.">
              <TextInput id="ac-new" type="password" autoComplete="new-password" minLength={8} value={next} onChange={(e) => setNext(e.target.value)} required />
            </Field>
            <Field label="Confirmer le nouveau mot de passe" htmlFor="ac-conf">
              <TextInput id="ac-conf" type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </Field>
            <div className="flex justify-end">
              <AButton type="submit" disabled={savingPassword}>
                {savingPassword ? "Modification..." : "Changer le mot de passe"}
              </AButton>
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
