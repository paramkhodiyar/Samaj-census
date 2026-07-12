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
export function normalizeMobile(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  return cleaned;
}
