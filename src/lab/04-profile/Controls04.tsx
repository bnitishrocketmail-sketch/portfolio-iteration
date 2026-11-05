import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTROLS, PUBLISHED, defOf, publishable, writeTweaks, type Control } from './tokens';
import { useFiveTaps } from './secret';
import './system.css';

/* The control centre (Nitish, 22 Oct: "the earlier approach — a panel that opens at the side of the same screen — was
   better; a button in it opens the whole design-system page"): the chip at the page's foot opens a panel down the left
   side with the same controls the design-system page has (tokens.ts), for the mode the site is in; at its top, the way
   to the whole page. Values go to the browser as before, so the page and the design system stay in step. */
const KEY = 'it04-publish-key'; /* his publish password, kept on his own device so it's typed once (5 Nov) */
const readKey = () => { try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; } };
const when = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

export default function Controls04({ values, onChange, dark, toggle, onSystem, secret = false }: { values: Record<string, string>; onChange: (v: Record<string, string>) => void; dark: boolean; toggle: () => void; onSystem?: boolean; secret?: boolean /* hidden in place until tapped five times (Workflow, 28 Oct; secret.ts) */ }) {
  const [open, setOpen] = useState(false);
  const five = useFiveTaps('controls', secret && !open);
  const [copied, setCopied] = useState(false);
  const set = (k: string, v: string) => { const next = { ...values, [k]: v }; onChange(next); writeTweaks(dark, next); };
  const reset = () => { onChange({}); writeTweaks(dark, {}); };
  const copy = () => { const out = Object.fromEntries([['Mode', dark ? 'dark' : 'light'] as [string, string]].concat(CONTROLS.map(c => [`${c.group} · ${c.sub} · ${c.label}`, values[c.key] ?? defOf(c, dark)]))); navigator.clipboard?.writeText(JSON.stringify(out, null, 2)).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); }); };
  /* Publish (5 Nov, Nitish: "rather than asking you to make them default, I can just publish those changes from there and
     they become default for anyone who goes to that link"): both modes' values as this browser shows them, where they
     differ from the code's defaults, go to /api/publish with his password; it commits published.json and Vercel builds
     the site with them baked in. Visitors get them on their next load; this browser's own tweaks stay on top meanwhile. */
  const [key, setKey] = useState(readKey);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const saveKey = (v: string) => { setKey(v); try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch { /* fine */ } };
  const publish = async (e: React.FormEvent) => {
    e.preventDefault(); if (busy || !key) return;
    setBusy(true); setNote(null);
    try {
      const d = publishable(true), l = publishable(false);
      const r = await fetch('/api/publish', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ key, dark: d, light: l }) });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; unchanged?: boolean; sha?: string; error?: string };
      if (!r.ok) throw new Error(j.error || `The publish function answered ${r.status}.`);
      if (!j.ok) throw new Error('The publish function didn’t answer — the site came back instead of it.');
      const n = Object.keys(d).length + Object.keys(l).length;
      setNote({ ok: true, text: j.unchanged ? 'Already published — nothing has changed since.' : `Published ${n} value${n === 1 ? '' : 's'} (commit ${j.sha}). Vercel is building it: live in about a minute, on the next load.` });
    } catch (err) { setNote({ ok: false, text: err instanceof Error ? err.message : 'Couldn’t publish.' }); }
    finally { setBusy(false); }
  };
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
      <button type="button" className={`tweaks4 tw-toggle${five.hidden ? ' secret4' : ''}`} aria-expanded={open} tabIndex={five.hidden ? -1 : undefined} onClickCapture={five.capture} onClick={() => setOpen(o => !o)}>{open ? 'Close' : 'Controls'}</button>
      {open && (
        <aside className="sys-controls ctl4" aria-label="Controls">
          {onSystem ? <Link className="ctl4-sys" to="/lab/04-profile">← Back to the profile</Link> : <Link className="ctl4-sys" to="/lab/04-system">Open the design system →</Link>}
          <div className="sys-actions"><button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy values'}</button><button type="button" onClick={reset}>Reset this mode</button><button type="button" onClick={toggle}>Site to {dark ? 'light' : 'dark'}</button></div>
          <form className="sys-publish" onSubmit={publish}>
            <input type="password" value={key} onChange={e => saveKey(e.target.value)} placeholder="Publish password" aria-label="Publish password" autoComplete="off" />
            <button type="submit" disabled={busy || !key}>{busy ? 'Publishing…' : 'Publish'}</button>
            <p className={note && !note.ok ? 'err' : undefined}>{note ? note.text : PUBLISHED.at ? `This build carries the values published ${when(PUBLISHED.at)}. Publish sends both modes, as this browser shows them.` : 'Nothing published yet — the site runs on the code’s defaults. Publish sends both modes, as this browser shows them.'}</p>
          </form>
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
