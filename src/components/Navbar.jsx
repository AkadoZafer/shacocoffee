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

    // Staff navbar: Ana Sayfa, Yönetici Panel, Profil
    if (isStaff) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none pb-6 pt-4 bg-gradient-to-t from-shaco-black/80 to-transparent">
                <nav className={`w-full max-w-sm mx-4 backdrop-blur-2xl border rounded-2xl shadow-glass flex items-center justify-between p-2 px-3 relative pointer-events-auto transition-all duration-300 ${theme === 'dark'
                    ? 'bg-zinc-900/80 border-white/5'
                    : 'bg-white/90 border-zinc-200/50'
                    }`}>
                    <NavLink to="/" icon={<Home size={20} />} label="Ana Sayfa" active={isActive('/')} theme={theme} />

                    <NavLink to="/admin" icon={<Shield size={20} />} label="Yönetim" active={isActive('/admin')} theme={theme} />

                    <NavLink to="/settings" icon={<User size={20} />} label="Profil" active={isActive('/settings')} theme={theme} />
                </nav>
            </div>
        );
    }

    // Customer / Guest navbar: Ana Sayfa, Menü, QR/Ödeme, Profil
    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none pb-6 pt-4 bg-gradient-to-t from-shaco-black/80 to-transparent">
            <nav className={`w-full max-w-sm mx-4 backdrop-blur-2xl border rounded-2xl shadow-glass flex items-center justify-between p-2 px-6 relative pointer-events-auto transition-all duration-300 ${theme === 'dark'
                ? 'bg-zinc-900/80 border-white/5'
                : 'bg-white/90 border-zinc-200/50'
                }`}>
                <NavLink to="/" icon={<Home size={24} />} label="Ana Sayfa" active={isActive('/')} theme={theme} />
                <NavLink to="/menu" icon={<Coffee size={24} />} label="Menü" active={isActive('/menu')} theme={theme} />

                <NavLink to="/pay" icon={<QrCode size={24} />} label="QR Öde" active={isActive('/pay')} theme={theme} />

                <NavLink to="/settings" icon={<User size={24} />} label="Hesabım" active={isActive('/settings')} theme={theme} />
            </nav>
        </div>
    );
}

function NavLink({ to, icon, label, active, theme }) {
    const handlePress = async () => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { }
    };
    return (
        <Link
            to={to}
            onClick={handlePress}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 active:scale-90 ${active
                ? 'text-shaco-red'
                : theme === 'dark'
                    ? 'text-zinc-500 hover:text-white'
                    : 'text-zinc-400 hover:text-zinc-900'
                }`}
        >
            <div className={`relative transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' : ''}`}>
                {icon}
            </div>
            <span className={`text-[12px] md:text-[14px] font-bold tracking-wider transition-all duration-300 ${active ? 'text-shaco-red' : ''}`}>
                {label}
            </span>
        </Link>
    );
}
