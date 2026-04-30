export type AuthInfo = { username: string; role: "admin" | "user" };

export function getAuthInfo(): AuthInfo | null {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )auth-info=([^;]*)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(decodeURIComponent(match[1])));
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getAuthInfo()?.role === "admin";
}
