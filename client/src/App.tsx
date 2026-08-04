import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy-loaded page components for optimal bundle splitting & performance
const Home = React.lazy(() => import('./pages/Home'));
const Packages = React.lazy(() => import('./pages/Packages'));
const Login = React.lazy(() => import('./pages/Login'));
const OperatorDashboard = React.lazy(() => import('./pages/OperatorDashboard'));
const TouristProfile = React.lazy(() => import('./pages/TouristProfile'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const HelpCenter = React.lazy(() => import('./pages/HelpCenter'));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
    <p className="text-slate-400 font-semibold text-sm tracking-wide">Loading Experience...</p>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-500/30">
          <div>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/destinations" element={<Packages />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/operator" element={<OperatorDashboard />} />
                  <Route path="/profile" element={<TouristProfile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/help" element={<HelpCenter />} />
                </Routes>
              </Suspense>
            </main>
          </div>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
