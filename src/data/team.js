import teamData from './team.json';
import { initialsAvatar } from '../services/avatar';

const LINK_FIELDS = ['website', 'linkedin', 'instagram', 'youtube', 'calendly'];
const TEXT_FIELDS = ['name', 'title', 'department', 'company', 'email', 'phone', 'whatsapp', 'bio', 'officeAddress'];

function safeUrl(value, allowRelative = false) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (allowRelative && (v.startsWith('/') || /^data:image\//i.test(v))) return v;
  console.warn(`team data: ignoring unsafe URL "${v}"`);
  return '';
}

function safeSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function safeEmail(value) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;
  console.warn(`team data: ignoring invalid email "${v}"`);
  return '';
}

function safePhone(value) {
  const v = String(value ?? '').trim();
  if (!v) return '';
  if (v.replace(/\D/g, '').length < 5) {
    console.warn(`team data: ignoring invalid phone number "${v}"`);
    return '';
  }
  return v;
}

export function normalizeTeam(rows, sourceLabel = 'team data') {
  const seenSlugs = new Set();

  return (Array.isArray(rows) ? rows : [])
    .filter(m => {
      if (!m) return false;
      const slug = safeSlug(m.slug);
      const name = String(m.name ?? '').trim();
      if (!slug || !name) {
        console.warn(`${sourceLabel}: skipping entry missing slug or name`, m);
        return false;
      }
      if (seenSlugs.has(slug)) {
        console.warn(`${sourceLabel}: skipping duplicate slug "${slug}"`);
        return false;
      }
      seenSlugs.add(slug);
      return true;
    })
    .map(m => {
      const clean = { ...m };
      TEXT_FIELDS.forEach(f => {
        clean[f] = String(m[f] ?? '').trim();
      });
      LINK_FIELDS.forEach(f => {
        clean[f] = safeUrl(m[f]);
      });
      clean.email = safeEmail(clean.email);
      clean.phone = safePhone(clean.phone);
      clean.whatsapp = safePhone(clean.whatsapp);
      clean.id = safeSlug(m.slug);
      clean.slug = clean.id;
      clean.avatar = safeUrl(m.avatar, true) || initialsAvatar(clean.name);
      return clean;
    });
}

export const TEAM_MEMBERS = normalizeTeam(teamData, 'team.json');
