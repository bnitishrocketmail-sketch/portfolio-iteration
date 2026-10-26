/* the system's arrow (26 Oct): the one drawn in the round arrow buttons (the Projects cards', the next project's) — a 2-unit
   stroke, round ends, on a 24 grid — as an icon for buttons and links. `out` turns it up and to the right, for a link that
   opens another site. It takes the text's colour and is sized by its parent (1em by default) */
export function Arrow04({ out = false, className }: { out?: boolean; className?: string }) {
  return (
    <svg className={`arrow4${out ? ' out' : ''}${className ? ' ' + className : ''}`} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
