import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDive, DiveParseError, minutes, friendlyName } from './parser';
import { deriveAnalysis } from './analysis';
const fixture=(name:string)=>readFileSync(resolve('public/sample-dives',name),'utf8');

describe('Subsurface SSRF parser',()=>{
 it('parses old DL7 profiles from real source XML',()=>{const d=parseDive(fixture('017-long-dl7.ssrf'),'017-long-dl7.ssrf');expect(d.device).toBe('DL7');expect(d.samples.length).toBeGreaterThan(1000);expect(d.maxDepthM).toBeCloseTo(18.898);expect(d.cylinder?.oxygenPercent).toBe(34);expect(d.minTemperatureC).toBeDefined()});
 it('accepts all ten supplied real sample files',()=>{const files=readdirSync('public/sample-dives').filter(file=>file.endsWith('.ssrf'));expect(files).toHaveLength(10);for(const file of files)expect(parseDive(fixture(file),file).samples.length).toBeGreaterThan(0)});
 it('parses sparse manual profiles without inventing sensors',()=>{const d=parseDive(fixture('008-manual-sparse-edge-case.ssrf'));expect(d.samples).toHaveLength(8);expect(d.device).toContain('manually');expect(d.minTemperatureC).toBeUndefined();expect(d.samples.every(s=>s.pressure===null&&s.ndl===null)).toBe(true)});
 it('parses rich Teric pressure and NDL samples',()=>{const d=parseDive(fixture('083-rich-pressure-ndl-teric.ssrf'));expect(d.device).toContain('Teric');expect(d.samples.some(s=>s.pressure!==null)).toBe(true);expect(d.samples.some(s=>s.ndl!==null)).toBe(true);expect(deriveAnalysis(d).minNdl).toBeDefined()});
 it('handles a dive with no cylinder as valid data',()=>{const d=parseDive(fixture('031-vandenberg-wreck-dl7.ssrf'));expect(d.cylinder).toBeUndefined();expect(d.maxDepthM).toBeGreaterThan(30)});
 it('rejects malformed XML and multiple dives clearly',()=>{expect(()=>parseDive('<divelog><dives>')).toThrow(DiveParseError);const one=fixture('001-shallow-dl7.ssrf');const two=one.replace('</dives>',''+one.match(/<dive number="1"[\s\S]*?<\/dive>/)?.[0]+'</dives>');expect(()=>parseDive(two)).toThrow(/more than one dive/i)});
 it('rejects a valid Subsurface file with no dives',()=>{expect(()=>parseDive('<divelog program="subsurface"><dives/></divelog>')).toThrow(/no dives/i)});
 it('parses time units and sample names',()=>{expect(minutes('1:30 min')).toBeCloseTo(1.5);expect(minutes('41:49 min')).toBeCloseTo(41+49/60);expect(friendlyName('083-rich-pressure-ndl-teric.ssrf')).toBe('Rich Pressure Ndl Teric')});
 it('calculates pressure consumption only when profile pressure exists',()=>{const d=parseDive(fixture('083-rich-pressure-ndl-teric.ssrf'));const a=deriveAnalysis(d);expect(a.startingPressure).toBeGreaterThan(0);expect(a.endingPressure).toBeGreaterThan(0);expect(deriveAnalysis(parseDive(fixture('008-manual-sparse-edge-case.ssrf'))).pressureRate).toBeUndefined()});
});
