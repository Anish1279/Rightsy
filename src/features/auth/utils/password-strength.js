export const PASSWORD_STRENGTH_LABELS = ["Too short", "Weak", "Good", "Strong!"];
export const PASSWORD_STRENGTH_COLORS = ["bg-white/10", "bg-red-500", "bg-amber-400", "bg-teal-400"];

export function getPasswordStrength(password) {
  if (!password) return 0;

  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9!@#$%^&*]/.test(password)) score += 1;

  return score;
}
