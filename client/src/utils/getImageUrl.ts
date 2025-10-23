import { BASE_URL } from "../lib/api";

export function getImageUrl(path?: string) {
  if (!path) return "/default-avatar.png"; // fallback
  return `${BASE_URL}/uploads/${path}`;
}
