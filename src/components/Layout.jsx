import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ActiveOrders from './ActiveOrders';
import { useTheme } from '../context/ThemeContext';
import { Coffee } from 'lucide-react';

export default function Layout() {
    const { theme } = useTheme();
    const location = useLocation();

    return (
        <div className={`min-h-screen font-display flex justify-center selection:bg-shaco-red selection:text-white transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <div className={`w-full max-w-md min-h-screen relative flex flex-col border-x shadow-2xl overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-black border-zinc-900' : 'bg-zinc-50 border-zinc-200'}`}>

                {/* Ambient Background Glow */}
                <div className={`absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-50'}`} />

                <main className="flex-1 overflow-y-auto pb-32 scrollbar-hide relative z-10">
                    <Outlet />
                </main>


                <Navbar />
            </div>
        </div>
    );
}
