import { CreditCard, Plus, ArrowUpRight, Zap, Check, Wallet as WalletIcon } from 'lucide-react';
import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const quickAmounts = [25, 50, 100, 200, 500];

export default function Wallet() {
    const { balance, topUpBalance } = useRewards();
    const { theme } = useTheme();
    const { isGuest } = useAuth();
    const navigate = useNavigate();
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const { addToast } = useToast();
    const isDark = theme === 'dark';

    const handleTopUp = () => {
        if (isGuest) {
            setShowAuthPrompt(true);
            return;
        }
        const amount = selectedAmount || parseInt(customAmount);
        if (!amount || amount <= 0) return;

        topUpBalance(amount);
        addToast(`+₺${amount} başarıyla yüklendi!`, 'success');
        setSelectedAmount(null);
        setCustomAmount('');
    };

    const activeAmount = selectedAmount || parseInt(customAmount) || 0;

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>


            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-xl transition active:scale-90 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </button>
                    <h1 className="text-xl font-display font-bold">Cüzdan</h1>
                </div>
            </div>

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 p-6 rounded-3xl relative overflow-hidden mb-8 shadow-xl"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-shaco-red/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-shaco-red/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <WalletIcon size={14} className="text-zinc-500" />
                        <p className="text-zinc-500 text-base font-bold tracking-[0.2em]">TOPLAM BAKİYE</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl text-shaco-red font-bold">₺</span>
                        <h2 className="text-5xl font-display font-bold text-white tracking-tighter">{balance.toFixed(0)}</h2>
                        <span className="text-lg text-zinc-600 font-bold">.{(balance % 1).toFixed(2).slice(2)}</span>
                    </div>

                    {/* Shaco Brand */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className="w-1 h-1 rounded-full bg-shaco-red" />
                        <span className="text-[15px] text-zinc-600 font-bold tracking-[0.2em]">SHACO COFFEE</span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Top-Up Section */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={13} className="text-amber-500" />
                    <p className={`text-base font-bold tracking-[0.15em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>HIZLI YÜKLE</p>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-4">
                    {quickAmounts.map((amount) => (
                        <button
                            key={amount}
                            onClick={() => { setSelectedAmount(amount); setCustomAmount(''); }}
                            className={`py-3 rounded-xl text-center transition active:scale-95 ${selectedAmount === amount
                                ? 'bg-shaco-red text-white shadow-lg shadow-red-500/20'
                                : isDark
                                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                    : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 shadow-sm'
                                }`}
                        >
                            <p className="text-[15px] font-bold">₺{amount}</p>
                        </button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}>
                    <span className={`text-lg font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>₺</span>
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                        placeholder="Özel tutar girin"
                        className={`flex-1 bg-transparent outline-none text-base font-display ${isDark ? 'text-white placeholder:text-zinc-700' : 'text-zinc-900 placeholder:text-zinc-400'}`}
                    />
                </div>

                {/* Load Button */}
                <button
                    onClick={handleTopUp}
                    disabled={activeAmount <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition active:scale-[0.97] ${activeAmount > 0
                        ? 'bg-shaco-red text-white shadow-lg shadow-red-500/20'
                        : isDark ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        }`}
                >
                    <ArrowUpRight size={16} />
                    {activeAmount > 0 ? `₺${activeAmount} Yükle` : 'Tutar Seçin'}
                </button>
            </motion.div>

            {/* Payment Methods */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <CreditCard size={13} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
                        <h3 className={`text-base font-bold tracking-[0.15em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>KARTLARIM</h3>
                    </div>
                    <button className="text-shaco-red hover:text-red-400 transition p-1">
                        <Plus size={18} />
                    </button>
                </div>

                <div className="space-y-2.5">
                    {/* Visa Card */}
                    <div className={`p-4 rounded-2xl flex items-center gap-4 transition active:scale-[0.98] cursor-pointer ${isDark ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700' : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md'}`}>
                        <div className="w-10 h-7 bg-gradient-to-br from-yellow-200 to-yellow-500 rounded flex items-center justify-center text-black font-bold italic text-[8px] border border-yellow-600 relative overflow-hidden flex-shrink-0">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-20" />
                            CHIP
                        </div>
                        <div className="flex-1">
                            <p className={`font-display font-bold tracking-widest text-[14px] ${isDark ? 'text-white' : 'text-zinc-900'}`}>•••• 4242</p>
                            <p className={`text-[15px] font-mono tracking-widest mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Visa • 12/28</p>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                    </div>

                    {/* Mastercard */}
                    <div className={`p-4 rounded-2xl flex items-center gap-4 transition active:scale-[0.98] cursor-pointer ${isDark ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700 opacity-60 hover:opacity-100' : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md opacity-70 hover:opacity-100'}`}>
                        <div className={`w-10 h-7 rounded flex items-center justify-center font-bold italic text-[15px] flex-shrink-0 ${isDark ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                            MC
                        </div>
                        <div className="flex-1">
                            <p className={`font-display font-bold tracking-widest text-[14px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>•••• 8831</p>
                            <p className={`text-[15px] font-mono tracking-widest mt-0.5 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>Mastercard • 09/25</p>
                        </div>
                        <div className={`w-2.5 h-2.5 rounded-full border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`} />
                    </div>
                </div>
            </motion.div>

            {/* Auth Prompt Modal for Guests */}
            <AnimatePresence>
                {showAuthPrompt && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={() => setShowAuthPrompt(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-xs rounded-3xl p-6 text-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <WalletIcon size={24} />
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Üyelik Gerekli</h3>
                            <p className={`text-base mb-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Bakiye yüklemek için giriş yapmanız veya kayıt olmanız gerekiyor.</p>
                            <div className="flex gap-2.5">
                                <button onClick={() => navigate('/login')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-base transition ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                    Giriş Yap
                                </button>
                                <button onClick={() => navigate('/register')}
                                    className="flex-1 py-3 rounded-xl font-bold text-base bg-shaco-red text-white">
                                    Kayıt Ol
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
