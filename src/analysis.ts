import type { Dive } from './parser';
export function deriveAnalysis(dive: Dive) {
  const depths = dive.samples.flatMap(s => s.depth === null ? [] : [s.depth]);
  const maxAscent = rate(dive.samples, true), maxDescent = rate(dive.samples, false);
  const bands = [{label:'0–10 m',min:0,max:10},{label:'10–20 m',min:10,max:20},{label:'20–30 m',min:20,max:30},{label:'30+ m',min:30,max:Infinity}]
    .map(b => ({...b, minutes: dive.samples.reduce((sum,s,i) => { const next=dive.samples[i+1]; return sum + (next && s.depth !== null && s.depth >= b.min && s.depth < b.max ? next.time-s.time : 0); },0) }));
  const pressure = dive.samples.flatMap(s => s.pressure === null ? [] : [s.pressure]);
  const ndls = dive.samples.flatMap(s => s.ndl === null ? [] : [s.ndl]);
  return { observedMaxDepth: depths.length ? Math.max(...depths) : undefined, maxAscent, maxDescent,
    bands: bands.filter(b=>b.minutes>0), minNdl: ndls.length ? Math.min(...ndls) : undefined,
    averageNdl: ndls.length ? ndls.reduce((a,b)=>a+b,0)/ndls.length : undefined,
    startingPressure: dive.cylinder?.startBar ?? pressure[0], endingPressure: dive.cylinder?.endBar ?? pressure.at(-1),
    gasUsed: dive.cylinder?.startBar !== undefined && dive.cylinder.endBar !== undefined ? dive.cylinder.startBar-dive.cylinder.endBar : undefined,
    pressureRate: pressure.length>1 ? Math.abs(pressure.at(-1)!-pressure[0]) / ((dive.samples.at(-1)!.time-dive.samples[0].time)/60) : undefined,
  };
}
function rate(samples: Dive['samples'], ascent: boolean): number | undefined {
  const rates:number[]=[];
  for(let i=1;i<samples.length;i++){const a=samples[i-1],b=samples[i]; if(a.depth===null||b.depth===null||b.time===a.time)continue; const r=(a.depth-b.depth)/(b.time-a.time); if((ascent&&r>0)||(!ascent&&r<0)) rates.push(Math.abs(r));}
  return rates.length?Math.max(...rates):undefined;
}
