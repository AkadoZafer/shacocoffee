import { Link, useLocation } from 'react-router-dom';
import { Home, Coffee, CreditCard, Wallet, Settings, MapPin } from 'lucide-react';

export default function Navbar() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <nav className="bg-white/80 dark:bg-black/90 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-full shadow-2xl flex items-center p-2 px-6 gap-6 relative">
                <NavLink to="/" icon={<Home size={20} />} active={isActive('/')} />
                <NavLink to="/menu" icon={<Coffee size={20} />} active={isActive('/menu')} />
                <NavLink to="/stores" icon={<MapPin size={20} />} active={isActive('/stores')} />
                <NavLink to="/pay" icon={<CreditCard size={20} />} active={isActive('/pay')} />
                <NavLink to="/wallet" icon={<Wallet size={20} />} active={isActive('/wallet')} />
                <NavLink to="/settings" icon={<Settings size={20} />} active={isActive('/settings')} />
            </nav>
        </div>
    );
}

function NavLink({ to, icon, active }) {
    return (
        <Link to={to} className={`transition-all duration-300 ${active ? 'text-shaco-red scale-125' : 'text-zinc-600 dark:text-zinc-500 hover:text-black dark:hover:text-white'}`}>
            <div className={`relative ${active ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : ''}`}>
                {icon}
            </div>
        </Link>
    );
}
