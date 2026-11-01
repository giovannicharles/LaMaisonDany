import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function usePagination<T>(items: T[], size: number, resetKey: unknown = "") {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / size));

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const current = Math.min(page, pageCount);
  const slice = useMemo(() => items.slice((current - 1) * size, current * size), [items, current, size]);

  return { page: current, setPage, pageCount, slice, offset: (current - 1) * size, total: items.length, size };
}

function pagesToShow(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = new Set([1, count, page - 1, page, page + 1]);
  const list = [...set].filter((n) => n >= 1 && n <= count).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  list.forEach((n, i) => {
    if (i > 0 && n - list[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

interface PaginationProps {
  page: number;
  pageCount: number;
  total: number;
  size: number;
  onChange: (page: number) => void;
  label?: string;
  className?: string;
}

export default function Pagination({ page, pageCount, total, size, onChange, label = "élément", className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const from = (page - 1) * size + 1;
  const to = Math.min(total, page * size);
  const btn = "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-[0.95rem] font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className={cn("mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row", className)}>
      <p className="text-sm text-ink-soft" aria-live="polite">
        {from} à {to} sur {total} {label}
      </p>
      <ul className="flex items-center gap-1.5">
        <li>
          <button onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Page précédente" className={cn(btn, "text-wine hover:bg-blush-deep disabled:opacity-30 disabled:hover:bg-transparent")}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        </li>
        {pagesToShow(page, pageCount).map((n, i) =>
          n === "gap" ? (
            <li key={`gap-${i}`} aria-hidden className="px-1 text-ink-soft">
              …
            </li>
          ) : (
            <li key={n}>
              <button
                onClick={() => onChange(n)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
                className={cn(btn, n === page ? "bg-wine text-blush" : "bg-white text-wine ring-1 ring-blush-edge/70 hover:bg-blush-deep")}
              >
                {n}
              </button>
            </li>
          )
        )}
        <li>
          <button onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Page suivante" className={cn(btn, "text-wine hover:bg-blush-deep disabled:opacity-30 disabled:hover:bg-transparent")}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
