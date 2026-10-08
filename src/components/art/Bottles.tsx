import { useId } from "react";

interface ArtProps {
  className?: string;
  label?: string;
}

export function PerfumeBottle({ className, label = "LD" }: ArtProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 240 360" className={className} role="img" aria-label="Flacon de parfum">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#f4b9c4" />
          <stop offset="0.35" stopColor="#fbd9df" />
          <stop offset="0.6" stopColor="#e58aa0" />
          <stop offset="1" stopColor="#b23a5b" />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#4a0f22" />
          <stop offset="0.45" stopColor="#8e2646" />
          <stop offset="1" stopColor="#4a0f22" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" x2="1">
          <stop offset="0" stopColor="#d9b48c" />
          <stop offset="0.5" stopColor="#f6e3cc" />
          <stop offset="1" stopColor="#c79a6e" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="338" rx="84" ry="10" fill="#6b1730" opacity="0.18" />
      <rect x="86" y="18" width="68" height="62" rx="14" fill={`url(#${id}-cap)`} />
      <rect x="86" y="66" width="68" height="8" rx="3" fill={`url(#${id}-gold)`} />
      <rect x="104" y="74" width="32" height="26" fill={`url(#${id}-gold)`} />
      <rect x="36" y="96" width="168" height="236" rx="34" fill={`url(#${id}-glass)`} />
      <rect x="52" y="114" width="18" height="190" rx="9" fill="#fff" opacity="0.38" />
      <rect x="62" y="168" width="116" height="104" rx="8" fill="#fbeef0" opacity="0.94" />
      <text x="120" y="212" textAnchor="middle" fontFamily="Bodoni Moda, serif" fontSize="30" fill="#6b1730">
        {label}
      </text>
      <line x1="90" y1="226" x2="150" y2="226" stroke="#b23a5b" strokeWidth="1" />
      <text x="120" y="250" textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="9" letterSpacing="3" fill="#6b1730">
        EAU DE PARFUM
      </text>
    </svg>
  );
}

export function CreamJar({ className }: ArtProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 260 200" className={className} role="img" aria-label="Pot de soin">
      <defs>
        <linearGradient id={`${id}-lid`} x1="0" x2="1">
          <stop offset="0" stopColor="#4a0f22" />
          <stop offset="0.5" stopColor="#8e2646" />
          <stop offset="1" stopColor="#4a0f22" />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0" x2="1">
          <stop offset="0" stopColor="#f4c9d1" />
          <stop offset="0.4" stopColor="#fdeef0" />
          <stop offset="1" stopColor="#e3a3b2" />
        </linearGradient>
      </defs>
      <ellipse cx="130" cy="186" rx="104" ry="9" fill="#6b1730" opacity="0.16" />
      <rect x="28" y="84" width="204" height="96" rx="22" fill={`url(#${id}-body)`} />
      <rect x="22" y="44" width="216" height="52" rx="16" fill={`url(#${id}-lid)`} />
      <rect x="40" y="52" width="150" height="6" rx="3" fill="#fff" opacity="0.2" />
      <text x="130" y="144" textAnchor="middle" fontFamily="Bodoni Moda, serif" fontSize="22" fill="#6b1730">
        LaMaison Dany
      </text>
    </svg>
  );
}

export function LipstickArt({ className }: ArtProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 90 300" className={className} role="img" aria-label="Rouge à lèvres">
      <defs>
        <linearGradient id={`${id}-tube`} x1="0" x2="1">
          <stop offset="0" stopColor="#4a0f22" />
          <stop offset="0.5" stopColor="#8e2646" />
          <stop offset="1" stopColor="#4a0f22" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" x2="1">
          <stop offset="0" stopColor="#d9b48c" />
          <stop offset="0.5" stopColor="#f6e3cc" />
          <stop offset="1" stopColor="#c79a6e" />
        </linearGradient>
      </defs>
      <ellipse cx="45" cy="290" rx="34" ry="6" fill="#6b1730" opacity="0.18" />
      <path d="M26 110 L26 40 Q26 14 45 8 Q64 14 64 40 L64 110 Z" fill="#b23a5b" />
      <rect x="18" y="108" width="54" height="46" rx="4" fill={`url(#${id}-gold)`} />
      <rect x="14" y="152" width="62" height="132" rx="8" fill={`url(#${id}-tube)`} />
      <rect x="22" y="164" width="7" height="108" rx="3.5" fill="#fff" opacity="0.22" />
    </svg>
  );
}

export function WineBottle({ className, label = "LD" }: ArtProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 120 360" className={className} role="img" aria-label="Bouteille de vin">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" x2="1">
          <stop offset="0" stopColor="#2c0a15" />
          <stop offset="0.35" stopColor="#5d1530" />
          <stop offset="1" stopColor="#25080f" />
        </linearGradient>
      </defs>
      <ellipse cx="60" cy="350" rx="40" ry="6" fill="#4a0f22" opacity="0.2" />
      <rect x="49" y="6" width="22" height="34" rx="4" fill="#c79a6e" />
      <path d="M50 40 H70 V120 C70 150 100 160 100 200 V334 Q100 346 88 346 H32 Q20 346 20 334 V200 C20 160 50 150 50 120 Z" fill={`url(#${id}-g)`} />
      <rect x="30" y="206" width="60" height="96" rx="4" fill="#fbeef0" />
      <text x="60" y="244" textAnchor="middle" fontFamily="Bodoni Moda, serif" fontSize="20" fill="#6b1730">
        {label}
      </text>
      <line x1="40" y1="256" x2="80" y2="256" stroke="#b23a5b" strokeWidth="1" />
      <text x="60" y="276" textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="7" letterSpacing="2" fill="#6b1730">
        VIN ROUGE
      </text>
      <rect x="27" y="150" width="6" height="170" rx="3" fill="#fff" opacity="0.14" />
    </svg>
  );
}

export function GiftBox({ className }: ArtProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 220 220" className={className} role="img" aria-label="Coffret cadeau">
      <defs>
        <linearGradient id={`${id}-b`} x1="0" x2="1">
          <stop offset="0" stopColor="#8e2646" />
          <stop offset="1" stopColor="#5a1228" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="206" rx="80" ry="8" fill="#6b1730" opacity="0.18" />
      <rect x="26" y="92" width="168" height="108" rx="12" fill={`url(#${id}-b)`} />
      <rect x="18" y="68" width="184" height="36" rx="10" fill="#b23a5b" />
      <rect x="98" y="68" width="24" height="132" fill="#f6e3cc" />
      <path d="M110 68 C80 20 40 40 70 64 Z M110 68 C140 20 180 40 150 64 Z" fill="#f6e3cc" />
    </svg>
  );
}

export type ArtKind = "perfume" | "cosmetic" | "wine" | "other";

export function artKindFor(name?: string | null, slug?: string | null): ArtKind {
  const t = `${slug ?? ""} ${name ?? ""}`.toLowerCase();
  if (/vin|wine|champagne|spiritueux|boisson/.test(t)) return "wine";
  if (/cosm|soin|maquill|beaut|creme|crème/.test(t)) return "cosmetic";
  if (/parfum|fragrance|eau/.test(t)) return "perfume";
  return "other";
}

export function ProductArt({
  seed,
  kind,
  className,
}: {
  seed: number;
  kind: ArtKind;
  className?: string;
}) {
  if (kind === "wine") return <WineBottle className={className ?? "h-[84%]"} label={seed % 2 ? "D" : "LD"} />;
  if (kind === "cosmetic")
    return seed % 2 === 0 ? (
      <CreamJar className={className ?? "w-[70%] mb-[18%]"} />
    ) : (
      <LipstickArt className={className ?? "h-[74%]"} />
    );
  if (kind === "other") return <GiftBox className={className ?? "w-[66%] mb-[14%]"} />;
  return <PerfumeBottle className={className ?? "h-[82%]"} label={seed % 3 === 0 ? "LD" : seed % 3 === 1 ? "D" : "L"} />;
}
