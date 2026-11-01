import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let currency = "FCFA";

export function setCurrency(value: string) {
  if (value) currency = value;
}

let pricesVisible = true;

export function setPricesVisible(value: boolean) {
  pricesVisible = value;
}

export function formatPrice(price: number | null | undefined): string {
  if (price == null || !pricesVisible) return "Prix sur demande";
  return new Intl.NumberFormat("fr-FR").format(price) + " " + currency;
}
