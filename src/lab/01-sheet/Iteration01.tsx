import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, LayoutGroup } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PROJECTS, VIEW_ORDER, contextFor, type ViewName } from '../../lib/data';
import { useTheme } from '../../lib/theme';
import Hero from '../../components/hero/Hero';
import Island from '../../components/island/Island';
import Dock, { ThemeToggle } from '../../components/dock/Dock';
import { Campaign, Experience, Home, Micro, ProjectDetail, Projects, Writing } from '../../views/Views';
import '../../styles/shell.css';

const BASE = '/lab/01-sheet';

/* Iteration 01 — "Sheet". One view at a time: the hero column persists, the right column swaps. */
export default function Iteration01() {
  const { view: viewParam, pid } = useParams();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

  const view: ViewName = viewParam === 'project' && pid ? 'project' : (VIEW_ORDER.includes(viewParam as ViewName) && viewParam !== 'project' ? (viewParam as ViewName) : 'home');
  const project = view === 'project' ? PROJECTS.find(p => p.id === pid) ?? null : null;

  /* direction of travel for the swipe: forward in the dock order goes left */
  const prev = useRef(VIEW_ORDER.indexOf(view));
  const idx = VIEW_ORDER.indexOf(view);
  const dir = idx >= prev.current ? 1 : -1;
  useEffect(() => { prev.current = idx; }, [idx]);

  const go = useCallback((next: ViewName, nextPid?: string) => {
    if (next === 'project' && !nextPid) next = 'projects';
    navigate(next === 'home' ? BASE : next === 'project' ? `${BASE}/project/${nextPid}` : `${BASE}/${next}`);
  }, [navigate]);

  /* on phones the sheet scrolls; a view change starts at the top */
  useEffect(() => { window.scrollTo({ top: 0 }); }, [view, pid]);

  const key = view === 'project' ? `project-${pid}` : view;

  return (
    <LayoutGroup>
      <Island context={contextFor(view, pid)} onGo={go} onToggleTheme={toggle} />
      <ThemeToggle isDark={isDark} onToggle={toggle} />
      <Link className="labtag" to="/lab">Lab · 01 Sheet</Link>

      <main className="sheet">
        <div className="shell">
          <Hero project={project} onBack={() => go('projects')} />
          <div className="views">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              {view === 'home' && <Home key="home" onGo={go} dir={dir} />}
              {view === 'projects' && <Projects key="projects" onGo={go} dir={dir} />}
              {view === 'project' && project && <ProjectDetail key={key} onGo={go} dir={dir} project={project} />}
              {view === 'micro' && <Micro key="micro" onGo={go} dir={dir} />}
              {view === 'campaign' && <Campaign key="campaign" onGo={go} dir={dir} />}
              {view === 'writing' && <Writing key="writing" onGo={go} dir={dir} />}
              {view === 'experience' && <Experience key="experience" onGo={go} dir={dir} />}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Dock active={view} onGo={go} />
    </LayoutGroup>
  );
}
