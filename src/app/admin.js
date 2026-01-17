export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

export function isAdminUser(user) {
  const email = (user?.email || "").toLowerCase().trim();
  return email === ADMIN_EMAIL;
}
