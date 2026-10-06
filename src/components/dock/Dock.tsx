import { motion } from 'motion/react';
import { NAV, type ViewName } from '../../lib/data';
import './dock.css';

const ICONS: Record<string, React.ReactNode> = {
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
  projects: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></svg>,
  micro: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="9" strokeDasharray="4 4" /></svg>,
  campaign: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M6 4l14 8-14 8z" /></svg>,
  writing: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h10" /></svg>,
  experience: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /></svg>,
};

type Props = { active: ViewName; onGo: (view: ViewName) => void };
const keyOf = (v: ViewName) => (v === 'project' ? 'projects' : v);

/* Desktop / tablet: the reference's side nav — rotated labels in the sheet's left margin,
   reading bottom to top. The travelling highlight is the one thing added to it. */
export function SideNav({ active, onGo }: Props) {
  const key = keyOf(active);
  return (
    <nav className="sidenav" aria-label="Sections">
      {NAV.map(item => (
        <button key={item.id} type="button" className={item.id === key ? 'on' : ''} aria-current={item.id === key ? 'page' : undefined} onClick={() => onGo(item.id)}>
          {item.id === key && <motion.span layoutId="nav-ind" className="nav-ind" transition={{ type: 'spring', bounce: .2, duration: .55 }} />}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* Phones: a bottom bar with icons; the active item shows its label. */
export default function Dock({ active, onGo }: Props) {
  const key = keyOf(active);
  return (
    <div className="dock-wrap">
      <nav className="dock" aria-label="Sections">
        {NAV.map(item => (
          <button key={item.id} type="button" className={item.id === key ? 'on' : ''} aria-current={item.id === key ? 'page' : undefined} onClick={() => onGo(item.id)}>
            {item.id === key && <motion.span layoutId="dock-ind" className="dock-ind" transition={{ type: 'spring', bounce: .22, duration: .55 }} />}
            {ICONS[item.id]}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button className={`theme${isDark ? ' is-dark' : ''}`} type="button" aria-label="Toggle dark mode" onClick={onToggle}>
      <svg className="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg className="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
    </button>
  );
}
