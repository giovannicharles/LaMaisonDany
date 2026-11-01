import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface OrnamentProps {
  className?: string;
  style?: CSSProperties;
}

const base = "pointer-events-none absolute -z-10 select-none";

export function Sprig({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 160 360" fill="none" className={cn(base, className)} style={style}>
      <path d="M82 356C74 280 90 200 70 120C60 80 72 40 84 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[
        [74, 300, -38], [88, 262, 40], [72, 222, -42], [90, 184, 44],
        [70, 146, -40], [88, 108, 42], [76, 72, -36], [86, 40, 34],
      ].map(([x, y, r], i) => (
        <path
          key={i}
          d="M0 0C14-18 40-18 52 0C40 16 14 16 0 0Z"
          transform={`translate(${x} ${y}) rotate(${(r as number) + (i % 2 ? 0 : 180)}) scale(${0.9 - i * 0.03})`}
          fill="currentColor"
          fillOpacity={0.35}
          stroke="currentColor"
          strokeWidth="1.2"
        />
      ))}
      <circle cx="84" cy="6" r="4" fill="currentColor" />
    </svg>
  );
}

export function Sparkle({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 48 48" fill="currentColor" className={cn(base, className)} style={style}>
      <path d="M24 0C26 14 34 22 48 24C34 26 26 34 24 48C22 34 14 26 0 24C14 22 22 14 24 0Z" />
    </svg>
  );
}

export function Rings({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 400 400" fill="none" stroke="currentColor" className={cn(base, className)} style={style}>
      {[60, 100, 140, 180, 220].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r - 20} strokeWidth="1.2" strokeDasharray={i % 2 ? "2 8" : undefined} />
      ))}
      <circle cx="200" cy="40" r="5" fill="currentColor" stroke="none" />
      <circle cx="326" cy="260" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Waves({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 1200 120" fill="none" stroke="currentColor" preserveAspectRatio="none" className={cn(base, className)} style={style}>
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M0 ${30 + i * 20} C 150 ${i * 20 - 10}, 300 ${70 + i * 20}, 450 ${30 + i * 20} S 750 ${i * 20 - 10}, 900 ${30 + i * 20} S 1100 ${70 + i * 20}, 1200 ${30 + i * 20}`}
          strokeWidth="1.2"
          opacity={1 - i * 0.2}
        />
      ))}
    </svg>
  );
}

export function DotGrid({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 160 160" fill="currentColor" className={cn(base, className)} style={style}>
      {Array.from({ length: 64 }, (_, i) => (
        <circle key={i} cx={10 + (i % 8) * 20} cy={10 + Math.floor(i / 8) * 20} r="2.2" />
      ))}
    </svg>
  );
}

export function Arches({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 300 360" fill="none" stroke="currentColor" strokeWidth="1.3" className={cn(base, className)} style={style}>
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M${20 + i * 22} 350V${170 + i * 22}a${130 - i * 22} ${130 - i * 22} 0 0 1 ${260 - i * 44} 0V350`} />
      ))}
    </svg>
  );
}

export function Vine({ className, style }: OrnamentProps) {
  return (
    <svg aria-hidden viewBox="0 0 240 300" fill="none" className={cn(base, className)} style={style}>
      <path d="M20 10C60 40 40 90 90 110S170 130 150 180" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {[[116, 150], [140, 170], [100, 168], [128, 192], [152, 200], [112, 190], [138, 218], [122, 238]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="13" fill="currentColor" fillOpacity={0.28} stroke="currentColor" strokeWidth="1.2" />
      ))}
      <path d="M54 52c18-26 46-20 54-4-18 22-42 22-54 4Z" fill="currentColor" fillOpacity={0.3} stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
