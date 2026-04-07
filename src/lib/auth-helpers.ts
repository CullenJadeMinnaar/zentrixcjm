export class RateLimiter {
  private maxAttempts: number;
  private windowMs: number;
  private store: Record<string, { count: number; resetAt: number }> = {};

  constructor(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string) {
    const now = Date.now();
    if (!this.store[key]) this.store[key] = { count: 0, resetAt: now + this.windowMs };
    if (now > this.store[key].resetAt) {
      this.store[key] = { count: 0, resetAt: now + this.windowMs };
    }
    this.store[key].count++;
    const remaining = this.store[key].resetAt - now;
    const blocked = this.store[key].count > this.maxAttempts;
    return { blocked, count: this.store[key].count, resetInMs: remaining };
  }
}

export const MAX_INPUT_LENGTH = 4096;

export function sanitize(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/\x00/g, "")
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length < 255;
}

export function validatePassword(pw: string): boolean {
  return pw.length >= 8 && pw.length <= 128;
}
