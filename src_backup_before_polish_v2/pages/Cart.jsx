import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ShoppingBag, CreditCard, Check, Wallet, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import ActiveOrders from '../components/ActiveOrders';

export default function Cart() {
    const { cart, removeFromCart, clearCart, checkoutCart, balance } = useRewards();
    const { theme } = useTheme();
    const { isGuest } = useAuth();
    const navigate = useNavigate();
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const isDark = theme === 'dark';

    const handleCheckout = () => {
        if (isGuest) {
            setShowAuthPrompt(true);
            return;
        }
        const order = checkoutCart();
        if (order) {
            setCheckoutSuccess(true);
            setTimeout(() => {
                navigate('/pay');
            }, 1200);
        }
    };

    if (checkoutSuccess) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                    <Check size={36} className="text-white" />
                </motion.div>
                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                    Siparişiniz Alındı!
                </motion.p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    className={`text-sm mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    QR kodunuzu baristaya gösterin...
                </motion.p>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                    <ShoppingBag size={32} className="opacity-40" />
                </div>
                <h2 className="text-2xl font-bold font-display uppercase mb-2">Sepetin Boş</h2>
                <p className="text-zinc-500 text-center mb-8">Henüz harika kahvelerimizden birini seçmedin.</p>
                <button onClick={() => navigate('/menu')} className="bg-shaco-red text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-red-600 transition">
                    Menüye Git
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 pb-72 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <ActiveOrders className="sticky top-0 z-50 -mx-6 px-6 py-2 mb-4 backdrop-blur-md border-b border-white/5" />
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className={`p-2 rounded-xl transition active:scale-90 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}>
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-display font-bold">Sepet</h1>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ml-auto ${isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>{cart.length} ürün</span>
            </header>

            <div className="space-y-3">
                {cart.map((item, i) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}
                    >
                        <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold font-display text-[14px] truncate">{item.product.name}</h3>
                            <p className={`text-[11px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                {item.customizations.length > 0 ? item.customizations.join(', ') : 'Standart'}
                            </p>
                            <span className="font-bold text-shaco-red text-[13px]">₺{item.totalPrice}</span>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className={`p-2 rounded-lg transition active:scale-90 ${isDark ? 'hover:bg-zinc-800 text-zinc-600' : 'hover:bg-zinc-100 text-zinc-400'}`}>
                            <Trash2 size={16} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Summary Panel - ABOVE navbar */}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[55]">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-zinc-900/95 border border-zinc-800' : 'bg-white/95 border border-zinc-200 shadow-xl'} backdrop-blur-xl`}>
                    {/* Total + Balance Row */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>TOPLAM</p>
                            <p className="text-2xl font-display font-bold">₺{total.toFixed(0)}</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>BAKİYE</p>
                            <div className="flex items-center gap-1.5">
                                <Wallet size={13} className={balance >= total ? 'text-emerald-500' : 'text-red-500'} />
                                <p className={`text-lg font-bold ${balance >= total ? 'text-emerald-500' : 'text-red-500'}`}>₺{balance.toFixed(0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Insufficient balance warning */}
                    {balance < total && (
                        <div className={`flex items-center gap-2 p-2.5 rounded-xl mb-3 ${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-100'}`}>
                            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                            <p className="text-red-500 text-[11px] font-semibold">Yetersiz bakiye.</p>
                            <button onClick={() => navigate('/wallet')} className="ml-auto text-[10px] font-bold text-red-500 underline flex-shrink-0">Yükle</button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2.5">
                        <button onClick={clearCart}
                            className={`p-3.5 rounded-xl border flex items-center justify-center transition active:scale-90 ${isDark ? 'border-zinc-800 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                            <Trash2 size={18} className="text-zinc-500" />
                        </button>
                        <button onClick={handleCheckout} disabled={balance < total && !isGuest}
                            className={`flex-1 py-3.5 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition active:scale-[0.97] ${balance < total && !isGuest
                                ? 'bg-zinc-800 cursor-not-allowed opacity-50 text-zinc-500'
                                : 'bg-shaco-red hover:bg-red-600 shadow-lg shadow-red-500/20 text-white'
                                }`}
                        >
                            <CreditCard size={16} />
                            {isGuest ? 'Sipariş Ver' : balance < total ? 'Yetersiz Bakiye' : 'Ödemeyi Gerçekleştir'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Auth Prompt Modal for Guests */}
            <AnimatePresence>
                {showAuthPrompt && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={() => setShowAuthPrompt(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-xs rounded-3xl p-6 text-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-shaco-red/10 flex items-center justify-center text-shaco-red">
                                <CreditCard size={24} />
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Giriş Gerekli</h3>
                            <p className={`text-sm mb-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Sipariş vermek için giriş yapmanız veya kayıt olmanız gerekiyor.</p>
                            <div className="flex gap-2.5">
                                <button onClick={() => navigate('/login')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                    Giriş Yap
                                </button>
                                <button onClick={() => navigate('/register')}
                                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-shaco-red text-white">
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
