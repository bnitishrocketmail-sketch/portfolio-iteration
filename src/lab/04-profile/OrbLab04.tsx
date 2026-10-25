import { useState } from 'react';
import { SlideGroup } from './SlidePill04';
import Orb04 from './Orb04';
import './profile.css';
import './orb.css';

/* A page to look at the orb on its own before it goes into the Workflow page (Nitish, 17 Oct: "before putting it in a
   whole experience … let's just build this sphere first and show it to me, and we will improvise and finalize this
   first"). It sits on 04's frame colour, in either theme, with a few controls; the values shown are the ones to keep. */
const SIZES: [number, string][] = [[2, 'Larger'], [3, 'Medium'], [4, 'Smaller']];

export default function OrbLab04() {
  const [light, setLight] = useState(false);
  const [freq, setFreq] = useState(2); // 80 faces, chosen 17 Oct
  const [speedX, setSpeedX] = useState(14);
  const [speedY, setSpeedY] = useState(22);
  const [dot, setDot] = useState(2.2);
  const [line, setLine] = useState(1);
  const [fade, setFade] = useState(.78);
  const slider = (label: string, v: number, set: (n: number) => void, min: number, max: number, step: number, unit = '') => (
    <label className="orbl-row"><span>{label}</span><input type="range" min={min} max={max} step={step} value={v} onChange={e => set(+e.target.value)} /><b>{v}{unit}</b></label>
  );
  return (
    <div className={`it04 orbl${light ? ' light' : ''}`}>
      <div className="orbl-stage"><Orb04 key={String(light)} freq={freq} speedX={speedX} speedY={speedY} dot={dot} line={line} fade={fade} /></div>
      <div className="orbl-panel">
        <SlideGroup className="orbl-seg" role="group" aria-label="Triangle size">
          {SIZES.map(([f, l]) => <button key={f} type="button" aria-pressed={freq === f} className={freq === f ? 'on' : ''} onClick={() => setFreq(f)}>{l}<small>{20 * f * f} faces</small></button>)}
        </SlideGroup>
        {slider('Turn on X', speedX, setSpeedX, 0, 60, 1, '°/s')}
        {slider('Turn on Y', speedY, setSpeedY, 0, 60, 1, '°/s')}
        {slider('Dots', dot, setDot, 0, 5, .1, 'px')}
        {slider('Wires', line, setLine, .3, 3, .1, 'px')}
        {slider('Back fades', fade, setFade, 0, .95, .01)}
        <SlideGroup className="orbl-seg" role="group" aria-label="Theme">
          {[false, true].map(l => <button key={String(l)} type="button" aria-pressed={light === l} className={light === l ? 'on' : ''} onClick={() => setLight(l)}>{l ? 'Light' : 'Dark'}</button>)}
        </SlideGroup>
      </div>
    </div>
  );
}
