/**
 * Prefix a public-folder path with Vite's BASE_URL so assets resolve correctly
 * both in dev (base = "/") and on GitHub Pages (base = "/fitness-checkup/").
 *
 * Usage: <img src={asset("/photos/burn.jpg")} />
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
