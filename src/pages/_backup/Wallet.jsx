import { CreditCard, Plus, ArrowUpRight } from 'lucide-react';
import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';

export default function Wallet() {
    const { balance, topUpBalance } = useRewards();
    const { theme } = useTheme();

    const handleTopUp = () => {
        const amount = 10;
        topUpBalance(amount);
    };

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <h1 className="text-4xl font-display font-bold mb-8 uppercase tracking-wide">Cüzdan</h1>

            {/* Balance Card - Always Dark */}
            <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl relative overflow-hidden mb-10 group shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-shaco-red/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-shaco-red/15 transition duration-700" />

                <div className="relative z-10">
                    <p className="text-zinc-400 font-display uppercase tracking-widest text-xs mb-2">TOPLAM BAKİYE</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl text-shaco-red font-bold">₺</span>
                        <h2 className="text-6xl font-display font-bold text-white tracking-tighter">{balance.toFixed(2)}</h2>
                    </div>

                    <button
                        onClick={handleTopUp}
                        className="mt-8 w-full bg-white text-black hover:bg-zinc-200 transition p-4 rounded-xl font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 duration-200"
                    >
                        Bakiye Yükle <ArrowUpRight size={20} />
                    </button>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-zinc-500 font-display uppercase tracking-widest text-sm">Kartlarım</h3>
                <button className="text-shaco-red hover:text-red-400 transition" aria-label="Add Card">
                    <Plus size={24} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Visa Card (Premium Gradient) */}
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 p-6 rounded-2xl flex items-center gap-5 hover:border-shaco-red/50 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden">

                    {/* Background Shine */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                    {/* Chip / Brand */}
                    <div className="w-12 h-8 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded flex items-center justify-center text-black font-bold italic text-[10px] border border-yellow-600 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20" />
                        CHIP
                    </div>

                    <div className="flex-1 relative z-10">
                        <p className="font-display font-bold text-white tracking-widest text-lg drop-shadow-md">•••• 4242</p>
                        <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase mt-1">Expiry 12/28</p>
                    </div>

                    {/* Status Light */}
                    <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                </div>

                {/* Mastercard (Dark + Red Accent) */}
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-6 rounded-2xl flex items-center gap-5 hover:border-red-500/30 transition-all duration-300 cursor-pointer group opacity-70 hover:opacity-100 shadow-md hover:shadow-xl">
                    <div className="w-12 h-8 bg-zinc-800 rounded flex items-center justify-center text-white font-bold italic text-xs border border-zinc-700">
                        MC
                    </div>
                    <div className="flex-1">
                        <p className="font-display font-bold text-zinc-300 group-hover:text-white transition tracking-widest text-lg">•••• 8831</p>
                        <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-1">Expiry 09/25</p>
                    </div>
                    <div className="w-3 h-3 rounded-full border border-zinc-600 group-hover:border-shaco-red group-hover:bg-shaco-red transition" />
                </div>
            </div>
        </div>
    );
}
