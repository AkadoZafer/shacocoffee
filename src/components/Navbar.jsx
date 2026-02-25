import { Link, useLocation } from 'react-router-dom';
import { Home, Coffee, CreditCard, ShoppingCart, User, QrCode, Shield, ClipboardList } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function Navbar() {
    const location = useLocation();
    const { theme } = useTheme();
    const { user, isStaff, isBarista, isAdmin } = useAuth();
    const isActive = (path) => location.pathname === path;

    const isDark = theme === 'dark';

    // Staff navbar: Ana Sayfa, Yönetici Panel, Profil
    if (isStaff) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none pb-6 pt-4 bg-gradient-to-t from-shaco-black/80 to-transparent">
                <nav className={`w-full max-w-sm mx-4 backdrop-blur-2xl border rounded-2xl shadow-glass flex items-center justify-between p-2 px-6 relative pointer-events-auto transition-all duration-300 ${isDark
                    ? 'bg-zinc-900/80 border-white/5'
                    : 'bg-white/90 border-zinc-200/50'
                    }`}>
                    <NavLink to="/" icon={<Home size={22} />} label="Ana Sayfa" active={isActive('/')} isDark={isDark} />

                    <NavLink to="/admin" icon={<Shield size={22} />} label="Yönetim" active={isActive('/admin')} isDark={isDark} />

                    <NavLink to="/settings" icon={<User size={22} />} label="Hesabım" active={isActive('/settings')} isDark={isDark} />
                </nav>
            </div>
        );
    }

    // Customer / Guest navbar: Ana Sayfa, Menü, QR/Ödeme, Hesabım
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none pb-8 pt-12 bg-gradient-to-t from-shaco-black via-shaco-black/80 to-transparent">

            {/* Yüzen (Floating) Ayrık Butonlar */}
            <div className="flex items-end justify-center gap-6 pointer-events-auto w-full max-w-sm px-6">

                {/* Ana Sayfa */}
                <Link to="/" onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { } }}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 active:scale-90 shadow-lg ${isActive('/') ? (isDark ? 'bg-zinc-800 border-white/10 text-shaco-red shadow-[0_4px_15px_rgba(239,68,68,0.2)]' : 'bg-white border-zinc-200 text-shaco-red') : (isDark ? 'bg-zinc-900/90 backdrop-blur-md border border-white/5 text-zinc-500 hover:text-white' : 'bg-white/90 backdrop-blur-md border border-zinc-200/50 text-zinc-500')}`}
                >
                    <Home size={22} className={isActive('/') ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''} />
                    <span className={`text-[9px] font-bold mt-0.5 ${isActive('/') ? 'text-shaco-red' : ''}`}>Ana Sayfa</span>
                </Link>

                {/* QR Öde (Merkez & Büyük) */}
                <Link to="/pay" onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { } }}
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 active:scale-90 shadow-xl border ${isActive('/pay') ? 'bg-shaco-red border-red-500 text-white shadow-[0_0_25px_rgba(239,68,68,0.6)]' : isDark ? 'bg-zinc-800 border-zinc-700/50 text-zinc-200 hover:text-white' : 'bg-zinc-900 border-zinc-800 text-white hover:bg-black'}`}
                >
                    <QrCode size={28} className={isActive('/pay') ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                </Link>

                {/* Menü */}
                <Link to="/menu" onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { } }}
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 active:scale-90 shadow-lg ${isActive('/menu') ? (isDark ? 'bg-zinc-800 border-white/10 text-shaco-red shadow-[0_4px_15px_rgba(239,68,68,0.2)]' : 'bg-white border-zinc-200 text-shaco-red') : (isDark ? 'bg-zinc-900/90 backdrop-blur-md border border-white/5 text-zinc-500 hover:text-white' : 'bg-white/90 backdrop-blur-md border border-zinc-200/50 text-zinc-500')}`}
                >
                    <Coffee size={22} className={isActive('/menu') ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''} />
                    <span className={`text-[9px] font-bold mt-0.5 ${isActive('/menu') ? 'text-shaco-red' : ''}`}>Menü</span>
                </Link>

            </div>
        </div>
    );
}

function NavLink({ to, icon, label, active, isDark }) {
    const handlePress = async () => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { }
    };
    return (
        <Link
            to={to}
            onClick={handlePress}
            className={`flex flex-col items-center gap-1 transition-all duration-300 active:scale-90 ${active
                ? 'text-shaco-red'
                : isDark
                    ? 'text-zinc-500 hover:text-white'
                    : 'text-zinc-400 hover:text-zinc-900'
                }`}
        >
            <div className={`relative transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : ''}`}>
                {icon}
            </div>
            <span className={`text-[11px] font-semibold tracking-wide transition-all duration-300 ${active ? 'text-shaco-red' : ''}`}>
                {label}
            </span>
        </Link>
    );
}
