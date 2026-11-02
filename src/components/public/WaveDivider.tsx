import { cn } from "@/lib/utils";

type Variant = "soft" | "swell" | "layered" | "ripple";

const PATHS: Record<Variant, string[]> = {
  soft: ["M0,46 C220,86 470,6 720,38 C970,70 1210,10 1440,44 L1440,90 L0,90 Z"],
  swell: ["M0,90 L0,62 C340,-6 1100,-6 1440,62 L1440,90 Z"],
  layered: [
    "M0,34 C260,2 520,70 780,36 C1040,2 1250,52 1440,30 L1440,90 L0,90 Z",
    "M0,58 C300,26 560,84 820,54 C1080,24 1260,70 1440,52 L1440,90 L0,90 Z",
  ],
  ripple: ["M0,50 C120,20 240,20 360,50 C480,80 600,80 720,50 C840,20 960,20 1080,50 C1200,80 1320,80 1440,50 L1440,90 L0,90 Z"],
};

interface WaveDividerProps {
  /** Couleur de fond de la section qui précède (classe bg-...). */
  from: string;
  /** Couleur de la section qui suit (classe text-...). */
  to: string;
  variant?: Variant;
  className?: string;
}

/** Vague de séparation entre deux sections : un bloc à part, jamais superposé au contenu. */
export default function WaveDivider({ from, to, variant = "soft", className }: WaveDividerProps) {
  const paths = PATHS[variant];
  return (
    <div aria-hidden className={cn("pointer-events-none block leading-[0]", from, className)}>
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className={cn("block h-[clamp(34px,6vw,84px)] w-full", to)} fill="currentColor">
        {paths.map((d, i) => (
          <path key={i} d={d} fillOpacity={paths.length > 1 && i === 0 ? 0.45 : 1} />
        ))}
      </svg>
    </div>
  );
}
