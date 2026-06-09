import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import MatchSetupPage from './pages/MatchSetupPage';
import LiveScoringPage from './pages/LiveScoringPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/setup" element={<MatchSetupPage />} />
          <Route path="/live" element={<LiveScoringPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d2416',
              color: '#f0f0f0',
              border: '1px solid rgba(201,168,76,0.3)',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
          }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
