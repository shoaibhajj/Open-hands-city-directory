import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\u0600-\u06FF\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generateSearchText(data: {
  nameArabic: string;
  nameEnglish: string;
  descriptionArabic?: string | null;
  descriptionEnglish?: string | null;
  addressArabic?: string | null;
  addressEnglish?: string | null;
}): string {
  const parts = [
    data.nameArabic,
    data.nameEnglish,
    data.descriptionArabic,
    data.descriptionEnglish,
    data.addressArabic,
    data.addressEnglish,
  ].filter(Boolean);
  return parts.join(' ').toLowerCase();
}

export function formatPhoneNumber(phone: string): string {
  // Handle Syrian phone numbers
  if (phone.startsWith('09')) {
    return `+963${phone.slice(1)}`;
  }
  if (phone.startsWith('9')) {
    return `+963${phone}`;
  }
  if (phone.startsWith('+963')) {
    return phone;
  }
  return phone;
}

export function generateToken(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 15)}${Math.random().toString(36).slice(2, 15)}`;
}

export function getDomainFromEmail(email: string): string | null {
  const parts = email.split('@');
  return parts.length === 2 ? parts[1] : null;
}