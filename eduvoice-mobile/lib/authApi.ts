import type { AuthTokens } from "../types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
const FETCH_TIMEOUT_MS = 8000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export async function authLogin(email: string, password: string): Promise<AuthTokens> {
  let res: Response;
  try {
    res = await withTimeout(
      fetch(`${API_BASE}/api/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }),
      FETCH_TIMEOUT_MS
    );
  } catch {
    throw new Error("Serveur inaccessible. Vérifiez que le backend est démarré et que l'IP est correcte.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Identifiants incorrects.");
  }
  return res.json();
}

export async function authRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthTokens> {
  let res: Response;
  try {
    res = await withTimeout(
      fetch(`${API_BASE}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      }),
      FETCH_TIMEOUT_MS
    );
  } catch {
    throw new Error("Serveur inaccessible. Vérifiez que le backend est démarré et que l'IP est correcte.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const detail =
      err.email?.[0] ??
      err.name?.[0] ??
      err.password?.[0] ??
      err.detail ??
      "Erreur lors de l'inscription.";
    throw new Error(detail);
  }
  return res.json();
}
