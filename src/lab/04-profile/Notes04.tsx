import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';

/* The Articles tab, renamed Notes (Nitish, 23 Oct: "rename it on your judgement — it holds the 'Recent articles' from my
   old portfolio: the GenAI characters research, optimising in-app motion, and the Humans of Blinkit story"). Laid out as
   the old site's section: a card per note, its thumbnail inset at the top (the card square, text and all; each visual anchored
   where it reads: the images from their top, the clip in the middle — 23 Oct), the title and a line under it — with 04's
   radii, faces and type. The thumbnails are the old site's own (public/articles); the motion one is its clip, playing
   while in view. A note with a link opens it in a new tab. */
type Note = { id: string; title: string; line: string; img?: string; pos?: string /* where the visual is anchored in its square */; clip?: { src: string; poster: string; fit?: string }; href?: string; by?: string };
const NOTES: Note[] = [
  { id: 'genai', title: 'Generative AI consistent style characters', line: 'A cast of expressive 3D avatars curated with a structured AI prompting approach.', img: '/articles/genai.webp', pos: '50% 0%', by: 'Research · Lenskart' },
  { id: 'motion', title: 'Optimizing in-app motion design', line: 'Smart Lottie practices and performance hacks.', clip: { src: '/articles/motion.mp4', poster: '/articles/motion-poster.webp', fit: '#e9eefd' }, pos: '50% 50%' /* anchored in the middle */, by: 'Article' },
  { id: 'journey', title: 'My journey', line: 'Humans of Blinkit: from photography at Grofers to design.', img: '/articles/journey.webp', pos: '50% 0%', href: 'https://blinkit.com/blog/my-journey-so-far-nitish-bhardwaj', by: 'Feature · Blinkit' },
];

function Clip({ src, poster }: { src: string; poster: string; fit?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const v = ref.current; if (!v) return;
    if (reduce) { v.pause(); return; }
    const io = new IntersectionObserver(es => es.forEach(e => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())), { threshold: .3 });
    io.observe(v); return () => io.disconnect();
  }, [reduce]);
  return <video ref={ref} style={{ objectPosition: '50% 50%' }} src={src} poster={poster} muted loop playsInline preload="metadata" />;
}

export default function Notes04() {
  return (
    <section className="pp4 nt4 navpage4" aria-label="Notes">
      <header className="pp4-head">
        <h2 className="h2-4">Notes</h2>
        <div className="pp4-right"><p className="pp4-note">A few things I learned with hands-on experience, and where it started.</p></div>
      </header>
      <div className="nt4-grid">
        {NOTES.map(n => {
          const body = (
            <>
              <div className="nt4-thumb" style={n.clip?.fit ? { background: n.clip.fit } : undefined}>{n.clip ? <Clip {...n.clip} /> : <img src={n.img} alt="" loading="lazy" style={{ objectPosition: n.pos }} />}</div>
              <div className="nt4-body">
                {n.by && <span className="nt4-by">{n.by}{n.href && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>}
                <h3>{n.title}</h3>
                <p>{n.line}</p>
              </div>
            </>
          );
          return n.href
            ? <a key={n.id} className="nt4-card link" href={n.href} target="_blank" rel="noreferrer">{body}</a>
            : <article key={n.id} className="nt4-card">{body}</article>;
        })}
      </div>
    </section>
  );
}
