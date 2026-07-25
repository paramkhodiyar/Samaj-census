import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a phone number to digits.
 * If 10 digits, defaults to prefixing '91' (India).
 * Otherwise preserves country code.
 */
export function normalizeMobile(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }
  const cleaned = trimmed.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  return cleaned;
}
