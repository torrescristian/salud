export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback para navegadores que no soportan crypto.randomUUID
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
