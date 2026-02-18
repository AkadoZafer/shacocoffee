import { StrictMode, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Pay from './pages/Pay';
import Wallet from './pages/Wallet';
import ProductPage from './pages/ProductPage';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import Cart from './pages/Cart';
import Stores from './pages/Stores';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RewardsProvider } from './context/RewardsContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ExtrasProvider } from './context/ExtrasContext';
import { MembershipProvider } from './context/MembershipContext';
import { SocialMediaProvider } from './context/SocialMediaContext';

function AppRoutes() {
  const { user, loading, isGuest, isStaff, isBarista, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-shaco-red">Loading...</div>;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth pages - accessible always */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main app - always accessible (guest or logged in) */}
        <Route path="/" element={<Layout />}>
          {/* Home route - always Home for everyone, admin panel at /admin */}
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/pay" element={<Pay />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="settings" element={<Settings />} />
          <Route path="stores" element={<Stores />} />
          <Route path="cart" element={<Cart />} />
          <Route path="product/:id" element={<ProductPage />} />
          <Route path="admin" element={isStaff ? <AdminPanel /> : <Navigate to="/" />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

import Intro from './components/Intro';
import { useState } from 'react';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <RewardsProvider>
            <ExtrasProvider>
              <MembershipProvider>
                <SocialMediaProvider>
                  <AnimatePresence mode="wait">
                    {showIntro ? (
                      <Intro key="intro" onComplete={() => setShowIntro(false)} />
                    ) : (
                      <BrowserRouter>
                        <AppRoutes />
                      </BrowserRouter>
                    )}
                  </AnimatePresence>
                </SocialMediaProvider>
              </MembershipProvider>
            </ExtrasProvider>
          </RewardsProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
