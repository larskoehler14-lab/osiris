import type { CctvCamera } from './types';

const DENMARK_CAMERAS: CctvCamera[] = [
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
  return DENMARK_CAMERAS;
}
