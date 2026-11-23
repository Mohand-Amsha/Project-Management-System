export const slugify = (text: string): string =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const uniqueSlug = (base: string): string =>
  `${base}-${Math.random().toString(36).slice(2, 8)}`;