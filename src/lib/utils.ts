import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let currency = "FCFA";

export function setCurrency(value: string) {
  if (value) currency = value;
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "Prix sur demande";
  return new Intl.NumberFormat("fr-FR").format(price) + " " + currency;
}
