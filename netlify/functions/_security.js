import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const MIN_AGE_MS = 3000; // human-speed lock: reject submissions faster than this
const MAX_AGE_MS = 30 * 60 * 1000; // token expiry

function sign(payload) {
  const secret = process.env.CONTACT_SECRET;
  if (!secret) throw new Error('CONTACT_SECRET is not set');
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function generateTimestampToken() {
  const payload = `${Date.now()}.${randomBytes(8).toString('hex')}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyTimestampToken(token) {
  if (typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [ts, nonce, sig] = parts;
  const expected = sign(`${ts}.${nonce}`);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(ts);
  return Number.isFinite(age) && age >= MIN_AGE_MS && age <= MAX_AGE_MS;
}
