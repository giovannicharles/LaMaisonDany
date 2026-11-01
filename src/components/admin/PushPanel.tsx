import { useEffect, useState } from "react";
import { Bell, BellOff, Send } from "lucide-react";
import { api } from "@/api/client";
import { usePush } from "@/lib/push";
import { AButton, Panel, Toggle, useFeedback } from "./kit";

interface Prefs {
  on_message: boolean;
  on_handoff: boolean;
  on_whatsapp_request: boolean;
}

const DEFAULT_PREFS: Prefs = { on_message: true, on_handoff: true, on_whatsapp_request: false };

const MESSAGES: Record<string, string> = {
  unsupported: "Ce navigateur ne gère pas les notifications. Essayez Chrome, Edge ou Safari récent (sur iPhone, installez d'abord l'application).",
  unavailable: "Les notifications ne sont pas encore activées sur le serveur.",
  denied: "Les notifications sont bloquées pour ce site. Autorisez-les dans les réglages du navigateur, puis revenez ici.",
};

export default function PushPanel() {
  const { toast, confirm } = useFeedback();
  const { state, enable, disable } = usePush("admin");
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api.settings
      .get()
      .then((r) => setPrefs({ ...DEFAULT_PREFS, ...((r.data as { notifications?: Partial<Prefs> }).notifications ?? {}) }))
      .catch(() => {});
  }, []);

  const savePref = async (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      await api.settings.update({ notifications: next });
    } catch {
      setPrefs(prefs);
      toast("error", "Enregistrement impossible.");
    }
  };

  const turnOff = async () => {
    if (!(await confirm("Désactiver les notifications sur cet appareil ? Vous ne serez plus prévenu des nouveaux messages.", "Désactiver"))) return;
    await disable();
    toast("success", "Notifications désactivées sur cet appareil.");
  };

  const test = async () => {
    setTesting(true);
    try {
      await api.push.test();
      toast("success", "Notification de test envoyée.");
    } catch {
      toast("error", "Envoi du test impossible.");
    } finally {
      setTesting(false);
    }
  };

  const on = state === "on";

  return (
    <Panel>
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush-deep text-wine">{on ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}</span>
        <div>
          <h2 className="font-brand text-2xl text-wine">Notifications</h2>
          <p className="mt-1 text-sm text-ink-soft">Soyez prévenu sur cet appareil dès qu'un client vous écrit, même quand l'administration est fermée.</p>
        </div>
      </div>

      {state === "loading" ? (
        <div className="lmd-skel mt-5 h-12 rounded-xl" />
      ) : MESSAGES[state] ? (
        <p className="mt-5 rounded-xl bg-blush px-4 py-3 text-sm text-ink-soft">{MESSAGES[state]}</p>
      ) : (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {on ? (
            <>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">Actives sur cet appareil</span>
              <AButton variant="secondary" onClick={test} disabled={testing}>
                <Send className="h-4 w-4" /> {testing ? "Envoi…" : "Envoyer un test"}
              </AButton>
              <AButton variant="ghost" onClick={turnOff}>
                Désactiver
              </AButton>
            </>
          ) : (
            <AButton onClick={enable}>
              <Bell className="h-4 w-4" /> Activer les notifications
            </AButton>
          )}
        </div>
      )}

      <div className="mt-6 space-y-4 border-t border-blush-edge/60 pt-5">
        <p className="text-sm font-medium text-wine">Me prévenir quand…</p>
        <Toggle label="un client envoie un message" checked={prefs.on_message} onChange={(v) => savePref({ on_message: v })} />
        <Toggle label="un client veut parler à l'équipe depuis l'assistant" checked={prefs.on_handoff} onChange={(v) => savePref({ on_handoff: v })} />
        <Toggle label="un visiteur ouvre WhatsApp depuis un produit" checked={prefs.on_whatsapp_request} onChange={(v) => savePref({ on_whatsapp_request: v })} />
        <p className="text-xs text-ink-soft">Ces choix s'appliquent à toute l'équipe.</p>
      </div>
    </Panel>
  );
}
