/* 04's tabs that have no page yet (Nitish, 16 Oct): the heading and a line on what will be there, in the projects page's
   header pattern, so the tab is not the intro again. */
const NOTE: Record<string, string> = {
  motion: 'A motion system for a digital product — the tokens, the roles they make, and the components built from them.',
  lab: 'Experiments, the plugin, and explorations you can play with.',
  articles: 'What I have written, and what has been written about my work.',
};
export default function Soon04({ id, label }: { id: string; label: string }) {
  return (
    <section className="pp4" aria-label={label}>
      <header className="pp4-head">
        <h2 className="h2-4">{label}</h2>
        <div className="pp4-right"><p className="pp4-note">{NOTE[id]}</p></div>
      </header>
      <div className="soon4" aria-hidden="true"><span>Being built</span></div>
    </section>
  );
}
