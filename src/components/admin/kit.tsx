import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion";

/* Buttons */
type Variant = "primary" | "secondary" | "danger" | "ghost";

export function AButton({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const styles: Record<Variant, string> = {
    primary: "bg-wine text-blush hover:bg-wine-deep shadow-[0_8px_18px_-10px_rgba(107,23,48,0.7)]",
    secondary: "border border-blush-edge bg-white text-wine hover:border-rose hover:bg-blush",
    danger: "bg-red-700 text-white hover:bg-red-800",
    ghost: "text-wine hover:bg-blush-deep",
  };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.95rem] font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none",
        styles[variant],
        className
      )}
    />
  );
}

/* Fields */
export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.9rem] font-medium text-wine">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("lmd-field !rounded-xl !py-2.5", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("lmd-field !rounded-xl !py-2.5 min-h-24 resize-y", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("lmd-field !rounded-xl !py-2.5", props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-[0.95rem] text-wine"
    >
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-wine" : "bg-blush-edge")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

/* Card */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-2xl bg-white p-5 md:p-6 ring-1 ring-blush-edge/70", className)}>{children}</section>;
}

/* Modal */
export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button aria-label="Fermer" className="absolute inset-0 bg-wine-deep/50" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[94svh] w-full flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-blush shadow-2xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <header className="flex items-center justify-between border-b border-blush-edge/70 px-6 py-4">
          <h2 className="font-brand text-2xl text-wine">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full p-2 text-wine hover:bg-blush-deep">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* Confirm + toast */
interface Toast {
  id: number;
  kind: "success" | "error";
  text: string;
}

interface FeedbackApi {
  toast: (kind: Toast["kind"], text: string) => void;
  confirm: (message: string, confirmLabel?: string) => Promise<boolean>;
}

const FeedbackContext = createContext<FeedbackApi>({
  toast: () => {},
  confirm: async () => false,
});

export const useFeedback = () => useContext(FeedbackContext);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [ask, setAsk] = useState<{ message: string; label: string } | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});
  const idRef = useRef(1);

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = idRef.current++;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const confirm = useCallback(
    (message: string, label = "Supprimer") =>
      new Promise<boolean>((resolve) => {
        resolver.current = resolve;
        setAsk({ message, label });
      }),
    []
  );

  const answer = (v: boolean) => {
    resolver.current(v);
    setAsk(null);
  };

  return (
    <FeedbackContext.Provider value={{ toast, confirm }}>
      {children}
      <div className="fixed bottom-5 left-1/2 z-[95] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-5 py-3 text-[0.95rem] font-medium text-white shadow-xl",
                t.kind === "success" ? "bg-wine" : "bg-red-700"
              )}
            >
              {t.kind === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {ask && (
          <Modal title="Confirmation" onClose={() => answer(false)}>
            <p className="text-ink">{ask.message}</p>
            <div className="mt-6 flex justify-end gap-3">
              <AButton variant="secondary" onClick={() => answer(false)}>
                Annuler
              </AButton>
              <AButton variant="danger" onClick={() => answer(true)}>
                {ask.label}
              </AButton>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
}

export function PageIntro({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-brand text-3xl md:text-4xl text-wine">{title}</h1>
        {text && <p className="mt-1.5 max-w-[60ch] text-ink-soft">{text}</p>}
      </div>
      {action}
    </div>
  );
}
