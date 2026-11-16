import { generateTimestampToken } from './_security.js';

export default async () => {
  try {
    return new Response(JSON.stringify({ token: generateTimestampToken() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[contact-token]', err.message);
    return new Response(JSON.stringify({ error: 'Unavailable' }), { status: 500 });
  }
};
