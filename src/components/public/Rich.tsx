import { Fragment, type ReactNode } from "react";
import { useSite } from "@/lib/siteContent";

/**
 * Texte éditable avec une mise en forme minimale :
 * *mot* passe en italique coloré, un retour à la ligne est conservé, {brand} devient le nom de la maison.
 */
export function richLines(text: string, brand: string, accent = "italic text-rose"): ReactNode[] {
  return text
    .split("{brand}")
    .join(brand)
    .split("\n")
    .map((line, i) => (
      <Fragment key={i}>
        {line.split(/(\*[^*]+\*)/g).map((seg, j) =>
          seg.length > 2 && seg.startsWith("*") && seg.endsWith("*") ? (
            <span key={j} className={accent}>
              {seg.slice(1, -1)}
            </span>
          ) : (
            <Fragment key={j}>{seg}</Fragment>
          )
        )}
      </Fragment>
    ));
}

export default function Rich({ text, accent }: { text: string; accent?: string }) {
  const { general } = useSite();
  return (
    <>
      {richLines(text, general.brand, accent).map((node, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {node}
        </Fragment>
      ))}
    </>
  );
}

export function useRichLines(text: string, accent?: string): ReactNode[] {
  const { general } = useSite();
  return richLines(text, general.brand, accent);
}
