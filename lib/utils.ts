import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names safely, resolving conflicting utility
 * classes (e.g. "p-2" vs "p-4") in the order they were supplied.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number or numeric string as a currency string, e.g. 2499 -> "Rs 2,499.00".
 * Defaults to PKR to match the default currency in the database schema.
 */
export function formatPrice(
  amount: number | string,
  currency: string = "PKR",
  locale: string = "en-PK",
) {
  const value = typeof amount === "string" ? Number.parseFloat(amount) : amount;

  if (Number.isNaN(value)) return "";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/** Initials for a display name, e.g. "Ada Lovelace" -> "AL". Falls back to "?". */
export function getInitials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}
