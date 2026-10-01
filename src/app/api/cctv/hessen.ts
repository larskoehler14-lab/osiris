import { stealthFetch } from '@/lib/stealthFetch';
import type { CctvCamera } from './types';

const INDEX = 'https://verkehrsservice.hessen.de/syncdata/poikamera.json';
const VIDEO_BASE = 'https://verkehrsservice.hessen.de/syncdata/video/';

export async function fetchHessenCameras(): Promise<CctvCamera[]> {
  try {
    const res = await stealthFetch(INDEX, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`Hessen camera index HTTP ${res.status}`);

    const data = await res.json();
    const features = Array.isArray(data?.features) ? data.features : [];

    return features.flatMap((f: any) => {
      const id = String(f?.id || '').trim();
      const coords = f?.geometry?.coordinates;
      const p = f?.properties || {};
      if (!id || !Array.isArray(coords) || coords.length < 2) return [];

      const lng = Number(coords[0]);
      const lat = Number(coords[1]);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];

      return [{
        id: `he-${id}`,
        lat,
        lng,
        name: p.title || p.type || id,
        city: p.street || 'Hessen',
        country: 'Germany',
        stream_url: `${VIDEO_BASE}${encodeURIComponent(id)}.mp4`,
        stream_type: 'mp4' as const,
        external_url: 'https://verkehrsservice.hessen.de/',
        source: 'Verkehrsservice Hessen',
      }];
    });
  } catch (e) {
    console.warn('[OSIRIS] Hessen cameras failed:', e instanceof Error ? e.message : e);
    return [];
  }
}
