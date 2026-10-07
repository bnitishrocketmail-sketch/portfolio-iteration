import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LabIndex from './lab/LabIndex';
import Iteration01 from './lab/01-sheet/Iteration01';
import Iteration02 from './lab/02-field/Iteration02';

/* Routes. `/` points at the current iteration until one is adopted as the site. */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/lab/02-field" replace />} />
        <Route path="/lab" element={<LabIndex />} />
        <Route path="/lab/01-sheet" element={<Iteration01 />} />
        <Route path="/lab/01-sheet/:view" element={<Iteration01 />} />
        <Route path="/lab/01-sheet/:view/:pid" element={<Iteration01 />} />
        <Route path="/lab/02-field" element={<Iteration02 />} />
        <Route path="*" element={<Navigate to="/lab" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
