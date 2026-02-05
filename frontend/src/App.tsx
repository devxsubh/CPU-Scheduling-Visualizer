import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import InputPage from './pages/InputPage';
import Results from './pages/Results';
import type { SimulateResponse } from './types';

function AppRoutes() {
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={<Landing onStart={() => navigate('/simulator')} />}
          />
          <Route
            path="/simulator"
            element={
              <InputPage
                onBack={() => navigate('/')}
                onResult={(r) => {
                  setResult(r);
                  navigate('/results');
                }}
              />
            }
          />
          <Route
            path="/results"
            element={
              result ? (
                <Results
                  result={result}
                  onTryAgain={() => navigate('/simulator')}
                  onBack={() => navigate('/')}
                />
              ) : (
                <Landing onStart={() => navigate('/simulator')} />
              )
            }
          />
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
