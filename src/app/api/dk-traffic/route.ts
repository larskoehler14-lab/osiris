import { NextResponse } from 'next/server';

export const maxDuration = 60;

const DEFAULT_URL = 'https://distribution.dataudveksler.app.vd.dk/api/dataset/416/latest/DatexII';

function textOf(xml: string, tag: string): string {
  const re = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, 'i');
  const m = xml.match(re);
  return m ? decodeXml(m[1].replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim()) : '';
}

function decodeXml(s: string): string {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
}

function attrOf(openTag: string, name: string): string {
  const re = new RegExp(`(?:\\w+:)?${name}=["']([^"']+)["']`, 'i');
  return openTag.match(re)?.[1] || '';
}

function classify(block: string, openTag: string): string {
  const xsiType = attrOf(openTag, 'type').split(':').pop() || '';
  const candidates = [
    ['accidentType', 'accident'],
    ['constructionWorkType', 'roadworks'],
    ['maintenanceWorkType', 'roadworks'],
    ['vehicleObstructionType', 'obstruction'],
    ['animalPresenceType', 'obstruction'],
    ['abnormalTrafficType', 'congestion'],
    ['poorEnvironmentType', 'weather'],
    ['weatherRelatedRoadConditionType', 'weather'],
    ['nonWeatherRelatedRoadConditionType', 'road-condition'],
    ['roadOrCarriagewayOrLaneManagementType', 'closure'],
    ['generalInstructionToRoadUsersType', 'instruction'],
  ] as const;
  for (const [tag, kind] of candidates) if (textOf(block, tag)) return kind;
  const t = xsiType.toLowerCase();
  if (t.includes('accident')) return 'accident';
  if (t.includes('construction') || t.includes('maintenance')) return 'roadworks';
  if (t.includes('obstruction')) return 'obstruction';
  if (t.includes('abnormaltraffic')) return 'congestion';
  if (t.includes('weather')) return 'weather';
  if (t.includes('management')) return 'closure';
  return 'traffic';
}

function labelFor(kind: string): string {
  return ({
    accident: 'Accident',
    roadworks: 'Roadworks',
    obstruction: 'Road obstruction',
    congestion: 'Congestion',
    weather: 'Weather hazard',
    'road-condition': 'Road condition',
    closure: 'Road restriction',
    instruction: 'Traffic instruction',
    traffic: 'Traffic event',
  } as Record<string, string>)[kind] || 'Traffic event';
}

function extractEvents(xml: string) {
  const events: any[] = [];
  const situations = [...xml.matchAll(/<(?:\w+:)?situation\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?situation>/gi)];

  for (const s of situations) {
    const situationId = attrOf(s[1], 'id');
    const records = [...s[2].matchAll(/<(?:\w+:)?situationRecord\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?situationRecord>/gi)];

    for (const r of records) {
      const open = r[1];
      const block = r[2];
      const lat = Number(textOf(block, 'latitude'));
      const lng = Number(textOf(block, 'longitude'));
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 54 || lat > 58.5 || lng < 7 || lng > 16) continue;

      const id = attrOf(open, 'id') || situationId || `${lat}:${lng}:${events.length}`;
      const kind = classify(block, open);
      const comment = textOf(block, 'generalPublicComment') || textOf(block, 'comment');
      const road = textOf(block, 'roadName') || textOf(block, 'locationDescription') || textOf(block, 'localityName');
      const detail =
        textOf(block, 'accidentType') ||
        textOf(block, 'constructionWorkType') ||
        textOf(block, 'maintenanceWorkType') ||
        textOf(block, 'vehicleObstructionType') ||
        textOf(block, 'abnormalTrafficType') ||
        textOf(block, 'roadOrCarriagewayOrLaneManagementType') ||
        '';
      const start = textOf(block, 'overallStartTime') || textOf(block, 'situationRecordCreationTime');
      const end = textOf(block, 'overallEndTime');

      events.push({
        id: `vd-${id}`,
        lat,
        lng,
        kind,
        title: comment || (road ? `${labelFor(kind)} — ${road}` : labelFor(kind)),
        road,
        detail,
        start,
        end,
        source: 'Vejdirektoratet',
        source_url: 'https://trafikkort.vejdirektoratet.dk/',
      });
    }
  }

  const seen = new Set<string>();
  return events.filter(e => {
    const key = e.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = process.env.VD_TRAFFIC_USERNAME;
  const password = process.env.VD_TRAFFIC_PASSWORD;
  const configured = Boolean(username && password);

  if (searchParams.get('probe') === '1') {
    return NextResponse.json({ configured, dataset: 416 });
  }

  if (!configured) {
    return NextResponse.json(
      { events: [], total: 0, configured: false, error: 'Vejdirektoratet credentials are not configured' },
      { status: 503 }
    );
  }

  const endpoint = process.env.VD_TRAFFIC_URL || DEFAULT_URL;
  const token = Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: `Basic ${token}`, Accept: 'application/xml,text/xml,*/*' },
      cache: 'no-store',
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) throw new Error(`Vejdirektoratet HTTP ${res.status}`);

    const xml = await res.text();
    const events = extractEvents(xml);

    return NextResponse.json(
      { events, total: events.length, configured: true, source: 'Vejdirektoratet Traffic Events and Road Works', timestamp: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=300' } }
    );
  } catch (e) {
    console.error('[OSIRIS] DK traffic fetch failed:', e);
    return NextResponse.json(
      { events: [], total: 0, configured: true, error: e instanceof Error ? e.message : 'Failed to fetch traffic data' },
      { status: 502 }
    );
  }
}
