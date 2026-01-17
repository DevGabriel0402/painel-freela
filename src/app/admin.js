export const ADMIN_EMAIL = "gabriellucas2301@gmail.com";

export function isAdminUser(user) {
  const email = (user?.email || "").toLowerCase().trim();
  return email === ADMIN_EMAIL;
}
