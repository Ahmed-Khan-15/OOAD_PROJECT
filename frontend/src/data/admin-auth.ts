const SESSION_KEY = "global-health-explorer:admin-session:v1";
export const DEMO_ADMIN_EMAIL = "admin@globalhealth.example";
export const DEMO_ADMIN_PASSWORD = "health-demo-2026";

export function isAdminSignedIn() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(SESSION_KEY) === "signed-in";
}

export function signInAdmin(email: string, password: string) {
  if (email.trim().toLowerCase() !== DEMO_ADMIN_EMAIL || password !== DEMO_ADMIN_PASSWORD) {
    return false;
  }

  window.localStorage.setItem(SESSION_KEY, "signed-in");
  return true;
}

export function signOutAdmin() {
  if (typeof window !== "undefined") window.localStorage.removeItem(SESSION_KEY);
}
