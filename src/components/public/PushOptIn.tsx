import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { usePush } from "@/lib/push";
import { useSite } from "@/lib/siteContent";

export default function PushOptIn() {
  const { texts, options } = useSite();
  const { state, enable, disable } = usePush("visitor");
  const [busy, setBusy] = useState(false);

  if (!options.show_visitor_push || state === "loading" || state === "unsupported" || state === "unavailable") return null;

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  };

  if (state === "on") {
    return (
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-blush/80">
        <span className="flex items-center gap-2">
          <BellRing className="h-4 w-4" /> {texts.footer_push_on}
        </span>
        <button
          onClick={() => {
            if (window.confirm(texts.footer_push_confirm)) void run(disable);
          }}
          disabled={busy}
          className="min-h-9 underline underline-offset-2 hover:text-white disabled:opacity-60"
        >
          {texts.footer_push_off}
        </button>
      </p>
    );
  }

  if (state === "denied") return null;

  return (
    <button
      onClick={() => void run(enable)}
      disabled={busy}
      className="mt-3 flex items-center gap-2 rounded-full border border-blush/30 px-5 py-2.5 text-[0.95rem] font-medium text-blush transition-colors hover:bg-blush hover:text-wine disabled:opacity-60"
    >
      <Bell className="h-4 w-4" /> {texts.footer_push_button}
    </button>
  );
}
