import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { animate } from 'motion/react';
import { Lottie } from '../../components/micro/Lottie';
import Signature04 from './Signature04';
import BMachine from './BMachine';
import Fintech3D, { Launches3D } from './Fintech3D';
import { useInView } from './inview';
import { Arrow04 } from './Arrow04';
import { sCorner, sysCurve } from './curve';
import desk from '../../assets/nitish-desk.webp';
import { PROJECTS04, type Project } from '../../lib/data';
import { CASES, type Block, type Layer, type Media, type Rich, type Step } from './cases';
import { MAIL, SOCIAL } from './social';
import './case.css';

/* 04's case study (Nitish, 21 Oct): a company project opened from the Projects row or the home stack. His Framer site
   opened a project as a sheet over the home page; here it takes the page's place with the nav staying, as the other
   sections do. The page follows his old layout more closely than the first cut did (21 Oct, second pass: "I'm
   skeptical about the sticky bar … things are getting cramped … take a lot of reference from my initial portfolio"):
   no panel at the side — the page's head as on the other sections (the back link and the title at the left, the
   one-liner at the right), then, scrolling in full width, the hero slot with an information strip under it (the four
   facts his page listed there — role, type, team, focus — and the tags), then the sections as cards in the theme's light
   grey. Every visual is an empty slot of its shape — a wide video, a photo, a phone screen upright or on its side —
   labelled with what goes in it, to be filled with what he sends. The Final flow's screens are steps wired to each
   other with drawn curves, as his page had them, rather than stacked. One spacing scale runs through the page (the
   --s1…--s5 tokens in case.css). The text styles are the system's: H2 for the title, the open card's display size for a
   section's heading, body emphasised for a sub-heading, body for copy, meta for captions, labels and facts. */

const f2 = (n: number) => n.toFixed(1);
const text = (r: Rich): ReactNode => r.map((x, i) => (typeof x === 'string' ? x : <b key={i}>{x.b}</b>));
const RATIO: Record<Media['shape'], string> = { wide: '2 / 1', video: '16 / 9', image: '4 / 3', phone: '9 / 19.5', 'phone-land': '19.5 / 9', small: '3 / 2', screen: '9 / 14.5' };
function Clip({ src, poster, on, crop, fit }: { src: string; poster?: string; on: boolean; crop?: number; fit?: Media['fit'] }) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  useEffect(() => { const v = ref.current; if (!v) return; if (on && !still) v.play().catch(() => {}); else v.pause(); }, [on, still]);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" style={fit ? fitStyle(fit) : crop ? { left: `-${crop}%`, top: `-${crop}%`, width: `${100 + 2 * crop}%`, height: `${100 + 2 * crop}%` } : undefined} />; /* a replaced element keeps its own size under inset alone, so the size is spelled out */
}
const fitStyle = ({ box: [x, y, w, h], fade }: NonNullable<Media['fit']>): CSSProperties => {
  const mask = fade ? `linear-gradient(#000 ${100 - fade}%, transparent)` : undefined;
  return { left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, borderRadius: 0, WebkitMaskImage: mask, maskImage: mask };
};
/* a slot: empty, it shows its shape and its name; filled (22 Oct), it holds the page's own picture or clip, with any
   Lotties layered over it where his page had them */
function Slot({ m, fl, active = true }: { m: Media; fl?: string; active?: boolean /* false holds a clip or Lottie still (the hero's screens at the sides) */ }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref) && active;
  const clip = !!m.src && /\.mp4$/.test(m.src);
  const filled = !!(m.src || m.lottie || m.layers?.length); /* a slot of layers alone (a Lottie set to cover a phone) is filled too */
  return (
    <div ref={ref} className={`cs4-media ${m.shape}${filled ? ' filled' : ''}${m.lottie ? ' lot' : ''}`} data-fl={fl} style={{ aspectRatio: m.ratio ?? RATIO[m.shape], background: m.bg }} role="img" aria-label={filled ? `${m.cap ?? m.label}` : `${m.label} (to come)`}>
      {m.src ? (clip ? <Clip src={m.src} poster={m.poster} on={on} crop={m.crop} fit={m.fit} /> : <img src={m.src} alt="" loading="lazy" decoding="async" style={m.crop ? { left: `-${m.crop}%`, top: `-${m.crop}%`, width: `${100 + 2 * m.crop}%`, height: `${100 + 2 * m.crop}%` } : undefined} />) : m.lottie ? <Lottie className="cs4-lot" src={m.lottie} playing={on} /> : <span className="cs4-slot">{m.label}</span>}
      {m.layers?.filter(l => !l.over).map((l, i) => <LayerBox key={i} l={l} on={on} />)}
    </div>
  );
}
/* the customer asking (his FAQ panel's icon): a head over shoulders, in one grey (case.css) */
function Asker() {
  return <svg className="cs4-faq-asker" viewBox="0 0 22 30" aria-hidden="true"><circle cx="11" cy="6.5" r="6" /><rect x="0" y="14" width="22" height="16" rx="7" /></svg>;
}
/* a layer by its box: a Lottie or a picture; a Lottie is fetched once its slot has been on screen (the fintech page's
   six cells carry 3 MB of them) */
function LayerBox({ l, on }: { l: Layer; on: boolean }) {
  const [seen, setSeen] = useState(on);
  useEffect(() => { if (on) setSeen(true); }, [on]);
  return (
    <div className="cs4-layer" style={{ left: `${l.box[0]}%`, top: `${l.box[1]}%`, width: `${l.box[2]}%`, height: `${l.box[3]}%` }}>
      {l.kind === 'lottie' ? (seen && <Lottie className="cs4-lot" src={l.src} playing={on} />) : <img src={l.src} alt="" />}
    </div>
  );
}

/* a figure: the slot and its caption; a layer that runs past the slot (`over`) sits beside the slot, outside its clipping */
function Fig({ m, cls, fl }: { m: Media; cls?: string; fl?: string }) {
  const over = m.layers?.filter(l => l.over);
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref);
  return (
    <figure ref={ref} className={`cs4-fig ${m.shape}${cls ? ' ' + cls : ''}`} data-fl={fl}>
      {over?.length ? <div className="cs4-over"><Slot m={m} fl={fl && fl + '.m'} />{over.map((l, i) => <LayerBox key={i} l={l} on={on} />)}</div> : <Slot m={m} fl={fl && fl + '.m'} />}
      {m.cap && <figcaption>{m.cap}</figcaption>}
    </figure>
  );
}

/* his nudges at the hesitation points (24 Oct, Nitish: "the phones with only the 25% of the bottom part visible, fading
   out from the top with a gradient of the same background colour … in between, Copilot motion nudges with arrows
   pointing both ways, inside a pill"; then: "the phones the same standard size as the page's … the nudges a little
   bigger and spilled out from both sides of the screens … a PLP screen behind … the spacing round the capsule clean"):
   two phones seen at their foot only, a screen behind; each nudge a little above the bottom edge, across its screen's
   width, as his page placed it, so the two read at one size (25 Oct: inside the screen again — the spill past its sides
   "is not working out"; the phones a quarter over the study's size); the label in the system's marking pill between
   them, level with the nudges, the same clear gap from each phone */
/* the nudges placed as the product would (25 Oct, Nitish): on a 360 × 780dp screen, each nudge by what it draws at
   its widest (`vis`, measured over its loop), centred across the screen, 16dp clear of each side at full size (`k`
   shrinks one: B's at 90% — "very close to the right border … reduce it by 10%"), its middle on the line the PDP's
   own nudge floats on, over its Add to Cart bar (81.7% down: his spilled pill on the PDP below, its drawn middle) —
   "place the nudge exactly where it is placed on the PDP screen … very much inside the screen". Without `vis`, his
   page's placement: across 94%, its middle 89.4% down */
const SCR_W = 360, SCR_H = 780, SIDE = 16, LINE = .817;
type Nudge = { label: string; lottie: string; ratio: number; vis?: [number, number, number, number]; k?: number };
function place(n: Nudge) {
  if (!n.vis) { const h = 94 / n.ratio * SCR_W / SCR_H; return { left: 3, width: 94, top: 89.4 - h / 2, mid: .894 }; }
  const [x0, x1, y0, y1] = n.vis, vw = (SCR_W - 2 * SIDE) * (n.k ?? 1), w = vw / (x1 - x0), h = w / n.ratio;
  const left = (SCR_W - vw) / 2 - x0 * w, top = LINE * SCR_H - (y0 + y1) / 2 * h;
  return { left: left / SCR_W * 100, width: w / SCR_W * 100, top: top / SCR_H * 100, mid: LINE };
}
const PHONE = 19.5 / 9, SHOT = 1600 / 720; /* the phone's height / width; a screen picture's */
function Peek({ label, show = 25, screen, at, of }: { label: string; show?: number; screen?: string; at?: number; of: Nudge[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref);
  const f = show / 100, P = of.map(place), line = P.reduce((s, q) => s + q.mid, 0) / P.length;
  const mid = (line - (1 - f)) / f; /* the nudges' line, down the part in view; the rows mid : 1 − mid round the pill put its middle short of it by (2·mid − 1)/2 of its height, which the pill's translate gives back */
  const a = at ?? (1 - f) * PHONE / SHOT, imgTop = (1 - f) - a * SHOT / PHONE; /* the picture's fraction `a` at the top of the view */
  const arrow = (d: string) => <svg viewBox="0 0 16 16" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  const phone = (n: Nudge, q: ReturnType<typeof place>) => (
    <div className="cs4-peek-win" style={{ aspectRatio: `9 / ${(19.5 * f).toFixed(3)}` }} role="img" aria-label={n.label}>
      <div className="cs4-peek-ph">
        <div className="cs4-peek-scr">{screen && <img src={screen} alt="" width={720} height={1600} loading="lazy" decoding="async" style={{ top: `${(imgTop * 100).toFixed(2)}%` }} />}</div> {/* its size given, so it has its height before it loads — a lazy picture of no height is never seen to come into view */}
        <div className="cs4-peek-nudge" style={{ aspectRatio: n.ratio, left: `${q.left.toFixed(2)}%`, width: `${q.width.toFixed(2)}%`, top: `${q.top.toFixed(2)}%` }}><Lottie className="cs4-lot" src={n.lottie} playing={on} /></div>
      </div>
    </div>
  );
  return (
    <div ref={ref} className="cs4-peek">
      {phone(of[0], P[0])}
      <div className="cs4-peek-mid" style={{ gridTemplateRows: `${mid.toFixed(4)}fr auto ${(1 - mid).toFixed(4)}fr` }}><span className="cs4-peek-pill" style={{ transform: `translateY(${((2 * mid - 1) * 50).toFixed(2)}%)` }}>{arrow('M13 8H3M7 4 3 8l4 4')}<span>{label}</span>{arrow('M3 8h10M9 4l4 4-4 4')}</span></div>
      {phone(of[1], P[1])}
    </div>
  );
}

/* the loan journey on one home screen (25 Oct, Nitish: "why not just have one screen … these notifications sliding up
   from behind the navigation bar, one by one … below it, the container that tells what notification that is … fade and
   slide in from bottom to top with the same speed and synchronization … 1.5x bigger than the standard size … on the
   right … just showing the bottom 30% of the phone … the same from the top side for the entry point … not blurred …
   its container on the left"). Two views of the study's phone a quarter over its size (his "1.5x"), on the right:
   - the top, for the entry point: the Pay Mobile / UPI ID icon flipping (his Lottie, the app's 56dp tile, laid on the
     icon's tile in the home), the top 30% clear and fading out under it (to 40%);
   - the bottom, for the notifications: the bottom 30% clear and fading out above it (from 46%, room for the tallest,
     EMI overdue, whose top is 42.8% up — the nudges are drawn over the fade, so a tall one stays whole), each nudge rising
     from behind the bottom bar in turn, held while its Lottie plays (its length, 4.5–6.5 s), sinking back; its card
     beside the phone rising and fading in on the same curve and time, and out with it.
   The nudges keep the product's padding
   (16dp in from each side, 16dp over the bar's scan button: jtBox). Held off screen; under reduced motion they fade. */
const JT_W = 360, JT_SIDE = 16, JT_UP = JT_W * (19.5 / 9) / (1520 / 720) * (531 / 1480) + 16; /* the card's foot, up from the screen's: the bar's picture (1480 × 531 across the home's 369.5dp, 2.6% over the screen's width) is 132.6dp tall, its top the scan button's */
const JT_LINE = JT_W * (19.5 / 9) / (1520 / 720) * ((531 - 55) / 1480); /* the bar's own top edge (the picture's row 55), up from the screen's foot: 118.8dp */
const cq = (v: number) => `${(v / JT_W * 100).toFixed(2)}cqw`;
/* a nudge's box: its drawn card (`vis`) 16dp in from each side, its foot JT_UP up; and how far it sinks to be out of
   sight behind the bar (the comp's whole box, glow and all, under the bar's edge) */
const jtBox = (ratio: number, [x0, x1, , y1]: number[]) => {
  const w = (JT_W - 2 * JT_SIDE) / (x1 - x0), h = w / ratio, foot = JT_UP - (1 - y1) * h;
  return { left: cq(JT_SIDE - x0 * w), width: cq(w), height: cq(h), bottom: cq(foot), '--sink': cq(foot + h - JT_LINE + 4) } as CSSProperties;
};
const JN_OUT = 450; /* the sinking (ms), as case.css's */
type Stage = { label: string; q: string; lottie: string; ratio: number; vis: [number, number, number, number]; dur: number };
type Entry = { label: string; q: string; lottie: string; tile: [number, number, number] };
type Told = { h?: string; p?: Rich; ul?: Rich[] }; /* a part of the text beside the figure: a heading, a paragraph, a list */
function Journey({ text: told, screen, bar, of, entry }: { text: Told[]; screen: string; bar: string; of: Stage[]; entry: Entry }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref);
  const [st, setSt] = useState({ i: -1, up: false }); /* the stage in front, and whether it is up */
  useEffect(() => {
    if (!on) return;
    const id = setTimeout(() => setSt(({ i, up }) => (up ? { i, up: false } : { i: (i + 1) % of.length, up: true })), st.up ? of[st.i].dur * 1000 : st.i < 0 ? 400 : JN_OUT + 150);
    return () => clearTimeout(id);
  }, [on, st, of]);
  const [cx, cy, size] = entry.tile; /* the icon's tile in the home picture (720 wide): its middle and its side */
  const k = 1.026316 / 720 * JT_W; /* the picture's px in the screen's dp (it runs 2.6% over the screen's width, centred) */
  return (
    <div ref={ref} className="cs4-jn">
      <div className="cs4-jn-text">
        {told.map((g, j) => (
          <div key={j} className="cs4-jn-part">
            {g.h && <h4 className="cs4-sub">{g.h}</h4>}
            {g.p && <p className="cs4-p">{text(g.p)}</p>}
            {g.ul && <ul className="cs4-ul">{g.ul.map((it, n) => <li key={n}>{text(it)}</li>)}</ul>}
          </div>
        ))}
      </div>
      <div className="cs4-jn-grid">
        <div className="cs4-faq-card cs4-jn-entry"><span className="cs4-faq-label">{entry.label}</span><p className="cs4-faq-ask"><Asker /><span>{entry.q}</span></p></div>
        <div className="cs4-jn-win top" role="img" aria-label={`${entry.label}: the Pay Mobile / UPI ID icon flipping on the home screen`}>
          <div className="cs4-jn-fade"><div className="cs4-jn-ph"><div className="cs4-jn-scr">
            <img className="home" src={screen} alt="" width={720} height={1520} decoding="async" />
            <div className="cs4-jn-icon" style={{ left: cq(cx * k - JT_W * .013158 - size * k / 2), top: cq((cy - size / 2) * k), width: cq(size * k), height: cq(size * k) }}><Lottie className="cs4-lot" src={entry.lottie} playing={on} /></div>
          </div></div></div>
        </div>
        <div className="cs4-jn-win foot" role="img" aria-label={st.i >= 0 ? `${of[st.i].label}: its nudge rising over the home's bottom bar` : 'The home screen’s foot'}>
          <div className="cs4-jn-fade"><div className="cs4-jn-ph"><div className="cs4-jn-scr"><img className="home" src={screen} alt="" width={720} height={1520} decoding="async" /></div></div></div>
          <div className="cs4-jn-ph over"><div className="cs4-jn-scr">
            {of.map((n, j) => <div key={j} className={`cs4-jn-nudge${j === st.i && st.up ? ' up' : ''}`} style={jtBox(n.ratio, n.vis)}><Lottie className="cs4-lot" src={n.lottie} playing={on && j === st.i} /></div>)}
            <img className="bar" src={bar} alt="" width={720} height={258} decoding="async" />
          </div></div>
        </div>
        <div className="cs4-jn-cards">
          {of.map((n, j) => <div key={j} className={`cs4-faq-card cs4-jn-card${j === st.i && st.up ? ' up' : ''}`} aria-hidden={j !== st.i || undefined}><span className="cs4-faq-label">{n.label}</span><p className="cs4-faq-ask"><Asker /><span>{n.q}</span></p></div>)}
        </div>
      </div>
    </div>
  );
}

/* the loaders as they sit in the app (25 Oct, Nitish: "supposed to be inside a phone screen … similar to the card loader in
   the hero … the text … could take up to 10 minutes. We will notify you once it's ready … the bank fetch loader will also
   have content written below it"): the study's phone, the app's screen in it — the hero's right-hand screen laid out the
   same way (the Lottie over the top half, the line at 55%, the dots under it) — its text set in the screen's own width */
type LoaderItem = { label: string; cap: string; ground?: string; lottie: string; box: [number, number, number, number]; title: string; sub?: string; at: number; dots?: boolean; tone?: 'dark'; feather?: boolean };
function LoaderPhone({ l }: { l: LoaderItem }) {
  const ref = useRef<HTMLElement>(null);
  const on = useInView(ref);
  const [x, y, w, h] = l.box;
  return (
    <figure ref={ref} className="cs4-fig phone">
      <div className={`cs4-media phone filled cs4-ld${l.tone === 'dark' ? ' dark' : ''}`} style={{ aspectRatio: '9 / 19.5' }} role="img" aria-label={`${l.label} — “${l.title}${l.sub ? ' ' + l.sub : ''}”`}>
        {l.ground && <img src={l.ground} alt="" loading="lazy" decoding="async" />}
        <div className={`cs4-layer${l.feather ? ' feather' : ''}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }}><Lottie className="cs4-lot" src={l.lottie} playing={on} /></div>
        <div className="cs4-ld-copy" style={{ top: `${l.at}%` }}><b>{l.title}</b>{l.sub && <span>{l.sub}</span>}</div>
        {l.dots && <div className="cs4-layer cs4-ld-dots"><Lottie className="cs4-lot" src="/cases/fintech/dots.lottie" playing={on} /></div>}
      </div>
      <figcaption>{l.cap}</figcaption>
    </figure>
  );
}
/* success states, each in its panel with what it is (25 Oct, Nitish: "write a little bit about every success state … a
   different structure that looks a little better"): the screen at the left, its chip, heading and a line or two at the
   right; the desktop one takes the row */
/* the contact-lens try-on, toured (Nitish, 26 Oct, the third pass: "pause the video and then… take the highlight from the
   area… the container is there… then the interaction plays… the next thing comes… pauses before we tell the user"):
   his recording plays in a phone at the middle. At each feature the recording pauses on the feature's first frame; a node
   grows on the spot where it happens, with a hairline out to the card that comes in at the phone's side, level with the
   node, dark, with the feature's name and a line; after a beat the node and line withdraw and the feature plays, the card
   staying until the feature is over, then going before the recording runs on to the next. The slider's feature plays
   with its node riding the handle (frame by frame, by the frame on screen). A card's tap plays its feature again. The
   geometry is read each frame, so it holds at any size. Under reduced motion the recording holds on its first frame and
   the cards stand in two columns, all shown. On the phone the card comes in under the recording, in one slot, no line */
type TourB = Extract<Block, { k: 'tour' }>;
type Phase = 'idle' | 'mark' | 'play';
const MARK = 1900; /* ms the recording holds on a feature's first frame: the node in (300), the card in, a reading beat, the node out */
const NODE_OUT = 1500; /* the node and line start withdrawing this far into the hold */
const lerpX = (keys: [number, number][], t: number): number => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) { const [t0, x0] = keys[i - 1], [t1, x1] = keys[i]; return x0 + (x1 - x0) * (t - t0) / (t1 - t0 || 1); }
  return keys[keys.length - 1][1];
};
function Tour({ b }: { b: TourB }) {
  const box = useRef<HTMLDivElement>(null), phone = useRef<HTMLDivElement>(null), vid = useRef<HTMLVideoElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const node = useRef<SVGGElement>(null), line = useRef<SVGPathElement>(null);
  const inView = useInView(box, .25);
  const reduce = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [act, setAct] = useState(-1); const [phase, setPhase] = useState<Phase>('idle'); const [nodeOn, setNodeOn] = useState(false);
  const st = useRef({ act: -1, phase: 'idle' as Phase, timers: [] as number[] });
  const clear = () => { st.current.timers.forEach(clearTimeout); st.current.timers = []; };
  const later = (ms: number, f: () => void) => { st.current.timers.push(window.setTimeout(f, ms)); };
  /* the time of the frame on screen (the browser's video-frame callback), not the clock's, for the node on the handle */
  const shown = useRef(-1);
  useEffect(() => {
    const v = vid.current as (HTMLVideoElement & { requestVideoFrameCallback?: (cb: (now: number, m: { mediaTime: number }) => void) => number; cancelVideoFrameCallback?: (id: number) => void }) | null;
    if (!v?.requestVideoFrameCallback) return;
    let id = 0;
    const cb = (_: number, m: { mediaTime: number }) => { shown.current = m.mediaTime; id = v.requestVideoFrameCallback!(cb); };
    id = v.requestVideoFrameCallback(cb);
    return () => v.cancelVideoFrameCallback?.(id);
  }, []);
  /* the feature at `i`: pause on its first frame, mark, then play it */
  const mark = (i: number) => {
    const v = vid.current; if (!v) return;
    clear(); const f = b.of[i];
    v.pause(); v.currentTime = f.t;
    st.current.act = i; st.current.phase = 'mark'; setAct(i); setPhase('mark'); setNodeOn(true);
    if (!f.ride) later(NODE_OUT, () => setNodeOn(false));
    later(MARK, () => { st.current.phase = 'play'; setPhase('play'); v.play().catch(() => {}); });
  };
  useEffect(() => {
    const v = vid.current; if (!v) return;
    if (!inView || reduce) { clear(); v.pause(); return; }
    if (st.current.phase === 'idle') { v.play().catch(() => {}); }
    else if (st.current.phase === 'play') v.play().catch(() => {});
    return clear;
  }, [inView, reduce]);
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = vid.current, bx = box.current, ph = phone.current, g = node.current, l = line.current;
      if (!v || !bx || !ph || !g || !l) return;
      const S = st.current, t = !v.paused && shown.current >= 0 ? shown.current : v.currentTime;
      /* the recording running (idle, or a feature playing): has it reached the next feature, or the end of this one? */
      if (S.phase !== 'mark' && !v.paused) {
        const cur = S.act;
        if (S.phase === 'play' && cur >= 0 && t >= b.of[cur].end) { S.phase = 'idle'; S.act = -1; setPhase('idle'); setAct(-1); setNodeOn(false); }
        const next = b.of.findIndex((f, i) => i !== cur && t >= f.t && t < f.t + .5 && (S.phase === 'idle' || i > cur));
        if (next >= 0 && next !== cur && (S.act < 0 || next > S.act)) { mark(next); return; }
        if (S.phase === 'idle' && t < b.of[0].t && S.act === -2) { /* looped round: start again */ }
      }
      if (S.act < 0) return;
      const f = b.of[S.act];
      const at: [number, number] = f.at === 'track' ? [lerpX(b.track ?? [[0, .5]], S.phase === 'mark' ? f.t : t), b.ty ?? .6] : f.at;
      const B = bx.getBoundingClientRect(), P = ph.getBoundingClientRect();
      const ax = P.left - B.left + at[0] * P.width, ay = P.top - B.top + at[1] * P.height;
      g.setAttribute('transform', `translate(${ax.toFixed(1)} ${ay.toFixed(1)})`);
      const c = cards.current[S.act]; if (!c) return;
      if (S.phase === 'mark' && !c.dataset.placed) { /* the card level with the node, kept inside its column */
        const col = c.parentElement!, Col = col.getBoundingClientRect(), h = c.getBoundingClientRect().height;
        c.style.top = `${Math.max(0, Math.min(ay - (Col.top - B.top) - h / 2, Col.height - h)).toFixed(1)}px`; c.dataset.placed = '1';
      }
      const C = c.getBoundingClientRect();
      const beside = C.bottom > P.top && C.top < P.bottom && (C.right <= P.left || C.left >= P.right);
      if (!beside) { l.setAttribute('d', ''); return; }
      const cx = (C.right <= P.left ? C.right : C.left) - B.left;
      l.setAttribute('d', `M${ax.toFixed(1)} ${ay.toFixed(1)}H${cx.toFixed(1)}`);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, b]);
  /* when the loop comes round, the first feature marks again */
  useEffect(() => { const v = vid.current; if (!v) return; const on = () => { b.of.forEach((_, i) => { const c = cards.current[i]; if (c) delete c.dataset.placed; }); }; v.addEventListener('seeked', on); return () => v.removeEventListener('seeked', on); }, [b]);
  const again = (i: number) => { if (!reduce) mark(i); };
  const card = (f: TourB['of'][number], i: number) => {
    const on = act === i || reduce;
    return (
      <button key={i} type="button" ref={el => { cards.current[i] = el; }} className={`cs4-tour-card${on ? ' on' : ''}`} tabIndex={on ? 0 : -1} aria-hidden={!on} onClick={() => again(i)} title="Play this moment again">
        <p className="cs4-tour-p">{text(f.p)}</p>
      </button>
    );
  };
  return (
    <div ref={box} className={`cs4-tour${act >= 0 ? ' live' : ''}${nodeOn ? ' marked' : ''}${phase === 'play' ? ' playing' : ''}${reduce ? ' still' : ''}`}>
      <div className="cs4-tour-col l">{b.of.map((f, i) => f.side === 'l' ? card(f, i) : null)}</div>
      <div ref={phone} className="cs4-media phone filled cs4-tour-phone" role="img" aria-label={b.label}>
        <video ref={vid} src={b.src} poster={b.poster} muted loop playsInline preload="metadata" aria-hidden="true" />
      </div>
      <div className="cs4-tour-col r">{b.of.map((f, i) => f.side === 'r' ? card(f, i) : null)}</div>
      <svg className="cs4-tour-svg" aria-hidden="true">
        <path ref={line} className="ln" d="" />
        <g ref={node} className="node"><circle className="ring" r="10" /><circle className="dot" r="3.5" /></g>
      </svg>
    </div>
  );
}

/* a recording with a list that keeps time with it (26 Oct; the Hustlr frame's 3D highlights): the phone at the left, the
   items at the right, the one the recording is on lit (from its second to the next's, by the frame on screen), the rest
   dim; a tap plays the recording from that item. Under reduced motion the recording holds its first frame and every item
   is lit. On the phone the list sits under the recording */
type SyncedB = Extract<Block, { k: 'synced' }>;
function Synced({ b }: { b: SyncedB }) {
  const box = useRef<HTMLDivElement>(null), vid = useRef<HTMLVideoElement>(null);
  const inView = useInView(box, .25);
  const reduce = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [act, setAct] = useState(0); const actRef = useRef(0);
  useEffect(() => { const v = vid.current; if (!v) return; if (inView && !reduce) v.play().catch(() => {}); else v.pause(); }, [inView, reduce]);
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const v = vid.current; if (!v) return;
      const t = v.currentTime; let i = 0;
      b.of.forEach((it, k) => { if (t >= it.t) i = k; });
      if (i !== actRef.current) { actRef.current = i; setAct(i); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, b]);
  const go = (i: number) => { const v = vid.current; if (!v) return; v.currentTime = b.of[i].t + .02; if (!reduce) v.play().catch(() => {}); };
  return (
    <div ref={box} className={`cs4-sync${b.full ? ' full' : ''}`}>
      <div className="cs4-media phone filled cs4-sync-phone" role="img" aria-label={b.label}>
        <video ref={vid} src={b.src} poster={b.poster} muted loop playsInline preload="metadata" aria-hidden="true" />
      </div>
      <ol className="cs4-sync-list">
        {b.of.map((it, i) => (
          <li key={i}>
            <button type="button" className={`cs4-sync-item${act === i || reduce ? ' on' : ''}`} onClick={() => go(i)} aria-current={act === i ? 'step' : undefined} title="Play from here">
              <img src={it.thumb} alt="" loading="lazy" decoding="async" />
              <span className="cs4-sync-text"><span className="cs4-sync-name">{it.name}</span><span className="cs4-sync-p">{text(it.p)}</span></span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Successes({ of }: { of: { m: Media; chip: string; h: string; p?: Rich; ul?: Rich[]; wide?: boolean; top?: boolean }[] }) {
  return (
    <div className="cs4-sx">
      {of.map((x, i) => (
        <div key={i} className={`cs4-sx-item${x.wide ? ' wide' : ''}${x.top ? ' top' : ''}`}>
          <Fig m={x.m} />
          <div className="cs4-sx-text"><span className="cs4-faq-label">{x.chip}</span><h4 className="cs4-sub">{x.h}</h4>{x.p && <p className="cs4-p">{text(x.p)}</p>}{x.ul && <ul className="cs4-ul">{x.ul.map((it, k) => <li key={k}>{text(it)}</li>)}</ul>}</div>
        </div>
      ))}
    </div>
  );
}

/* screens in a row, their wires meeting at one screen under them (his nudges converging on the help menu): a node on
   each screen's bottom edge, the three curves dropping to one chevron over the screen below */
function Converge({ of, to }: { of: Media[]; to: Media }) {
  const ref = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<{ d: string; node: [number, number] }[]>([]);
  const [head, setHead] = useState<[number, number] | null>(null);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const draw = () => {
      const R0 = root.getBoundingClientRect(), z = R0.width / (root.offsetWidth || R0.width || 1), R = { left: R0.left, top: R0.top, width: R0.width / z, height: R0.height / z }; /* in the page's own px: a zoomed page (the phone's scale, 24 Oct) reports boxes on screen in screen px in some browsers */ const box = (sel: string) => { const el = root.querySelector<HTMLElement>(`[data-fl="${sel}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: (r.left - R.left) / z, y: (r.top - R.top) / z, w: r.width / z, h: r.height / z }; };
      const t = box('to.m'); if (!t) return;
      const tx = t.x + t.w / 2, ty = t.y - 8, GAP = 1.5;
      const out: typeof wires = [];
      of.forEach((_, i) => {
        const a = box(`${i}.m`); if (!a) return;
        const sx = a.x + a.w / 2, sy = a.y + a.h; const my = sy + (ty - sy) * .55;
        out.push({ d: `M${f2(sx)} ${f2(sy)} C${f2(sx)} ${f2(my)}, ${f2(tx)} ${f2(my - (ty - sy) * .15)}, ${f2(tx)} ${f2(ty - GAP)}`, node: [sx, sy] });
      });
      setWires(out); setHead([tx, ty]); setSize([R.width, R.height]);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(root); root.querySelectorAll('[data-fl]').forEach(el => ro.observe(el)); return () => ro.disconnect();
  }, [of, to]);
  return (
    <div className="cs4-conv" ref={ref}>
      <svg className="cs4-wires" width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
        {wires.map((w, i) => <g key={i}><path d={w.d} /><circle className="ring" cx={w.node[0]} cy={w.node[1]} r="5" /><circle className="core" cx={w.node[0]} cy={w.node[1]} r="3" /></g>)}
        {head && <path className="head" d="M-5.4 -5.9 L0 0 L-5.4 5.9" transform={`translate(${f2(head[0])} ${f2(head[1])}) rotate(90)`} />}
      </svg>
      <div className="cs4-conv-row">{of.map((m, i) => <Fig key={i} m={m} fl={`${i}`} />)}</div>
      <div className="cs4-conv-to"><Fig m={to} fl="to" /></div>
    </div>
  );
}

/* the flow: steps in a column, wired as his page drew them (21 Oct, "the knots should be exactly as they are seen"):
   from a step's last screen to the next step's first screen a 2px line that leaves a ring node inside the screen near
   its bottom, drops, sweeps across above the next heading and drops again to an open chevron just over the next
   screen; between two screens of one step a shorter S from a node in the first's lower right to the second's left
   edge. Measured after layout and on resize; drawn in the card's ink, faint, like his light grey on white. */
function Flow({ steps, tight }: { steps: Step[]; tight?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  /* a wire: its line (ending short of the head), its node on the screen's border, its head at the end, turned along the line */
  const [wires, setWires] = useState<{ d: string; node: [number, number]; head: [number, number, number] }[]>([]);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useLayoutEffect(() => {
    const root = ref.current; if (!root) return;
    const draw = () => {
      const R0 = root.getBoundingClientRect(), z = R0.width / (root.offsetWidth || R0.width || 1), R = { left: R0.left, top: R0.top, width: R0.width / z, height: R0.height / z }; /* in the page's own px: a zoomed page (the phone's scale, 24 Oct) reports boxes on screen in screen px in some browsers */ const box = (sel: string) => { const el = root.querySelector<HTMLElement>(`[data-fl="${sel}"]`); if (!el) return null; const r = el.getBoundingClientRect(); return { x: (r.left - R.left) / z, y: (r.top - R.top) / z, w: r.width / z, h: r.height / z }; };
      const f = (n: number) => n.toFixed(1);
      const out: typeof wires = [];
      const GAP = 1.5; /* the line runs up to the head's point (his drawings: the line ends at the chevron's vertex, the arms wide and short) */
      /* drop, sweep across, drop — the two cubics of his big connectors; the line ends GAP above the head, which points down */
      const dropAcross = (sx: number, sy: number, tx: number, ty: number) => { const my = sy + (ty - sy) * .5, ey = ty - GAP; return { d: `M${f(sx)} ${f(sy)} C${f(sx)} ${f(sy)}, ${f(sx)} ${f(my)}, ${f((sx + tx) / 2)} ${f(my)} C${f(tx)} ${f(my)}, ${f(tx)} ${f(ey)}, ${f(tx)} ${f(ey)}`, head: [tx, ty, 90] as [number, number, number] }; };
      /* the short S between two screens; the line ends GAP before the head, which points right */
      const across = (sx: number, sy: number, tx: number, ty: number) => { const ex = tx - GAP, mx = (sx + ex) / 2; return { d: `M${f(sx)} ${f(sy)} C${f(mx)} ${f(sy)}, ${f(mx)} ${f(ty)}, ${f(ex)} ${f(ty)}`, head: [tx, ty, 0] as [number, number, number] }; };
      steps.forEach((s, i) => {
        for (let j = 1; j < s.media.length; j++) {
          const a = box(`${i}.${j - 1}.m`), b = box(`${i}.${j}.m`); if (!a || !b) continue;
          if (b.y >= a.y + a.h - 2) { const sx = a.x + a.w * .7, sy = a.y + a.h; out.push({ ...dropAcross(sx, sy, b.x + b.w * .5, b.y - 6), node: [sx, sy] }); } /* one under the other (the phone): the node on the bottom edge, right of the caption; the head just over the next */
          else { const sx = a.x + a.w, sy = a.y + a.h * .78; out.push({ ...across(sx, sy, b.x - 4, b.y + b.h * .58), node: [sx, sy] }); } /* side by side: the node on the right edge, the head at the next one's left edge */
        }
        if (i < steps.length - 1) {
          const a = box(`${i}.${s.media.length - 1}.m`), b = box(`${i + 1}.0.m`), t = box(`${i + 1}.t`); if (!a || !b || !t) return;
          const sx = a.x + a.w * (a.h > a.w ? .86 : .7), sy = a.y + a.h; /* the node on the screen's bottom edge, right of the caption under it (further right on an upright phone, whose caption fills more of its width) */
          const column = Math.abs((a.x + a.w / 2) - (b.x + b.w / 2)) < 40; /* the phone: the screens in one column, the heading between — the line ends above the heading */
          out.push({ ...(column ? dropAcross(sx, sy, t.x + t.w / 2, t.y - 8) : dropAcross(sx, sy, b.x + b.w * .53, b.y - 8)), node: [sx, sy] });
        }
      });
      setWires(out); setSize([R.width, R.height]);
    };
    draw(); const ro = new ResizeObserver(draw); ro.observe(root); root.querySelectorAll('[data-fl]').forEach(el => ro.observe(el)); return () => ro.disconnect();
  }, [steps]);
  return (
    <div className={`cs4-flow${tight ? ' tight' : ''}`} ref={ref}>
      <svg className="cs4-wires" width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden="true">
        {wires.map((w, i) => (
          <g key={i}>
            <path d={w.d} />
            {/* the head: an open chevron at the line's end — his: arms about 8 long, 96° apart, the line meeting the vertex */}
            <path className="head" d="M-5.4 -5.9 L0 0 L-5.4 5.9" transform={`translate(${f2(w.head[0])} ${f2(w.head[1])}) rotate(${w.head[2]})`} />
            <circle className="ring" cx={w.node[0]} cy={w.node[1]} r="5" /><circle className="core" cx={w.node[0]} cy={w.node[1]} r="3" />
          </g>
        ))}
      </svg>
      {steps.map((s, i) => (
        <div key={s.title} className={`cs4-step${s.text ? ' with-text' : ''}${s.side ? ' with-side' : ''}`}>
          <h4 className="cs4-sub step" data-fl={`${i}.t`}>{s.title}</h4>
          {s.text && <div className="cs4-group">{s.text.map((b, k) => <Render key={k} b={b} />)}</div>}
          <div className="cs4-screens">{s.media.map((m, j) => <Fig key={j} m={m} fl={`${i}.${j}`} />)}</div>
          {s.side && <div className="cs4-group side">{s.side.map((b, k) => <Render key={k} b={b} />)}</div>}
        </div>
      ))}
    </div>
  );
}

/* the hero (Nitish, 22 Oct): a flat, front-facing phone in the middle — a bezel and its island, nothing more — and the
   three screens taking turns in it. One plays inside; the other two float at its sides, a fifth smaller, in black and
   white and held still. Every few seconds the left one slides into the phone, growing and turning to colour as it goes,
   the one inside slides out to the right, and the right one fades away to come back in at the left — round and round.
   The phone is drawn over the screens, so a screen passes under its bezel on its way in and out. */
const CAR = { hold: 3800, slide: 1, side: .92, tilt: 16, ease: [.3, .1, .25, 1] as [number, number, number, number] };
function Carousel({ of }: { of: Media[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const ghost = useRef<HTMLDivElement>(null);
  const on = useInView(ref, .3);
  /* which screen is at the left, in the phone, at the right — kept in a ref for the loop, in state for what plays and
     for the ghost: a second copy of the right screen, which is what leaves the stage, while the screen itself comes
     back in at the left in the same move (22 Oct: both the leaving and the arriving travel a whole step, together) */
  const first = [of.length - 1, 0, 1].map(i => (i + of.length) % of.length);
  const orderRef = useRef<number[]>(first);
  const [inPhone, setInPhone] = useState(first[1]);
  const [ghostOf, setGhostOf] = useState(first[2]);
  const still = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* the places, a belt of equal steps: further left (unseen), left, the phone, right, further right (unseen); the sides
     a little smaller, close to the phone (22 Oct: the gap halved again, the sides 15% bigger) */
  const places = () => {
    const el = ref.current; const w = el?.querySelector<HTMLElement>('.cs4-car-phone')?.offsetWidth ?? 160;
    const gap = (el?.offsetWidth ?? 900) < w * 2.9 ? w * .03 : w * .048;
    const off = w / 2 + gap + w * CAR.side / 2; /* phone's half, the gap, the side screen's half */
    return { off, L: -off, R: off };
  };
  /* a screen's look, written straight to its style: its place on the belt (x), its size, its turn in perspective — the
     sides turned 16° with their inner edge back — its colour, opacity */
  const put = (el: HTMLElement, x: number, side: number /* 0 in the phone … 1 at a side */, turn: number /* -1 left, 1 right */, opacity = 1) => {
    el.style.transform = `translateX(${x.toFixed(2)}px) scale(${(1 - (1 - CAR.side) * side).toFixed(4)}) rotateY(${(turn * CAR.tilt * side).toFixed(2)}deg)`;
    el.style.filter = `grayscale(${side.toFixed(3)})`; el.style.opacity = opacity.toFixed(3);
  };
  /* put the screens in their places without motion (first paint, a resize); the ghost waits at the right, unseen */
  const settle = () => { const P = places(); const [l, c, r] = orderRef.current; const E = els.current; if (E[l]) put(E[l], P.L, 1, -1); if (E[c]) put(E[c], 0, 0, 0); if (E[r]) put(E[r], P.R, 1, 1); if (ghost.current) put(ghost.current, P.R, 1, 1, 0); };
  useLayoutEffect(() => { settle(); const ro = new ResizeObserver(settle); if (ref.current) ro.observe(ref.current); return () => ro.disconnect(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  /* the ghost shows the right screen's clip at the frame the screen itself stopped at, so the two read as one */
  const syncGhost = () => { const a = els.current[orderRef.current[2]]?.querySelector('video'), g = ghost.current?.querySelector('video'); if (a && g && Math.abs(a.currentTime - g.currentTime) > .05) g.currentTime = a.currentTime; };
  useEffect(() => { const t = setTimeout(syncGhost, 150); return () => clearTimeout(t); }, [ghostOf]); // eslint-disable-line react-hooks/exhaustive-deps
  /* the loop, while on screen: every few seconds the whole belt moves one step to the right as one motion (22 Oct: "the
     same velocity, keeping the same gap") — the left screen into the phone, turning flat and to colour; the one inside
     out to the right, turning away and grey; the right one's ghost further right, fading out; and the right screen
     itself in from further left, fading in — every one of them a whole step */
  useEffect(() => {
    if (!on || still || of.length < 3) return;
    let live = true; let t = 0;
    const step = async () => {
      if (!live) return;
      const P = places(); const [l, c, r] = orderRef.current; const E = els.current, G = ghost.current; if (!E[l] || !E[c] || !E[r] || !G) return;
      syncGhost();
      orderRef.current = [r, l, c]; setInPhone(l); /* the one sliding in starts playing as it goes */
      await animate(0, 1, { duration: CAR.slide, ease: CAR.ease, onUpdate: p => {
        put(E[l]!, P.L + P.off * p, 1 - p, -1);
        put(E[c]!, P.off * p, p, 1);
        put(G, P.R + P.off * p, 1, 1, 1 - p);
        put(E[r]!, P.L - P.off + P.off * p, 1, -1, p);
      } });
      if (!live) return;
      put(G, P.R, 1, 1, 0); setGhostOf(c); /* the ghost takes the new right screen, unseen, with the hold to load it */
      t = window.setTimeout(step, CAR.hold);
    };
    t = window.setTimeout(step, CAR.hold);
    return () => { live = false; clearTimeout(t); };
  }, [on, still, of.length]);
  return (
    <div className="cs4-car" ref={ref}>
      {of.map((m, i) => <div key={i} ref={el => { els.current[i] = el; }} className="cs4-car-item" style={{ zIndex: inPhone === i ? 2 : 1 }}><Slot m={m} active={inPhone === i} /></div>)}
      <div ref={ghost} className="cs4-car-item ghost" aria-hidden="true"><Slot key={ghostOf} m={of[ghostOf]} active={false} /></div>
      {/* the phone: the study's device edge, as every other phone on the page, with an island inside it */}
      <div className="cs4-car-phone" aria-hidden="true"><i className="cs4-island" /></div>
    </div>
  );
}

function Render({ b }: { b: Block }) {
  switch (b.k) {
    case 'p': return <p className="cs4-p">{text(b.t)}</p>;
    case 'h': return <h4 className={`cs4-sub${b.center ? ' center' : ''}`}>{b.t}</h4>;
    case 'ul': return <ul className="cs4-ul">{b.items.map((it, i) => <li key={i}>{text(it)}</li>)}</ul>;
    case 'ol': return <ol className="cs4-ol">{b.items.map((it, i) => <li key={i}><b>{it.lead}</b> {text(it.t)}</li>)}</ol>;
    case 'media': return <Slot m={b} />;
    case 'figure': return <Fig m={b.of} cls={b.width} />;
    case 'row': return <div className={`cs4-row${b.align === 'center' ? ' center' : ''}`} style={{ gridTemplateColumns: b.ratio ?? `repeat(${b.of.length}, minmax(0, 1fr))` }}>{b.of.map((x, i) => <Render key={i} b={x} />)}</div>;
    case 'phones': return <div className="cs4-phones">{b.of.map((m, i) => <Fig key={i} m={m} />)}</div>;
    case 'group': return <div className="cs4-group">{b.of.map((x, i) => <Render key={i} b={x} />)}</div>;
    case 'stats': return (
      <div className={`cs4-stats${b.tone ? ' ' + b.tone : ''}${b.more ? ' has-more' : ''}`} tabIndex={b.more ? 0 : undefined}>
        {b.title && <h4 className="cs4-sub">{b.title}</h4>}
        <div className="cs4-stats-body">
          <ul>{b.items.map(s => <li key={s.l}><span className="n">{s.n}</span><span className="l">{s.l}</span></li>)}</ul>
          {b.more && <p className="cs4-stats-more">{text(b.more)}</p>} {/* his page's hover: the numbers give way to this */}
        </div>
      </div>
    );
    case 'legend': return <ul className="cs4-legend">{b.items.map((t, i) => <li key={t}><i className={`sw s${i}`} style={b.colors ? { background: b.colors[i] } : undefined} aria-hidden="true" />{t}</li>)}</ul>;
    case 'cols': return (
      <div className={`cs4-cols${b.of.length === 3 ? ' three' : ''}`}>
        {b.of.map(c => <div key={c.h} className="cs4-col"><h4 className="cs4-sub">{c.h}</h4><p className="cs4-p">{text(c.p)}</p>{c.ul && <ul className="cs4-ul">{c.ul.map((it, i) => <li key={i}>{text(it)}</li>)}</ul>}</div>)}
      </div>
    );
    case 'flow': return <Flow steps={b.steps} tight={b.tight} />;
    case 'carousel': return <Carousel of={b.of} />;
    /* his FAQ panel (rebuilt 23 Oct from his Framer page: "it doesn't look like UI, the questions lost the user icon,
       no space hygiene"): each step's screen whole, in a white screen card, then the questions it raised — a white card
       per kind of question, its label inside, every question with the asker in front of it */
    case 'faq': return (
      <div className={`cs4-faq n${b.of.length}`}>
        {b.of.map((c, i) => (
          <div key={i} className="cs4-faq-col">
            <div className="cs4-faq-ui">{c.m.src && <img src={c.m.src} alt={c.m.label} loading="lazy" decoding="async" />}</div>
            {c.qs.map(q => (
              <div key={q.label} className="cs4-faq-card">
                <span className="cs4-faq-label">{q.label}</span>
                {q.q.map(t => <p key={t} className="cs4-faq-ask"><Asker /><span>{t}</span></p>)}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
    case 'converge': return <Converge of={b.of} to={b.to} />;
    case 'peek': return <Peek label={b.label} show={b.show} screen={b.screen} at={b.at} of={b.of} />;
    case 'loaders': return <div className="cs4-row cs4-ld-row">{b.of.map((l, i) => <LoaderPhone key={i} l={l} />)}</div>;
    case 'successes': return <Successes of={b.of} />;
    case 'synced': return <Synced b={b} />;
    case 'tour': return <Tour b={b} />;
    case 'trio': return (
      <div className="cs4-trio">
        <Fig m={b.before} />
        <figure className="cs4-fig phone cs4-trio-mid"><Tour b={{ k: 'tour', ...b.tour }} /><figcaption>{b.cap}</figcaption></figure>
        <Fig m={b.after} />
      </div>
    );
    case 'gaps': return (
      <div className="cs4-gaps">
        {b.of.map((g, i) => (
          <div key={g.h} className="cs4-gap">
            <span className="cs4-gap-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <h4 className="cs4-sub">{g.h}</h4>
            <p className="cs4-p">{text(g.p)}</p>
            {g.to && <span className="cs4-faq-label">{g.to}</span>}
          </div>
        ))}
      </div>
    );
    case 'journey': return <Journey text={b.text} screen={b.screen} bar={b.bar} of={b.of} entry={b.entry} />;
    /* a version: its number and its name as chips, a line, its screens */
    case 'version': return (
      <div className="cs4-ver">
        <div className="cs4-ver-head"><span className="cs4-ver-chip">{b.v}</span><span className="cs4-ver-chip name">{b.name}</span></div>
        <p className="cs4-p">{text(b.text)}</p>
        <div className="cs4-phones ver">{b.of.map((m, i) => <Fig key={i} m={m} />)}</div>
      </div>
    );
    case 'machine': return <BMachine />;
    case 'fintech': return <Fintech3D />;
    case 'launches': return <Launches3D />;
  }
}

/* `items`: the list it belongs to (Projects, or the Lab's), for its next card (23 Oct) */
export default function Case04({ id, back, onOpen, items = PROJECTS04, card = 'collab' }: { id: string; back: () => void; onOpen: (id: string) => void; items?: Project[]; card?: string /* the bottom-right card for a project with a collaborator: its credit, or the contact card (a control, 26 Oct) */ }) {
  const PROJECTS = items;
  const k = PROJECTS.findIndex(p => p.id === id); const p = PROJECTS[k];
  const c = CASES[id];
  const next = PROJECTS[(k + 1) % PROJECTS.length]; /* the column's top card: the next project (what else it holds, later) */
  /* the head's height, handed to the page: the study starts under it, the column level with the study's first container;
     and the hero's, so the column's first card is as tall as the hero beside it (Nitish, 22 Oct) */
  const root = useRef<HTMLElement>(null), headRef = useRef<HTMLElement>(null), heroRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = root.current, h = headRef.current; if (!el || !h) return;
    /* the head on the frame's top edge (24 Oct): its glass cut by the frame's top-right corner, which it runs into (the
       head ends 21px short of the frame's right edge, inside the corner's 50px) — the clip reaches to the frame's edge
       and turns its corner on the frame's own curve (curve.ts), so the glass never shows past the frame. On the glass,
       not the head: a clip on the head would make it the glass's backdrop root and the blur would lose what scrolls
       under it. None on the phone, where the head is in the flow and the frame has no corners */
    const glass = h.querySelector<HTMLElement>('.cs4-glass'), frame = h.closest('.frame4');
    const cut = () => {
      if (!glass || !frame || matchMedia('(max-width: 700px)').matches) { if (glass) glass.style.clipPath = ''; return; }
      const f = frame.getBoundingClientRect(), b = h.getBoundingClientRect(), W = h.offsetWidth, H = h.offsetHeight;
      const { K } = sysCurve(frame), R = parseFloat(getComputedStyle(frame).borderTopRightRadius) || 0;
      const x = W + (f.right - b.right), y = 0; /* the frame's top-right corner, in the head's own px: its top is the frame's by the CSS (measuring it would catch the page's 8px rise as it enters) */
      glass.style.clipPath = R ? `path('M -40 ${y.toFixed(2)} L ${(x - R).toFixed(2)} ${y.toFixed(2)} ${sCorner([x, y], [1, 0], [0, 1], R, K)} L ${x.toFixed(2)} ${H + 40} L -40 ${H + 40} Z')` : '';
    };
    const set = () => { el.style.setProperty('--head-h', `${h.offsetHeight}px`); const hero = heroRef.current; if (hero) el.style.setProperty('--hero-h', `${hero.offsetHeight}px`); else el.style.removeProperty('--hero-h'); cut(); };
    set(); const ro = new ResizeObserver(set); ro.observe(h); if (frame) ro.observe(frame); if (heroRef.current) ro.observe(heroRef.current); return () => ro.disconnect();
  }, [id]);
  if (!p) return null;
  return (
    <section className="pp4 cs4" aria-label={p.title} ref={root}>
      {/* the head floats over the scrolling study (22 Oct): the containers pass under it, seen through its glass; the
          one-liner and the tags at its far right */}
      <header className="pp4-head cs4-head" ref={headRef}>
        {/* the bar floats (22 Oct): a card with the standard radius, room above it, and the home page's glass behind it — a
            backdrop blur alone, no tint, so it is seen only when something scrolls under it */}
        <div className="cs4-glass" aria-hidden="true" />
        <div className="cs4-head-in">
        <div className="cs4-title">
          <button type="button" className="cs4-back" onClick={back}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H6M12 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>Projects</button>
          <h2 className="h2-4">{c?.title ?? p.title}</h2>
        </div>
        <div className="cs4-side"><p className="pp4-note">{c?.sub ?? p.blurb}</p>{c && <ul className="cs4-chips">{c.chips.map(t => <li key={t}>{t}</li>)}</ul>}</div>
        </div>
      </header>
      <div className="cs4-main">
      <div className="cs4-body">
        {c ? (<>
          {c.hero && <div ref={heroRef} className={`cs4-hero${c.hero.k === 'media' ? '' : c.hero.k === 'fintech' || c.hero.k === 'launches' ? ' fill' : ' block'}`}>{c.hero.k === 'media' ? <Slot m={c.hero} /> : <Render b={c.hero} />}</div>}
          {/* the information strip under the hero, as his page had it: the facts in a row (22 Oct: no tags — the facts say it) */}
          <dl className="cs4-strip">
            <div><dt>Client</dt><dd>{p.client} · {p.year}</dd></div>
            {c.facts.map(f => <div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}
          </dl>
          {c.sections.map(s => (
            <section key={s.id} data-sec={s.id} className={`cs4-sec${s.tone ? ' ' + s.tone : ''}`} aria-label={s.title}>
              <h3 className="cs4-h">{s.title}</h3>
              {s.blocks.map((b, i) => <Render key={i} b={b} />)}
            </section>
          ))}
        </>) : (
          <div className="cs4-soon">Case study to come</div>
        )}
      </div>
      {/* the column at the right (21 Oct): the home page's column width, level with the first container — the next
          project in a card 70% of the height, and the rest for a second card, its content to come */}
      <aside className="cs4-aside">
        <article className="cs4-next">
          <span className="cs4-eyebrow">Next project</span>
          <h3 className="cs4-next-title">{next.title}</h3>
          <p className="cs4-next-blurb">{next.blurb}</p>
          <span className="cs4-next-meta">{next.client} · {next.year}</span>
          <span className="cs4-next-letter" aria-hidden="true">{next.letter}</span>
          <button type="button" className="pp4-arrow cs4-next-arrow" aria-label={`Open ${next.title}`} onClick={() => onOpen(next.id)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        </article>
        {/* the second card (21 Oct): his old site's contact card, at the foot of its project pages — the photo, the name, a
            line, "Let's talk!" and the links — in 04's parts (the intro's photo disc, its CV button's style, the notch's marks) */}
        {c?.collab && card !== 'contact' ? (
          /* a collaboration (26 Oct, Nitish: "I have worked with this product designer on this project… I have worked on the
             interaction part… a user gets directed on that project on his portfolio… it gives him a credit… and a space for his
             portfolio"): the contact card's place, as a credit — both faces, his name and role, the line, his case study as
             the card's button and his portfolio beside it */
          <article className="cs4-talk collab" aria-label={`In collaboration with ${c.collab.name}`}>
            <div className="cs4-talk-head">
              <span className="cs4-pair" aria-hidden="true"><span className="me4 cs4-me"><img src={desk} alt="" /></span><span className="cs4-me cs4-pal"><img src={c.collab.photo} alt="" /></span></span>
              <div className="cs4-talk-who"><span className="cs4-talk-role">In collaboration with</span><b className="cs4-talk-name">{c.collab.name}</b></div>
            </div>
            <p className="cs4-talk-line">I worked on the interaction and motion with {c.collab.name.split(' ')[0]}, {c.collab.role.toLowerCase()}. His case study has the project in full.</p>
            <div className="cs4-talk-row acts">
              <a className="cv4 cs4-talk-btn" href={c.collab.project} target="_blank" rel="noopener" aria-label={`${c.collab.name}’s case study of this project (opens his portfolio)`}>Case study <Arrow04 out /></a>
              <a className="cs4-talk-link" href={c.collab.site} target="_blank" rel="noopener"><span>His portfolio</span><Arrow04 out /></a>
            </div>
          </article>
        ) : (
        <article className="cs4-talk" aria-label="Contact">
          <div className="cs4-talk-head">
            <span className="me4 cs4-me"><img src={desk} alt="" /></span> {/* the portfolio's own photo (22 Oct), as the intro has it */}
            <div className="cs4-talk-who"><b className="cs4-talk-name">Nitish Bhardwaj</b><Signature04 className="cs4-sign" label="Product, motion designer" /></div> {/* his written title, aligned to the name (Signature04.tsx) */}
          </div>
          <p className="cs4-talk-line">If you like what you see or have any questions, feel free to connect anytime.</p> {/* his line, reworded for the handles beside it (22 Oct) */}
          <div className="cs4-talk-row">
            <a className="cv4 cs4-talk-btn" href={MAIL}>Let's talk!</a>
            <div className="links4 cs4-links">{SOCIAL.filter(l => l.label !== 'Email').map(l => <a key={l.label} href={l.href} aria-label={l.label} title={l.label} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener"><svg viewBox={l.box} aria-hidden="true"><path d={l.path} fill="currentColor" /></svg></a>)}</div>
          </div>
        </article>
        )}
      </aside>
      </div>
    </section>
  );
}
