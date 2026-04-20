import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();

  const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const localDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffMs = localNow.getTime() - localDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";

  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    if (futureDays === 1) return "tomorrow";
    if (futureDays < 7) return `in ${futureDays} days`;
    if (futureDays < 30) return `in ${Math.floor(futureDays / 7)} weeks`;
    if (futureDays < 365) return `in ${Math.floor(futureDays / 30)} months`;
  }

  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
