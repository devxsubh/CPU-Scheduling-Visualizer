import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import InputPage from './pages/InputPage';
import Results from './pages/Results';
import type { SimulateResponse } from './types';

type Page = 'landing' | 'input' | 'results';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [result, setResult] = useState<SimulateResponse | null>(null);

  return (
    <div className="min-h-screen bg-dark-950">
      <AnimatePresence mode="wait">
        {page === 'landing' && (
          <Landing key="landing" onStart={() => setPage('input')} />
        )}
        {page === 'input' && (
          <InputPage
            key="input"
            onBack={() => setPage('landing')}
            onResult={(r) => {
              setResult(r);
              setPage('results');
            }}
          />
        )}
        {page === 'results' && result && (
          <Results
            key="results"
            result={result}
            onTryAgain={() => {
              setResult(null);
              setPage('input');
            }}
            onBack={() => setPage('landing')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
