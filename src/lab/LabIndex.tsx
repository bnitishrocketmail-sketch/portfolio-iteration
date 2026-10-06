import { Link } from 'react-router-dom';
import { ITERATIONS } from './iterations';
import './lab.css';

export default function LabIndex() {
  return (
    <main className="lab">
      <header className="lab-head">
        <p className="eyebrow">imakeuimove · lab</p>
        <h1>Iterations</h1>
        <p className="view-note">Each iteration is a live page. Status: exploring, shortlisted, parked, adopted. The log of what each one tries and where its elements came from is in LOG.md.</p>
      </header>
      <ul className="lab-list">
        {ITERATIONS.map(it => (
          <li key={it.id}>
            <Link to={`/lab/${it.id}`} className="lab-card">
              <span className={`lab-status ${it.status}`}>{it.status}</span>
              <h2>{it.name}</h2>
              <p>{it.tries}</p>
              <p className="mono-s dim">{it.refs.join(' · ')}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
