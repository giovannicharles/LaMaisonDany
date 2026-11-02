const DASHES = /\s*[\u2014\u2013]\s*/g;

export function noDash(text: string): string {
  return text.replace(DASHES, ", ");
}

export function deepNoDash<T>(value: T): T {
  if (typeof value === "string") return noDash(value) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => deepNoDash(v)) as unknown as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, deepNoDash(v)])) as unknown as T;
  }
  return value;
}
