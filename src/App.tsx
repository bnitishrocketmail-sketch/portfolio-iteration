import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LabIndex from './lab/LabIndex';
import Iteration01 from './lab/01-sheet/Iteration01';
import Iteration02 from './lab/02-field/Iteration02';
import Iteration03 from './lab/03-console/Iteration03';

/* Routes. `/` points at the current iteration until one is adopted as the site. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/lab/02b-field" replace />} />
        <Route path="/lab" element={<LabIndex />} />
        <Route path="/lab/01-sheet" element={<Iteration01 />} />
        <Route path="/lab/01-sheet/:view" element={<Iteration01 />} />
        <Route path="/lab/01-sheet/:view/:pid" element={<Iteration01 />} />
        <Route path="/lab/01b-sheet" element={<Iteration01 variant="b" />} />
        <Route path="/lab/01b-sheet/:view" element={<Iteration01 variant="b" />} />
        <Route path="/lab/01b-sheet/:view/:pid" element={<Iteration01 variant="b" />} />
        <Route path="/lab/02-field" element={<Iteration02 />} />
        <Route path="/lab/02b-field" element={<Iteration02 palette="01" />} />
        <Route path="/lab/03-console" element={<Iteration03 />} />
        <Route path="/lab/03-console/:view" element={<Iteration03 />} />
        <Route path="/lab/03-console/:view/:pid" element={<Iteration03 />} />
        <Route path="*" element={<Navigate to="/lab" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
