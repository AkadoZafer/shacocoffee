import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
    const { theme } = useTheme();
    const location = useLocation();

    return (
        <div className={`min-h-screen font-display flex justify-center selection:bg-shaco-red selection:text-white transition-colors duration-300 ${theme === 'dark' ? 'bg-shaco-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <div className={`w-full max-w-md min-h-screen relative flex flex-col border-x shadow-2xl overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-shaco-black border-zinc-900/50' : 'bg-zinc-50 border-zinc-200'}`}>

                {/* Ambient Background Glow */}
                <div className={`absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-50'}`} />

                <main className={location.pathname.startsWith('/product/') ? 'flex-1 overflow-hidden relative z-10' : 'flex-1 overflow-y-auto pb-20 scrollbar-hide relative z-10'}>
                    <Outlet />
                </main>


                <Navbar />
            </div>
        </div>
    );
}
