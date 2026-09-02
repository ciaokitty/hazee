import { TEAM_MEMBERS, normalizeTeam } from '../data/team';

const SHEET_URL = import.meta.env.VITE_TEAM_SHEET_URL;
const CACHE_KEY = 'mindyourbiz_team_cache';
const FETCH_TIMEOUT_MS = 10000;

function readCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
      return parsed.members;
    }
  } catch {
    // cache unavailable or corrupted
  }
  return null;
}

function writeCache(members) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), members }));
  } catch {
    // storage unavailable; cache simply won't persist
  }
}

async function fetchFromSheet() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(SHEET_URL, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const members = normalizeTeam(data, 'google sheet');
    if (members.length === 0) throw new Error('google sheet returned no usable rows');
    return members;
  } finally {
    clearTimeout(timer);
  }
}

export async function loadTeamMembers() {
  if (SHEET_URL) {
    try {
      const members = await fetchFromSheet();
      writeCache(members);
      return { members, source: 'sheet' };
    } catch (err) {
      console.warn('teamService: sheet fetch failed, trying fallbacks', err);
      const cached = readCache();
      if (cached) return { members: cached, source: 'cache' };
    }
  }

  return { members: TEAM_MEMBERS, source: 'bundle' };
}
