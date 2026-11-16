import { verifyTimestampToken } from './_security.js';
import { COUNTRY_CODES } from '../../src/data/countryCodes.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const SUCCESS = {
  success: true,
  message: 'Thank you for reaching out! We will get back to you shortly.',
};

export default async (req) => {
  if (req.method !== 'POST') return json({ success: false, message: 'Method not allowed' }, 405);

  let data;
  try {
    data = await req.json();
  } catch {
    return json({ success: false, message: 'Invalid request.', errors: { general: 'Invalid request.' } }, 400);
  }
  const str = (k) => (typeof data[k] === 'string' ? data[k].trim() : '');

  // 1. Honeypot: fail silently so bots think it worked
  if (str('website')) {
    console.warn('[Security] Bot detected: honeypot filled.');
    return json(SUCCESS);
  }

  // 2. Signed timestamp token (HMAC + minimum time lock)
  let tokenOk = false;
  try {
    tokenOk = verifyTimestampToken(str('security_token'));
  } catch (err) {
    console.error('[contact]', err.message);
    return json({ success: false, message: 'Server misconfigured.', errors: { general: 'Service unavailable.' } }, 500);
  }
  if (!tokenOk) {
    console.warn('[Security] Invalid or expired token.');
    return json({
      success: false,
      message: 'Security verification failed.',
      errors: { general: 'Security check failed. Please try again.', tokenInvalid: true },
    }, 400);
  }

  // 3. Validation
  const name = str('name');
  const email = str('email');
  const countryCode = str('country_code');
  const phoneNumber = str('phone_number');
  const query = str('query');
  const memberName = str('member_name').slice(0, 100);
  const memberSlug = str('member_slug').slice(0, 100);
  const errors = {};

  if (!name) errors.name = 'Name is required.';
  else if (name.length > 140) errors.name = 'Name is too long.';
  if (!email) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (!query) errors.query = 'Message is required.';
  else if (query.length > 2000) errors.query = 'Message is too long (max 2000 characters).';

  if (!COUNTRY_CODES.some((c) => c.dial_code === countryCode)) {
    errors.phone = 'Invalid country code selected.';
  } else if (!phoneNumber) {
    errors.phone = 'Phone number is required.';
  } else if (!/^[0-9\s\-()]+$/.test(phoneNumber)) {
    errors.phone = 'Phone number contains invalid characters.';
  } else {
    const digits = phoneNumber.replace(/\D/g, '');
    const combined = `${countryCode}${digits}`;
    if (!/^\+\d{7,15}$/.test(combined)) errors.phone = 'Please enter a valid phone number.';
    else if (countryCode === '+91' && digits.length !== 10)
      errors.phone = 'For Indian numbers, the phone number must be exactly 10 digits.';
    else if (combined.length > 16) errors.phone = 'Phone number is too long.';
  }

  if (Object.keys(errors).length) {
    return json({ success: false, message: 'Please fix the errors below.', errors }, 400);
  }

  // 4. Send to CRM
  const apiUrl = process.env.CONTACT_US_API_URL;
  if (!apiUrl) {
    console.error('[contact] CONTACT_US_API_URL is not set');
    return json({ success: false, message: 'Server misconfigured.', errors: { general: 'Service unavailable.' } }, 500);
  }

  const phone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
  const tag = memberName ? `[For: ${memberName}${memberSlug ? ` (${memberSlug})` : ''}] ` : '';
  const payload = { name1: name, email, phone_number: phone, query: `${tag}${query}` };

  const headers = { 'Content-Type': 'application/json' };
  if (process.env.CONTACT_ORIGIN_HEADER) headers.Origin = process.env.CONTACT_ORIGIN_HEADER;

  try {
    const res = await fetch(apiUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!res.ok) {
      console.error(`[CRM Error] ${res.status}:`, await res.text());
      throw new Error(`CRM responded ${res.status}`);
    }
    return json(SUCCESS);
  } catch (err) {
    console.error('[contact] CRM submission failed:', err.message);
    return json({
      success: false,
      message: 'Something went wrong. Please try again later.',
      errors: { general: 'Unable to send your message right now. Please try again later.' },
    }, 502);
  }
};
