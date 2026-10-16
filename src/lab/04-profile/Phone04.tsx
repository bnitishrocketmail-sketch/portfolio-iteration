import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { moment, ms, px, tr, type MomentId, type Phase } from './motionTokens';

/* The motion system's product (Nitish, 16 Oct): a small generic app on a phone, moved only by the system's semantic
   tokens — a grid of cards that open into their page (container transform), a page that goes forward and back (shared
   axis), tabs (fade through), a bottom sheet, a toast, and the press on everything tappable. It can be used by hand, and
   played from the moments list (`play`), which sets up what a moment needs first (opening a card before a sheet, say),
   with the real transitions. Every transition it starts is reported (`onMoment`), so the page can show its tokens. The
   screen is a fixed 262 × 562 and the whole phone is scaled to fit; geometry is read in the screen's own units. */
export type PhoneHandle = { play: (id: MomentId) => void };
type Props = { onMoment: (id: MomentId, phase: Phase) => void; scale: number };

const SW = 262, SH = 562;
const CARDS = [{ t: 'Linen shirt', p: '₹1,490' }, { t: 'Canvas tote', p: '₹890' }, { t: 'Desk lamp', p: '₹2,350' }, { t: 'Field notes', p: '₹340' }];
const TABS = [{ id: 'home', label: 'Home' }, { id: 'search', label: 'Search' }, { id: 'orders', label: 'Orders' }] as const;
type Tab = typeof TABS[number]['id'];
type Box = { top: number; left: number; width: number; height: number };

const M = { card: moment('card'), page: moment('page'), tab: moment('tab'), sheet: moment('sheet'), toast: moment('toast'), press: moment('press') };

const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ICON = { home: 'M4 11l8-6 8 6v8h-5v-5H9v5H4z', search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm5-2 4 4', orders: 'M6 4h12v16H6zM9 9h6M9 13h6', back: 'M15 5l-7 7 7 7', check: 'M5 12.5l4.2 4.2L19 7' };

const Phone04 = forwardRef<PhoneHandle, Props>(function Phone04({ onMoment: report, scale }, ref) {
  /* the last moment reported — so the toast leaving on its own does not take the page from a moment played since */
  const lastM = useRef<MomentId | null>(null);
  const onMoment = (id: MomentId, phase: Phase) => { lastM.current = id; report(id, phase); };
  const reduce = !!useReducedMotion();
  const T = (id: keyof typeof M, phase: Phase = 'enter') => tr(phase === 'exit' && M[id].exit ? M[id].exit! : M[id].enter, reduce);
  const press = { whileTap: { scale: .96 }, transition: T('press') };

  const screen = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLElement | null)[]>([]);
  const [tab, setTab] = useState<Tab>('home');
  const [card, setCard] = useState<number | null>(null);   /* the card whose page is open */
  const [from, setFrom] = useState<Box | null>(null);      /* where that page grew from */
  const [closing, setClosing] = useState<number | null>(null);
  const [page2, setPage2] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(0);
  const timers = useRef<number[]>([]);
  const later = (f: () => void, t: number) => { timers.current.push(window.setTimeout(f, reduce ? 0 : t)); };
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  const optionsRef = useRef<HTMLButtonElement>(null), payRef = useRef<HTMLButtonElement>(null);

  /* the moves, each reporting its moment */
  const boxOf = (i: number): Box => {
    const s = screen.current!.getBoundingClientRect(), c = cardEls.current[i]!.getBoundingClientRect();
    return { top: (c.top - s.top) / scale, left: (c.left - s.left) / scale, width: c.width / scale, height: c.height / scale };
  };
  const openCard = (i: number) => { setFrom(boxOf(i)); setCard(i); setPage2(false); setSheet(false); onMoment('card', 'enter'); };
  const closeCard = () => { if (card == null) return; setClosing(card); setSheet(false); setPage2(false); setCard(null); onMoment('card', 'exit'); };
  const forward = () => { setSheet(false); setPage2(true); onMoment('page', 'enter'); };
  const back = () => { setPage2(false); onMoment('page', 'exit'); };
  const switchTab = (t: Tab) => { if (t === tab) return; setTab(t); onMoment('tab', 'enter'); };
  const openSheet = () => { setSheet(true); onMoment('sheet', 'enter'); };
  const closeSheet = () => { setSheet(false); onMoment('sheet', 'exit'); };
  /* the toast leaves on its own; its timer is its own, so a moment played meanwhile does not cancel it */
  const toastT = useRef(0);
  useEffect(() => () => window.clearTimeout(toastT.current), []);
  const showToast = () => {
    setToast(k => k + 1); onMoment('toast', 'enter');
    window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => { setToast(0); if (lastM.current === 'toast') onMoment('toast', 'exit'); }, 1700);
  };
  const addToBag = () => { closeSheet(); later(showToast, ms('quick')); };
  const pressOn = (el: HTMLElement | null) => {
    onMoment('press', 'enter'); if (!el || reduce) return;
    animate(el, { scale: [1, .96, 1] }, { duration: 2 * ms('instant') / 1000, ease: [.2, 0, 0, 1], times: [0, .5, 1] });
  };

  /* played from the list: set up what the moment needs, with the real transitions, then play it (again: its reverse) */
  const wait = (d: 'moderate' | 'slow') => ms(d) + 90;
  useImperativeHandle(ref, () => ({
    play(id) {
      clear();
      const detail = card != null;
      const toHome = ms('quick') + ms('moderate') + 60; /* the fade through: the old tab out, then the new one in */
      const withDetail = (f: () => void) => { if (!detail) { const go = () => { openCard(0); later(f, wait('slow')); }; if (tab !== 'home') { switchTab('home'); later(go, toHome); } else go(); } else if (page2 && id !== 'page') { back(); later(f, wait('moderate')); } else f(); };
      if (id === 'card') { if (detail) closeCard(); else if (tab !== 'home') { switchTab('home'); later(() => openCard(0), toHome); } else openCard(0); }
      if (id === 'page') withDetail(() => { if (page2) back(); else forward(); });
      if (id === 'tab') { const next = TABS[(TABS.findIndex(t => t.id === tab) + 1) % TABS.length].id; if (detail) { closeCard(); later(() => switchTab(next), wait('moderate')); } else switchTab(next); }
      if (id === 'sheet') withDetail(() => { if (sheet) closeSheet(); else openSheet(); });
      if (id === 'toast') withDetail(() => { if (sheet) addToBag(); else showToast(); });
      if (id === 'press') pressOn(detail ? (page2 ? payRef.current : optionsRef.current) : cardEls.current[0]);
    },
  }));

  const pageT = T('page', page2 ? 'enter' : 'exit');
  const dur = (id: keyof typeof M, phase: Phase = 'enter') => (reduce ? 0 : ms((phase === 'exit' && M[id].exit ? M[id].exit! : M[id].enter).use.duration) / 1000);
  const dist = px('large');

  return (
    <div className="ph4" style={{ transform: `scale(${scale})` }}>
      <div className="ph4-screen" ref={screen}>
        <div className="ph4-status"><span>9:41</span><i /></div>

        {/* level 0: the tabs, faded through */}
        <div className="ph4-tabs">
          <AnimatePresence initial={false} mode="wait">
            <motion.div key={tab} className="ph4-view" initial={{ opacity: 0, scale: .92 }} animate={{ opacity: 1, scale: 1, transition: T('tab') }} exit={{ opacity: 0, transition: T('tab', 'exit') }}>
              {tab === 'home' && <>
                <h4 className="ph4-h">Discover</h4>
                <div className="ph4-search"><Icon d={ICON.search} />Search</div>
                <p className="ph4-label">For you</p>
                <div className="ph4-grid">
                  {CARDS.map((c, i) => (
                    <motion.button key={c.t} type="button" ref={el => { cardEls.current[i] = el; }} className="ph4-card" style={{ visibility: card === i || closing === i ? 'hidden' : 'visible' }} {...press} onClick={() => openCard(i)}>
                      <i className="ph4-img" /><b>{c.t}</b><span>{c.p}</span>
                    </motion.button>
                  ))}
                </div>
              </>}
              {tab === 'search' && <>
                <h4 className="ph4-h">Search</h4>
                <div className="ph4-search on"><Icon d={ICON.search} />Shirts, lamps, notebooks…</div>
                <p className="ph4-label">Recent</p>
                <div className="ph4-chips">{['linen', 'tote bag', 'desk lamp', 'gifts', 'notebook'].map(c => <motion.span key={c} {...press}>{c}</motion.span>)}</div>
                <p className="ph4-label">Popular</p>
                {['Summer edit', 'Under ₹999', 'Workspace'].map(r => <div key={r} className="ph4-row"><i className="ph4-thumb" /><b>{r}</b></div>)}
              </>}
              {tab === 'orders' && <>
                <h4 className="ph4-h">Orders</h4>
                {[['Linen shirt', 'Arriving today'], ['Field notes', 'Delivered'], ['Canvas tote', 'Delivered']].map(([a, b]) => <div key={a} className="ph4-row"><i className="ph4-thumb" /><span><b>{a}</b><small>{b}</small></span></div>)}
              </>}
            </motion.div>
          </AnimatePresence>
          <nav className="ph4-tabbar">
            {TABS.map(t => <motion.button key={t.id} type="button" className={t.id === tab ? 'on' : ''} {...press} onClick={() => switchTab(t.id)}><Icon d={ICON[t.id]} />{t.label}</motion.button>)}
          </nav>
        </div>

        {/* level 1: the card's page, grown out of the card */}
        <AnimatePresence onExitComplete={() => setClosing(null)}>
          {card != null && from && (
            <motion.div key="detail" className="ph4-detail" initial={{ ...from, borderRadius: 14 }} animate={{ top: 0, left: 0, width: SW, height: SH, borderRadius: 0, transition: T('card') }} exit={{ ...from, borderRadius: 14, transition: T('card', 'exit') }}>
              {/* its content comes in once the container has grown, and goes first when it shrinks */}
              <motion.div className="ph4-in" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: dur('card') * .5, delay: dur('card') * .4 } }} exit={{ opacity: 0, transition: { duration: dur('card', 'exit') * .4 } }}>
                {/* the page itself, and the next page — the shared axis */}
                <motion.div className="ph4-page" animate={{ x: page2 ? -dist : 0, opacity: page2 ? 0 : 1 }} transition={{ x: pageT, opacity: { duration: dur('page', page2 ? 'enter' : 'exit') * (page2 ? .35 : .7), delay: page2 ? 0 : dur('page', 'exit') * .3 } }}>
                  <div className="ph4-top"><motion.button type="button" className="ph4-back" aria-label="Back" {...press} onClick={closeCard}><Icon d={ICON.back} /></motion.button></div>
                  <i className="ph4-hero" />
                  <div className="ph4-body">
                    <h4>{CARDS[card].t}</h4><p className="ph4-price">{CARDS[card].p}</p>
                    <p className="ph4-copy">Washed soft, cut loose. Three sizes, two colours, made to order in a week.</p>
                  </div>
                  <div className="ph4-cta">
                    <motion.button ref={optionsRef} type="button" className="ph4-btn ghost" {...press} onClick={openSheet}>Options</motion.button>
                    <motion.button type="button" className="ph4-btn" {...press} onClick={forward}>Continue</motion.button>
                  </div>
                </motion.div>
                <AnimatePresence initial={false}>
                  {page2 && (
                    <motion.div key="p2" className="ph4-page two" initial={{ x: dist, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { x: T('page'), opacity: { duration: dur('page') * .7, delay: dur('page') * .3 } } }} exit={{ x: dist, opacity: 0, transition: { x: T('page', 'exit'), opacity: { duration: dur('page', 'exit') * .35 } } }}>
                      <div className="ph4-top"><motion.button type="button" className="ph4-back" aria-label="Back" {...press} onClick={back}><Icon d={ICON.back} /></motion.button><b>Checkout</b></div>
                      <div className="ph4-body">
                        <div className="ph4-steps"><i className="on" /><i className="on" /><i /></div>
                        {[['Item', CARDS[card].t], ['Size', 'M'], ['Delivery', 'Tomorrow'], ['Total', CARDS[card].p]].map(([a, b]) => <div key={a} className="ph4-line"><span>{a}</span><b>{b}</b></div>)}
                      </div>
                      <div className="ph4-cta"><motion.button ref={payRef} type="button" className="ph4-btn wide" {...press}>Pay {CARDS[card].p}</motion.button></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              {/* the sheet, over the page */}
              <AnimatePresence>
                {sheet && <motion.i key="scrim" className="ph4-scrim" onClick={closeSheet} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: dur('sheet') * .7 } }} exit={{ opacity: 0, transition: { duration: dur('sheet', 'exit') } }} />}
                {sheet && (
                  <motion.div key="sheet" className="ph4-sheet" initial={{ y: '100%' }} animate={{ y: 0, transition: T('sheet') }} exit={{ y: '100%', transition: T('sheet', 'exit') }}>
                    <i className="ph4-handle" />
                    <h4>Choose a size</h4>
                    {['Small', 'Medium', 'Large'].map((s, i) => <motion.div key={s} className={`ph4-opt${i === 1 ? ' on' : ''}`} {...press}><i />{s}</motion.div>)}
                    <motion.button type="button" className="ph4-btn wide" {...press} onClick={addToBag}>Add to bag</motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the toast, over everything */}
        <AnimatePresence>
          {toast > 0 && (
            <motion.div key={toast} className="ph4-toast" initial={{ opacity: 0, y: px('medium') }} animate={{ opacity: 1, y: 0, transition: T('toast') }} exit={{ opacity: 0, y: px('small'), transition: T('toast', 'exit') }}>
              <Icon d={ICON.check} />Added to bag
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
export default Phone04;
