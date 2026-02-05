import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Simulator from './pages/Simulator';

function AppRoutes() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
