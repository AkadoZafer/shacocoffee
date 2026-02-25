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
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full flex justify-center pointer-events-none pb-6 pt-10 bg-gradient-to-t from-shaco-black via-shaco-black/80 to-transparent">
            {/* Ortadaki QR Butonu */}
            <div className="absolute bottom-[2.2rem] left-1/2 -translate-x-1/2 z-10 pointer-events-auto">
                <Link
                    to="/pay"
                    onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { } }}
                    className={`flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 active:scale-90 shadow-glass ${isActive('/pay') ? 'bg-shaco-red text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]' : isDark ? 'bg-zinc-800 text-zinc-300 hover:text-white border border-white/10' : 'bg-white text-zinc-700 hover:text-zinc-900 border border-zinc-200'}`}
                >
                    <QrCode size={26} className={isActive('/pay') ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                </Link>
            </div>

            <nav className={`w-full max-w-sm mx-4 backdrop-blur-3xl border rounded-2xl flex items-center justify-between p-2 px-6 relative pointer-events-auto transition-all duration-300 ${isDark
                ? 'bg-zinc-900/90 border-white/5 shadow-glass'
                : 'bg-white/95 border-zinc-200/50 shadow-md'
                }`}>

                {/* Sol Taraf: Ana Sayfa */}
                <div className="flex justify-start w-[40%] pl-2">
                    <NavLink to="/" icon={<Home size={22} />} label="Ana Sayfa" active={isActive('/')} isDark={isDark} />
                </div>

                {/* Sağ Taraf: Menü */}
                <div className="flex justify-end w-[40%] pr-2">
                    <NavLink to="/menu" icon={<Coffee size={22} />} label="Menü" active={isActive('/menu')} isDark={isDark} />
                </div>
            </nav>
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
            <span className={`text-[12px] md:text-[14px] font-bold tracking-wider transition-all duration-300 ${active ? 'text-shaco-red' : ''}`}>
                {label}
            </span>
        </Link>
    );
}
