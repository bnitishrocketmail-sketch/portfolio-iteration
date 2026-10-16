import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { mappingOf, moment, msOf, pxOf, role, scaleOf, tr, type MomentId, type Phase } from './motionTokens';
import { CONTRACT, type CEvent, type ContractStatus, type Scenario } from './Contract04';

/* The motion system's product (Nitish, 16 Oct): a small generic shop on a phone, moved only by the system's semantic
   tokens — a grid of cards that open into their page (container transform), a checkout page forward and back (shared
   axis), three tabs (fade through), a size sheet, a toast, and the press on everything tappable.
   One continuous app (Nitish, 16 Oct: switching tabs from inside a card closed the card first — "is this the whole flow
   in continuation or not?"): the tab bar stays, as in most apps, and each tab keeps its place — leaving Home with a card
   open fades the whole of Home out, and coming back finds the card still open. What is added to the bag is in the Bag
   tab, its count on the tab. The list plays a moment from wherever the app is, doing only what that moment needs
   first (a sheet needs its card's page); `flow` plays the whole journey in order. Every transition is reported
   (`onMoment`). The screen is a fixed 262 × 562 and the whole phone is scaled to fit; geometry is read in its units. */
export type PhoneHandle = { play: (id: MomentId) => void; flow: () => void; stop: () => void };
type Props = { onMoment: (id: MomentId, phase: Phase) => void; onFlowEnd: () => void; scale: number; scenario: Scenario; onContract: (s: ContractStatus) => void };

const SW = 262, BAR = 58, VH = 562 - BAR; /* the screen, the tab bar, the area above it */
const CARDS = [{ t: 'Linen shirt', p: 1490 }, { t: 'Canvas tote', p: 890 }, { t: 'Desk lamp', p: 2350 }, { t: 'Field notes', p: 340 }];
const rs = (n: number) => '₹' + n.toLocaleString('en-IN');
/* what the status line says in each state: readable, and announced, whatever the motion */
const STATUS: Record<ContractStatus['state'], string> = { ready: '', processing: 'Contacting your bank…', checking: 'Confirming with your bank — you won’t be charged twice.', done: 'Order placed. Receipt on its way.', failed: 'Payment failed. You were not charged.' };
const TABS = [{ id: 'home', label: 'Home' }, { id: 'search', label: 'Search' }, { id: 'bag', label: 'Bag' }] as const;
type Tab = typeof TABS[number]['id'];
type Box = { top: number; left: number; width: number; height: number };

const M = { card: moment('card'), page: moment('page'), pay: moment('pay'), tab: moment('tab'), sheet: moment('sheet'), toast: moment('toast'), press: moment('press') };

const Icon = ({ d }: { d: string }) => <svg viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const ICON = { home: 'M4 11l8-6 8 6v8h-5v-5H9v5H4z', search: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm5-2 4 4', bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2', back: 'M15 5l-7 7 7 7', check: 'M5 12.5l4.2 4.2L19 7' };

const Phone04 = forwardRef<PhoneHandle, Props>(function Phone04({ onMoment: report, onFlowEnd, scale, scenario, onContract }, ref) {
  /* the last moment reported — so the toast leaving on its own does not take the page from a moment played since */
  const lastM = useRef<MomentId | null>(null);
  const onMoment = (id: MomentId, phase: Phase) => { lastM.current = id; report(id, phase); };
  const reduce = !!useReducedMotion();
  const T = (id: keyof typeof M, phase: Phase = 'enter') => tr(mappingOf(id, phase), reduce);
  const dur = (id: keyof typeof M, phase: Phase = 'enter') => (reduce ? 0 : msOf(mappingOf(id, phase)) / 1000);
  const ms = (id: keyof typeof M, phase: Phase = 'enter') => msOf(mappingOf(id, phase));
  const PRESS = scaleOf(role('motion.feedback.press').scale!);
  const press = { whileTap: { scale: PRESS }, transition: T('press') };

  const screen = useRef<HTMLDivElement>(null);
  const cardEls = useRef<(HTMLElement | null)[]>([]);
  const [tab, setTab] = useState<Tab>('home');
  const [card, setCard] = useState<number | null>(null);   /* the card whose page is open, on Home */
  const [from, setFrom] = useState<Box | null>(null);      /* where that page grew from */
  const [closing, setClosing] = useState<number | null>(null);
  const [page2, setPage2] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [toast, setToast] = useState(0);
  const [bag, setBag] = useState<number[]>([]);
  /* Pay runs the component contract (Contract04.tsx): the application's events move it, on their own timers — a moment
     played meanwhile, or leaving the page, does not stop them */
  const [pay, setPay] = useState<ContractStatus>({ state: 'ready', last: null, n: 0, ignored: 0 });
  const payRef2 = useRef(pay); payRef2.current = pay;
  const scnRef = useRef(scenario); scnRef.current = scenario;
  const appT = useRef<number[]>([]);
  const appLater = (f: () => void, t: number) => { appT.current.push(window.setTimeout(f, t)); };
  const appClear = () => { appT.current.forEach(clearTimeout); appT.current = []; };
  useEffect(() => appClear, []);
  useEffect(() => { onContract(pay); }, [pay]); // eslint-disable-line react-hooks/exhaustive-deps
  const fire = (e: CEvent) => setPay(p => { const row = CONTRACT.find(([from, ev]) => from === p.state && ev === e); return row ? { ...p, state: row[2], last: e, n: p.n + 1 } : p; });
  /* the server's answer, as the viewer chose it */
  const respond = () => {
    const s = scnRef.current;
    appLater(() => {
      if (s === 'confirmed') fire('confirmed'); else if (s === 'rejected') fire('rejected');
      else { fire('unclear'); appLater(() => fire(s === 'unclear-done' ? 'reconciled-done' : 'reconciled-failed'), 1800); }
    }, 1300);
  };
  const payTap = () => {
    const st = payRef2.current.state;
    if (st === 'processing' || st === 'checking') { setPay(p => ({ ...p, ignored: p.ignored + 1 })); return; } /* no duplicate submission */
    onMoment('pay', 'enter');
    if (st === 'ready') { fire('submit'); respond(); }
    else if (st === 'failed') { fire('retry'); respond(); }
  };
  const payEdit = () => { if (payRef2.current.state === 'done') { fire('edit'); onMoment('pay', 'exit'); } };

  /* a live copy of the state, for the played sequences, which run across renders */
  const S = useRef({ tab, card, page2, sheet }); S.current = { tab, card, page2, sheet };
  const timers = useRef<number[]>([]);
  const later = (f: () => void, t: number) => { timers.current.push(window.setTimeout(f, reduce ? 0 : t)); };
  const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
  useEffect(() => clear, []);
  const optionsRef = useRef<HTMLButtonElement>(null), payRef = useRef<HTMLButtonElement>(null), tabEls = useRef<(HTMLElement | null)[]>([]);

  /* the moves, each reporting its moment */
  const boxOf = (i: number): Box => {
    const s = screen.current!.getBoundingClientRect(), c = cardEls.current[i]!.getBoundingClientRect();
    return { top: (c.top - s.top) / scale, left: (c.left - s.left) / scale, width: c.width / scale, height: c.height / scale };
  };
  const openCard = (i: number) => { setFrom(boxOf(i)); setCard(i); setPage2(false); appClear(); setPay({ state: 'ready', last: null, n: 0, ignored: 0 }); onMoment('card', 'enter'); };
  const closeCard = () => { if (S.current.card == null) return; setClosing(S.current.card); setPage2(false); setCard(null); onMoment('card', 'exit'); };
  const forward = () => { setPage2(true); onMoment('page', 'enter'); };
  const back = () => { setPage2(false); onMoment('page', 'exit'); };
  const switchTab = (t: Tab) => { if (t === S.current.tab) return; setTab(t); onMoment('tab', 'enter'); };
  const openSheet = () => { setSheet(true); onMoment('sheet', 'enter'); };
  const closeSheet = () => { setSheet(false); onMoment('sheet', 'exit'); };
  /* the toast leaves on its own; its timer is its own, so a moment played meanwhile does not cancel it */
  const toastT = useRef(0);
  useEffect(() => () => window.clearTimeout(toastT.current), []);
  const showToast = () => {
    setToast(k => k + 1); onMoment('toast', 'enter');
    window.clearTimeout(toastT.current); toastT.current = window.setTimeout(() => { setToast(0); if (lastM.current === 'toast') onMoment('toast', 'exit'); }, 1700);
  };
  const addToBag = () => { const c = S.current.card; closeSheet(); if (c != null) setBag(b => [...b, c]); later(showToast, ms('sheet', 'exit')); };
  const pressOn = (el: HTMLElement | null) => {
    onMoment('press', 'enter'); if (!el || reduce) return;
    animate(el, { scale: [1, PRESS, 1] }, { duration: 2 * ms('press') / 1000, ease: [.2, 0, 0, 1], times: [0, .5, 1] });
  };

  /* what each moment needs first, from wherever the app is: the card's page on Home, no sheet over it, no page over it */
  const fade = ms('tab', 'exit') + ms('tab') + 60; /* a fade through: the old tab out, then the new one in */
  const toHome = (f: () => void) => { if (S.current.tab !== 'home') { switchTab('home'); later(f, fade); } else f(); };
  const toPage = (f: () => void) => toHome(() => {
    if (S.current.card == null) { openCard(0); later(f, ms('card') + 120); }
    else if (S.current.page2) { back(); later(f, ms('page', 'exit') + 120); }
    else f();
  });
  const unSheet = (f: () => void) => { if (S.current.sheet) { closeSheet(); later(f, ms('sheet', 'exit') + 90); } else f(); };

  useImperativeHandle(ref, () => ({
    play(id) {
      clear();
      if (id === 'card') unSheet(() => toHome(() => (S.current.card == null ? openCard(0) : closeCard())));
      if (id === 'sheet') { if (S.current.sheet) closeSheet(); else toPage(openSheet); }
      if (id === 'toast') { if (S.current.sheet) addToBag(); else toPage(() => { openSheet(); later(addToBag, ms('sheet') + 450); }); }
      if (id === 'page') unSheet(() => toHome(() => { if (S.current.card == null) { openCard(0); later(forward, ms('card') + 120); } else if (S.current.page2) back(); else forward(); }));
      if (id === 'pay') unSheet(() => toHome(() => {
        const go = () => { if (payRef2.current.state === 'done') { payEdit(); later(payTap, 400); } else payTap(); };
        if (S.current.card == null) { openCard(0); later(() => { forward(); later(go, ms('page') + 200); }, ms('card') + 120); }
        else if (!S.current.page2) { forward(); later(go, ms('page') + 200); } else go();
      }));
      if (id === 'tab') unSheet(() => switchTab(TABS[(TABS.findIndex(t => t.id === S.current.tab) + 1) % TABS.length].id));
      if (id === 'press') {
        const { tab: t, card: c, page2: p } = S.current;
        pressOn(t === 'home' ? (c == null ? cardEls.current[0] : p ? payRef.current : optionsRef.current) : tabEls.current[TABS.findIndex(x => x.id === t)]);
      }
    },
    /* the journey, in order: open a card, choose a size, add it (the toast), go to checkout and back, look in the bag,
       come back to the card where it was, close it */
    flow() {
      clear();
      const steps: [() => void, number][] = [
        [() => openCard(1), 1100], [openSheet, 1000], [addToBag, 1500], [forward, 1100], [payTap, scnRef.current.startsWith('unclear') ? 4300 : 2500], [back, 1000],
        [() => switchTab('bag'), 1300], [() => switchTab('home'), 1200], [closeCard, 900],
      ];
      const run = (i: number) => { if (i >= steps.length) { onFlowEnd(); return; } steps[i][0](); later(() => run(i + 1), steps[i][1]); };
      /* from the start: Home, nothing open */
      const reset = (f: () => void) => unSheet(() => toHome(() => { if (S.current.card != null) { if (S.current.page2) back(); closeCard(); later(f, ms('card', 'exit') + 300); } else f(); }));
      reset(() => run(0));
    },
    stop() { clear(); },
  }));

  const pageT = T('page', page2 ? 'enter' : 'exit');
  const dist = pxOf(role('motion.navigation.forward').distance!);
  const total = bag.reduce((s, i) => s + CARDS[i].p, 0);

  return (
    <div className="ph4" style={{ transform: `scale(${scale})` }}>
      <div className="ph4-screen" ref={screen}>
        <div className="ph4-status"><span>9:41</span><i /></div>

        {/* the tabs, faded through; each keeps its place (Home its open card) */}
        <AnimatePresence initial={false} mode="wait">
          <motion.div key={tab} className="ph4-view" initial={{ opacity: 0, scale: scaleOf(role('motion.view.arrive').scale!) }} animate={{ opacity: 1, scale: 1, transition: T('tab') }} exit={{ opacity: 0, transition: T('tab', 'exit') }}>
            {tab === 'home' && <>
              <div className="ph4-pad">
                <h4 className="ph4-h">Discover</h4>
                <div className="ph4-search"><Icon d={ICON.search} />Search</div>
                <p className="ph4-label">For you</p>
                <div className="ph4-grid">
                  {CARDS.map((c, i) => (
                    <motion.button key={c.t} type="button" ref={el => { cardEls.current[i] = el; }} className="ph4-card" style={{ visibility: card === i || closing === i ? 'hidden' : 'visible' }} {...press} onClick={() => openCard(i)}>
                      <i className="ph4-img" /><b>{c.t}</b><span>{rs(c.p)}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
              {/* the card's page, grown out of the card; already open when Home comes back */}
              <AnimatePresence initial={false} onExitComplete={() => setClosing(null)}>
                {card != null && from && (
                  <motion.div key="detail" className="ph4-detail" initial={{ ...from, borderRadius: 14 }} animate={{ top: 0, left: 0, width: SW, height: VH, borderRadius: 0, transition: T('card') }} exit={{ ...from, borderRadius: 14, transition: T('card', 'exit') }}>
                    {/* its content comes in once the container has grown, and goes first when it shrinks */}
                    <motion.div className="ph4-in" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: dur('card') * .5, delay: dur('card') * .4 } }} exit={{ opacity: 0, transition: { duration: dur('card', 'exit') * .4 } }}>
                      {/* the page itself, and the next page — the shared axis */}
                      <motion.div className="ph4-page" initial={false} animate={{ x: page2 ? -dist : 0, opacity: page2 ? 0 : 1 }} transition={{ x: pageT, opacity: { duration: dur('page', page2 ? 'enter' : 'exit') * (page2 ? .35 : .7), delay: page2 ? 0 : dur('page', 'exit') * .3 } }}>
                        <div className="ph4-top"><motion.button type="button" className="ph4-back" aria-label="Back" {...press} onClick={closeCard}><Icon d={ICON.back} /></motion.button></div>
                        <i className="ph4-hero" />
                        <div className="ph4-body">
                          <h4>{CARDS[card].t}</h4><p className="ph4-price">{rs(CARDS[card].p)}</p>
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
                              {[['Item', CARDS[card].t], ['Size', 'M'], ['Delivery', 'Tomorrow'], ['Total', rs(CARDS[card].p)]].map(([a, b]) => <div key={a} className="ph4-line"><span>{a}</span>{a === 'Size' && pay.state === 'done' ? <button type="button" className="ph4-edit" onClick={payEdit}>M · Edit</button> : <b>{b}</b>}</div>)}
                            </div>
                            <div className="ph4-cta col">
                              <p className="ph4-stat" role="status" aria-live="polite">{STATUS[pay.state]}</p>
                              <motion.button ref={payRef} type="button" className={`ph4-btn wide pay ${pay.state}`} aria-disabled={pay.state === 'processing' || pay.state === 'checking' || pay.state === 'done'} {...(pay.state === 'ready' || pay.state === 'failed' ? press : {})} onClick={payTap}>
                                <AnimatePresence initial={false} mode="popLayout">
                                  <motion.span key={pay.state} className="ph4-pl" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: T('pay', 'exit') }} exit={{ opacity: 0, transition: T('pay', 'exit') }}>
                                    {pay.state === 'ready' && `Pay ${rs(CARDS[card].p)}`}
                                    {pay.state === 'processing' && <><i className="ph4-spin" aria-hidden="true" />Paying…</>}
                                    {pay.state === 'checking' && <><i className="ph4-spin slow" aria-hidden="true" />Checking status…</>}
                                    {pay.state === 'done' && <><Icon d={ICON.check} />Paid</>}
                                    {pay.state === 'failed' && 'Retry payment'}
                                  </motion.span>
                                </AnimatePresence>
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>}
            {tab === 'search' && <div className="ph4-pad">
              <h4 className="ph4-h">Search</h4>
              <div className="ph4-search on"><Icon d={ICON.search} />Shirts, lamps, notebooks…</div>
              <p className="ph4-label">Recent</p>
              <div className="ph4-chips">{['linen', 'tote bag', 'desk lamp', 'gifts', 'notebook'].map(c => <motion.span key={c} {...press}>{c}</motion.span>)}</div>
              <p className="ph4-label">Popular</p>
              {['Summer edit', 'Under ₹999', 'Workspace'].map(r => <div key={r} className="ph4-row"><i className="ph4-thumb" /><b>{r}</b></div>)}
            </div>}
            {tab === 'bag' && <div className="ph4-pad">
              <h4 className="ph4-h">Bag</h4>
              {bag.length === 0 ? <p className="ph4-empty">Nothing here yet. What you add from a card’s options lands here.</p> : <>
                {bag.map((i, k) => <div key={k} className="ph4-row"><i className="ph4-thumb" /><span><b>{CARDS[i].t}</b><small>Size M · {rs(CARDS[i].p)}</small></span></div>)}
                <div className="ph4-line"><span>Total</span><b>{rs(total)}</b></div>
              </>}
            </div>}
          </motion.div>
        </AnimatePresence>

        {/* the tab bar stays; the bag's count on its tab */}
        <nav className="ph4-tabbar">
          {TABS.map((t, i) => (
            <motion.button key={t.id} ref={el => { tabEls.current[i] = el; }} type="button" className={t.id === tab ? 'on' : ''} {...press} onClick={() => unSheet(() => switchTab(t.id))}>
              <span className="ph4-ti"><Icon d={ICON[t.id]} />{t.id === 'bag' && bag.length > 0 && <motion.b key={bag.length} className="ph4-badge" initial={{ scale: reduce ? 1 : 1.5 }} animate={{ scale: 1 }} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 14 }}>{bag.length}</motion.b>}</span>
              {t.label}
            </motion.button>
          ))}
        </nav>

        {/* the sheet, over everything below it (the tab bar too: it asks for an answer first) */}
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

        {/* the toast, over everything */}
        <AnimatePresence>
          {toast > 0 && (
            <motion.div key={toast} className="ph4-toast" initial={{ opacity: 0, y: pxOf(role('motion.surface.enter').distance!) }} animate={{ opacity: 1, y: 0, transition: T('toast') }} exit={{ opacity: 0, y: pxOf(role('motion.surface.exit').distance!), transition: T('toast', 'exit') }}>
              <Icon d={ICON.check} />Added to bag
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
export default Phone04;
