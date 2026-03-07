import { StrictMode, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { App as CapacitorApp } from '@capacitor/app';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Pay from './pages/Pay';
import Wallet from './pages/Wallet';
import ProductPage from './pages/ProductPage';
import Settings from './pages/Settings';
import Stores from './pages/Stores';
import Orders from './pages/Orders';
import Layout from './components/Layout';
import Intro from './components/Intro';

import { AuthProvider, useAuth } from './context/AuthContext';
import { RewardsProvider } from './context/RewardsContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ExtrasProvider } from './context/ExtrasContext';
import { MembershipProvider } from './context/MembershipContext';
import { SocialMediaProvider } from './context/SocialMediaContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';

function ProtectedRoute({ children }) {
  const { isGuest } = useAuth();
  if (isGuest) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  const { user, loading: authLoading, isGuest, needsRegistration } = useAuth();
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        setMaintenanceMode(snap.data().maintenanceMode === true);
      }
    });
    return () => unsub();
  }, []);

  if (authLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-shaco-red tracking-widest font-bold">YÜKLENİYOR...</div>;

  if (maintenanceMode) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-8 text-center">
      <div className="text-6xl mb-6">🔧</div>
      <h1 className="text-3xl font-bold text-shaco-red mb-3 uppercase tracking-widest">Bakım Modu</h1>
      <p className="text-zinc-400 text-lg">Uygulama şu an bakımda. Kısa süre içinde geri döneceğiz.</p>
    </div>
  );

  // Global Yönlendirme Koruması (Profile Tamamlama Zorunluluğu)
  if (needsRegistration && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* MOBIL UYGULAMA (PWA) ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="menu" element={<Menu />} />
          <Route path="pay" element={<ProtectedRoute><Pay /></ProtectedRoute>} />
          <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="settings" element={<Settings />} />
          <Route path="stores" element={<Stores />} />
          <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="product/:id" element={<ProductPage />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [backPressedOnce, setBackPressedOnce] = useState(false);

  useEffect(() => {

    // Double back to exit logic
    const handleBackButton = async () => {
      const listener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack) {
          if (backPressedOnce) {
            CapacitorApp.exitApp();
          } else {
            setBackPressedOnce(true);
            // Show simple toast
            const toast = document.createElement('div');
            toast.innerText = 'Çıkmak için tekrar basın';
            toast.style.position = 'fixed';
            toast.style.bottom = '50px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '20px';
            toast.style.zIndex = '9999';
            document.body.appendChild(toast);
            setTimeout(() => {
              setBackPressedOnce(false);
              document.body.removeChild(toast);
            }, 2000);
          }
        } else {
          window.history.back();
        }
      });

      return () => {
        listener.remove();
      };
    };

    handleBackButton();
  }, [backPressedOnce]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <RewardsProvider>
              <ExtrasProvider>
                <MembershipProvider>
                  <SocialMediaProvider>
                    <FavoritesProvider>
                      <AnimatePresence mode="wait">
                        {showIntro ? (
                          <Intro key="intro" onComplete={() => setShowIntro(false)} />
                        ) : (
                          <BrowserRouter>
                            <AppRoutes />
                          </BrowserRouter>
                        )}
                      </AnimatePresence>
                    </FavoritesProvider>
                  </SocialMediaProvider>
                </MembershipProvider>
              </ExtrasProvider>
            </RewardsProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
