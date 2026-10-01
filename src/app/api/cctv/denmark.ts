import type { CctvCamera } from './types';

const DENMARK_CAMERAS: CctvCamera[] = [
  {
    id: 'dk-skagen-harbour',
    lat: 57.72,
    lng: 10.590278,
    name: 'Skagen Harbour',
    city: 'Skagen',
    country: 'Denmark',
    external_url: 'https://worldcam.eu/webcams/europe/denmark/5191-skagen-harbour',
    source: 'Public webcam',
  },
  {
    id: 'dk-hirtshals-harbour',
    lat: 57.59225,
    lng: 9.969167,
    name: 'Hirtshals Harbour',
    city: 'Hirtshals',
    country: 'Denmark',
    external_url: 'https://spotcameras.com/en/cams/Europe/Denmark/3106-Hirtshals-Harbour-Denmark',
    source: 'Public webcam',
  },
  {
    id: 'dk-brejning-harbour',
    lat: 55.674722,
    lng: 9.690833,
    name: 'Brejning Harbour',
    city: 'Brejning',
    country: 'Denmark',
    external_url: 'https://worldcam.eu/webcams/europe/denmark/37095-brejning-harbour',
    source: 'Public webcam',
  },
  {
    id: 'dk-hundested-harbour',
    lat: 55.963611,
    lng: 11.845278,
    name: 'Hundested Harbour',
    city: 'Hundested',
    country: 'Denmark',
    external_url: 'https://worldcam.eu/webcams/europe/denmark/26015-hundested-harbor',
    source: 'Public webcam',
  },
  {
    id: 'dk-kaloevig-harbour',
    lat: 56.24441,
    lng: 10.34265,
    name: 'Kaløvig Bådelaug',
    city: 'Skødstrup',
    country: 'Denmark',
    external_url: 'https://www.daenemark.guide/webcam/skodstrup-kalovig-badelaug-hafen-skodstrup/',
    source: 'Public webcam',
  },
];

export async function fetchDenmarkCameras(): Promise<CctvCamera[]> {
  return DENMARK_CAMERAS;
}
