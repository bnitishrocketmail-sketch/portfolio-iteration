import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Lottie } from '../../components/micro/Lottie';
import { LOTTIES, STILL } from '../../lib/lotties';
import { PROJECTS } from '../../lib/data';
import './lab.css';

/* 04's Lab (Nitish, 20 Oct): the experiments — not the company work, which is Projects' (B is Lenskart's and stays
   there; the Lenskart, MobiKwik and Milkbasket work is still to come). A grid after Iteration 1's project page: a media
   tile on top, the title and a line under it, one card wide. Each tile holds an animated visual that plays on hover
   (desktop) and, on the phone, one at a time — the first until the user scrolls, then whichever tile is nearest the
   middle of the screen takes over (a threshold, so the hand-over happens as a tile passes the centre). The Motion system
   lives here as a project (its nav tab is gone); its page opens from the card.
   The visuals, as chosen for now (his judgement to change): the Motion system's drawer rising and settling, in CSS;
   the coin's Lottie for Coin Rig and for the rupee coin; sketches in CSS of what RideQuest and the Swiggy nav are —
   a car along a road, a pill sliding between tabs — until their own visuals exist. */

type Exp = { id: string; title: string; line: string; meta: string; wide?: boolean; visual: (on: boolean) => ReactNode; to?: string };
const P = Object.fromEntries(PROJECTS.map(p => [p.id, p]));

/* the visuals: each takes `on` and animates only then (CSS plays on .on; a Lottie plays on `playing`) */
const Drawer = ({ on }: { on: boolean }) => (
  <div className={`lv lv-drawer${on ? ' on' : ''}`} aria-hidden="true">
    <div className="ph"><i className="h" /><i className="c" /><i className="c" /><div className="scrim" /><div className="sheet"><i /><i /><i /><b /></div></div>
  </div>
);
const Coin = ({ on }: { on: boolean }) => <div className="lv lv-coin" aria-hidden="true"><Lottie className="lot" src={LOTTIES.coin} still={STILL.coin} playing={on} /></div>;
const Ride = ({ on }: { on: boolean }) => (
  <div className={`lv lv-ride${on ? ' on' : ''}`} aria-hidden="true"><div className="road"><i /><i /><i /><i /><i /><i /></div><div className="car"><b /><s /><s /></div></div>
);
const Nav = ({ on }: { on: boolean }) => (
  <div className={`lv lv-nav${on ? ' on' : ''}`} aria-hidden="true"><div className="bar"><div className="pill" /><i /><i /><i /><i /></div></div>
);

const EXPS: Exp[] = [
  { id: 'motion-system', title: 'Motion design system', line: 'One set of motion decisions, defined once and inherited by every screen — with the drawer, the cascade and the token phone running.', meta: 'System · 2026', visual: on => <Drawer on={on} />, to: 'motion' },
  { id: 'coin-rig', title: P['coin-rig'].title, line: P['coin-rig'].blurb, meta: `${P['coin-rig'].client} · ${P['coin-rig'].year}`, visual: on => <Coin on={on} /> },
  { id: 'rupee-coin', title: P['rupee-coin'].title, line: P['rupee-coin'].blurb, meta: `${P['rupee-coin'].client} · ${P['rupee-coin'].year}`, visual: on => <Coin on={on} /> },
  { id: 'ridequest', title: P['ridequest'].title, line: P['ridequest'].blurb, meta: `${P['ridequest'].client} · ${P['ridequest'].year}`, visual: on => <Ride on={on} /> },
  { id: 'swiggy-nav', title: P['swiggy-nav'].title, line: P['swiggy-nav'].blurb, meta: `${P['swiggy-nav'].client} · ${P['swiggy-nav'].year}`, visual: on => <Nav on={on} /> },
];

export default function Lab04({ onOpen }: { onOpen: (view: string) => void }) {
  const grid = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [near, setNear] = useState<string>(EXPS[0].id); // the phone: the tile nearest the screen's middle
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches);
  useEffect(() => { const mq = window.matchMedia('(hover: none)'); const on = () => setPhone(mq.matches); mq.addEventListener('change', on); return () => mq.removeEventListener('change', on); }, []);
  /* the phone's hand-over: on scroll, the tile whose centre is nearest the screen's middle plays; the first plays until
     the user has scrolled past it (so the page opens with the first running, as asked) */
  useEffect(() => {
    if (!phone) return;
    const g = grid.current; if (!g) return;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight * .45;
      let best = EXPS[0].id, d = Infinity;
      g.querySelectorAll<HTMLElement>('[data-exp]').forEach(el => { const r = el.getBoundingClientRect(); const c = r.top + r.height / 2; const dd = Math.abs(c - mid); if (dd < d) { d = dd; best = el.dataset.exp!; } });
      setNear(best);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(pick); };
    pick(); addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, [phone]);
  const playing = (id: string) => (phone ? near === id : hover === id);
  return (
    <section className="pp4 lb4" aria-label="Lab">
      <header className="pp4-head">
        <h2 className="h2-4">Lab</h2>
        <div className="pp4-right"><p className="pp4-note">Experiments: the rigs, the plugin, the systems and the concepts, built to be played with.</p></div>
      </header>
      <div className="lb4-grid" ref={grid}>
        {EXPS.map(e => (
          <article key={e.id} data-exp={e.id} className={`lb4-card${e.wide ? ' wide' : ''}${playing(e.id) ? ' live' : ''}`}
            onPointerEnter={ev => { if (ev.pointerType !== 'touch') setHover(e.id); }} onPointerLeave={ev => { if (ev.pointerType !== 'touch') setHover(h => (h === e.id ? null : h)); }}>
            <button type="button" className="lb4-hit" aria-label={`Open ${e.title}`} onClick={() => e.to && onOpen(e.to)} disabled={!e.to} />
            <div className="lb4-media">{e.visual(playing(e.id))}</div>
            <div className="lb4-body">
              <div className="lb4-top"><h3>{e.title}</h3><span className="lb4-meta">{e.meta}</span></div>
              <p>{e.line}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
