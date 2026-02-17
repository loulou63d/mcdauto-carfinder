import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Remove brand prefix from model if duplicated, return "Brand Model" */
export function vehicleDisplayName(brand: string, model: string): string {
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cleaned = model.replace(new RegExp(`^${escaped}\\s+`, 'i'), '');
  return `${brand} ${cleaned}`;
}
