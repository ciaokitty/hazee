const PALETTE = ['#f3b9d2', '#b9deef', '#f8e7ae', '#cde8d8', '#e3d9f5'];

export function initialsAvatar(name) {
  const clean = String(name || '').trim();
  const initials = clean
    .split(/\s+/)
    .slice(0, 2)
    .map(w => (w[0] || '').toUpperCase())
    .join('') || '?';

  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash = (hash * 31 + clean.charCodeAt(i)) >>> 0;
  const bg = PALETTE[hash % PALETTE.length];

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
    `<rect width="400" height="400" fill="${bg}"/>` +
    `<text x="200" y="215" font-family="Arial, Helvetica, sans-serif" font-size="150" font-weight="900" fill="#171717" text-anchor="middle" dominant-baseline="middle">${initials}</text>` +
    `</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
