import { fetchGermanyOpenCctv } from './opencctv';
import { fetchHessenCameras } from './hessen';
import type { CctvCamera } from './types';

const GERMANY_FALLBACK: CctvCamera[] = [
  {
    id: 'de-berlin-1',
    lat: 52.5200, lng: 13.4050,
    name: 'Berlin - Alexanderplatz', city: 'Berlin', country: 'Germany',
    stream_url: 'https://www.youtube.com/embed/IRqboacDNFg?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0',
    stream_type: 'iframe',
    source: 'YouTube Live',
  },
  {
    id: 'de-munich-1',
    lat: 48.1351, lng: 11.5820,
    name: 'Munich - Marienplatz', city: 'Munich', country: 'Germany',
    stream_url: 'https://www.youtube.com/embed/KxWuwC7R5kY?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0',
    stream_type: 'iframe',
    source: 'YouTube Live',
  },
];

export async function fetchGermanyCameras(): Promise<CctvCamera[]> {
  const [openCctv, hessen] = await Promise.all([
    fetchGermanyOpenCctv().catch(e => {
      console.warn('[OSIRIS] Germany directory feed failed:', e instanceof Error ? e.message : e);
      return [] as CctvCamera[];
    }),
    fetchHessenCameras(),
  ]);

  const all = [...openCctv, ...hessen, ...GERMANY_FALLBACK];
  const seen = new Set<string>();
  return all.filter(cam => {
    const key = cam.id || `${cam.lat}:${cam.lng}:${cam.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
