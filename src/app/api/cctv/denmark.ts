import { fetchDenmarkOpenCctv } from './opencctv';
import type { CctvCamera } from './types';

const DENMARK_VERIFIED: CctvCamera[] = [
  {
    id: 'dk-klitmoller-westwind',
    lat: 57.0435,
    lng: 8.4796,
    name: 'Klitmøller Beach - Cold Hawaii',
    city: 'Klitmøller',
    country: 'Denmark',
    stream_url: 'https://www.youtube.com/embed/RUUaJKcJg6g?autoplay=1&mute=1&controls=1&rel=0',
    stream_type: 'iframe',
    external_url: 'https://www.youtube.com/watch?v=RUUaJKcJg6g',
    source: 'WestWind Surfshop / YouTube Live',
  },
  {
    id: 'dk-hvide-sande-hssc',
    lat: 56.0056,
    lng: 8.1294,
    name: 'Hvide Sande Sportsfisker Center',
    city: 'Hvide Sande',
    country: 'Denmark',
    stream_url: 'https://www.youtube.com/embed/UHRJAC6wZv4?autoplay=1&mute=1&controls=1&rel=0',
    stream_type: 'iframe',
    external_url: 'https://www.youtube.com/watch?v=UHRJAC6wZv4',
    source: 'Feriepartner Hvide Sande / YouTube Live',
  },
  {
    id: 'dk-hvide-sande-west',
    lat: 55.9989,
    lng: 8.1239,
    name: 'Hvide Sande - West',
    city: 'Hvide Sande',
    country: 'Denmark',
    stream_url: 'https://www.youtube.com/embed/kCM9ZFaeHZw?autoplay=1&mute=1&controls=1&rel=0',
    stream_type: 'iframe',
    external_url: 'https://www.youtube.com/watch?v=kCM9ZFaeHZw',
    source: 'Waves4you / YouTube Live',
  },
  {
    id: 'dk-hirtshals-port-north',
    lat: 57.59225,
    lng: 9.969167,
    name: 'Hirtshals Harbour - North',
    city: 'Hirtshals',
    country: 'Denmark',
    feed_url: 'https://data.portofhirtshals.dk/webcam/webcam.aspx?imgno=2',
    external_url: 'https://portofhirtshals.dk/da/aktuelt/webcams/',
    source: 'Port of Hirtshals',
  },
  {
    id: 'dk-hirtshals-port-east',
    lat: 57.59215,
    lng: 9.9703,
    name: 'Hirtshals Harbour - East',
    city: 'Hirtshals',
    country: 'Denmark',
    feed_url: 'https://data.portofhirtshals.dk/webcam/webcam.aspx?imgno=1',
    external_url: 'https://portofhirtshals.dk/da/aktuelt/webcams/',
    source: 'Port of Hirtshals',
  },
];

export async function fetchDenmarkCameras(): Promise<CctvCamera[]> {
  try {
    const live = await fetchDenmarkOpenCctv();
    const seen = new Set<string>();
    const all = [...live, ...DENMARK_VERIFIED];
    return all.filter(cam => {
      const key = cam.id || `${cam.lat}:${cam.lng}:${cam.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (e) {
    console.warn('[OSIRIS] Denmark directory feed failed:', e instanceof Error ? e.message : e);
    return DENMARK_VERIFIED;
  }
}
