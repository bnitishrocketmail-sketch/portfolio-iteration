import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTROLS, defOf, writeTweaks, type Control } from './tokens';
import './system.css';

/* The control centre (Nitish, 22 Oct: "the earlier approach — a panel that opens at the side of the same screen — was
   better; a button in it opens the whole design-system page"): the chip at the page's foot opens a panel down the left
   side with the same controls the design-system page has (tokens.ts), for the mode the site is in; at its top, the way
   to the whole page. Values go to the browser as before, so the page and the design system stay in step. */
export default function Controls04({ values, onChange, dark, toggle }: { values: Record<string, string>; onChange: (v: Record<string, string>) => void; dark: boolean; toggle: () => void }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (k: string, v: string) => { const next = { ...values, [k]: v }; onChange(next); writeTweaks(dark, next); };
  const reset = () => { onChange({}); writeTweaks(dark, {}); };
  const copy = () => { const out = Object.fromEntries([['Mode', dark ? 'dark' : 'light'] as [string, string]].concat(CONTROLS.map(c => [`${c.group} · ${c.sub} · ${c.label}`, values[c.key] ?? defOf(c, dark)]))); navigator.clipboard?.writeText(JSON.stringify(out, null, 2)).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); }); };
  const groups = [...new Set(CONTROLS.map(c => c.group))];
  const field = (c: Control) => {
    const v = values[c.key] ?? defOf(c, dark);
    return (
      <label key={c.key}><span>{c.label}</span>
        {c.kind === 'color' && <input type="color" value={v} onChange={e => set(c.key, e.target.value)} />}
        {c.kind === 'range' && <span className="tw-range"><input type="range" min={c.min} max={c.max} step={c.step} value={parseFloat(v)} onChange={e => set(c.key, e.target.value + (c.unit ?? ''))} /><output>{v}</output></span>}
        {c.kind === 'select' && <select value={v} onChange={e => set(c.key, e.target.value)}>{c.options.map(([l, val]) => <option key={val} value={val}>{l}</option>)}</select>}
      </label>
    );
  };
  return (
    <>
      <button type="button" className="tweaks4 tw-toggle" aria-expanded={open} onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Controls'}</button>
      {open && (
        <aside className="sys-controls cc4" aria-label="Controls">
          <Link className="cc4-sys" to="/lab/04-system">Open the design system →</Link>
          <div className="sys-actions"><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy values'}</button><button type="button" onClick={reset}>Reset this mode</button><button type="button" onClick={toggle}>Site to {dark ? 'light' : 'dark'}</button></div>
          {groups.map((g, gi) => {
            const subs = [...new Set(CONTROLS.filter(c => c.group === g).map(c => c.sub))];
            return (
              <details key={g} open={gi === groups.length - 1}>
                <summary>{g}</summary>
                {subs.map(sub => <div key={sub}><h5>{sub}</h5>{CONTROLS.filter(c => c.group === g && c.sub === sub).map(field)}</div>)}
              </details>
            );
          })}
        </aside>
      )}
    </>
  );
}
