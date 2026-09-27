export interface DiveSample { time: number; depth: number | null; temperature: number | null; pressure: number | null; ndl: number | null; }
export interface Cylinder { description?: string; sizeL?: number; workingPressureBar?: number; oxygenPercent?: number; startBar?: number; endBar?: number; }
export interface Dive { filename: string; number?: string; date?: string; time?: string; durationMinutes?: number; site?: string; gps?: string; device?: string; maxDepthM?: number; averageDepthM?: number; minTemperatureC?: number; maxTemperatureC?: number; gasMix?: string; cylinder?: Cylinder; sacLMin?: number; samples: DiveSample[]; rawXml: string; }
export class DiveParseError extends Error {}

export function numeric(value?: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(n) ? n : undefined;
}
export function minutes(value?: string | null): number | undefined {
  if (!value) return undefined;
  const m = value.match(/^(?:(\d+):)?(\d+)(?:[.,](\d+))?/);
  if (!m) return undefined;
  return Number(m[1] ?? 0) + Number(m[2]) / 60 + Number(`0.${m[3] ?? 0}`) / 60;
}
function unit(value?: string | null, wanted = 'm'): number | undefined {
  const n = numeric(value);
  if (n === undefined) return undefined;
  const u = value?.match(/[a-zA-Z%/]+/)?.[0]?.toLowerCase();
  if (wanted === 'm' && u === 'ft') return n * 0.3048;
  if (wanted === 'c' && u === 'f') return (n - 32) * 5 / 9;
  if (wanted === 'bar' && u === 'psi') return n / 14.5038;
  return n;
}
function attr(el: Element | null, key: string): string | undefined { return el?.getAttribute(key) ?? undefined; }

export function parseDive(xml: string, filename = 'dive.ssrf'): Dive {
  let doc: Document;
  try { doc = new DOMParser().parseFromString(xml, 'application/xml'); }
  catch { throw new DiveParseError('This file is not valid XML.'); }
  if (doc.querySelector('parsererror')) throw new DiveParseError('This file contains malformed XML.');
  const root = doc.documentElement;
  if (root.tagName !== 'divelog' || root.getAttribute('program') !== 'subsurface') throw new DiveParseError('This is not a Subsurface dive log.');
  const dives = [...doc.querySelectorAll(':scope > dives > dive')];
  if (dives.length === 0) throw new DiveParseError('No dives were found in this file.');
  if (dives.length > 1) throw new DiveParseError('This file contains more than one dive. Export a single dive and try again.');
  const d = dives[0], dc = d.querySelector('divecomputer');
  if (!dc) throw new DiveParseError('The dive has no computer profile to analyze.');
  const sites = [...doc.querySelectorAll(':scope > divesites > site')];
  const site = sites.find(s => s.getAttribute('uuid') === d.getAttribute('divesiteid'));
  const cyl = d.querySelector('cylinder');
  const cylinder: Cylinder | undefined = cyl ? {
    description: attr(cyl, 'description'), sizeL: unit(attr(cyl, 'size'), 'l'),
    workingPressureBar: unit(attr(cyl, 'workpressure'), 'bar'), oxygenPercent: numeric(attr(cyl, 'o2')),
    startBar: unit(attr(cyl, 'start'), 'bar'), endBar: unit(attr(cyl, 'end'), 'bar'),
  } : undefined;
  const depth = dc.querySelector('depth');
  const samples = [...dc.querySelectorAll('sample')].map(s => ({
    time: minutes(attr(s, 'time')) ?? 0, depth: unit(attr(s, 'depth')) ?? null, temperature: unit(attr(s, 'temp'), 'c') ?? null,
    pressure: unit(attr(s, 'pressure0') ?? attr(s, 'pressure'), 'bar') ?? null, ndl: minutes(attr(s, 'ndl')) ?? null,
  })).sort((a,b) => a.time - b.time);
  if (!samples.length) throw new DiveParseError('No profile samples were found in this dive.');
  const temps = samples.flatMap(s => s.temperature === null ? [] : [s.temperature]);
  const gas = cylinder?.oxygenPercent;
  return {
    filename, number: attr(d,'number'), date: attr(d,'date'), time: attr(d,'time'), durationMinutes: minutes(attr(d,'duration')),
    site: attr(site ?? null,'name'), gps: attr(site ?? null,'gps'), device: attr(dc,'model'),
    maxDepthM: unit(attr(depth,'max')), averageDepthM: unit(attr(depth,'mean')),
    minTemperatureC: temps.length ? Math.min(...temps) : unit(attr(dc.querySelector('temperature'),'water'),'c'),
    maxTemperatureC: temps.length ? Math.max(...temps) : unit(attr(dc.querySelector('temperature'),'water'),'c'),
    gasMix: gas === undefined ? undefined : `EAN${Math.round(gas)}`, cylinder,
    sacLMin: unit(attr(d,'sac'),'l'), samples, rawXml: xml,
  };
}

export function friendlyName(filename: string): string {
  return filename.replace(/\.ssrf$/i,'').replace(/^\d+-/, '').split(/[-_]/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' ');
}
