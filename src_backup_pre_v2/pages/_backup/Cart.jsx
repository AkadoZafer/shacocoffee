import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Plus, Minus, ShoppingBag, CreditCard } from 'lucide-react';

export default function Cart() {
    const { cart, removeFromCart, clearCart, checkoutCart, balance } = useRewards();
    const { theme } = useTheme();
    const navigate = useNavigate();

    const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

    const handleCheckout = () => {
        if (checkoutCart()) {
            // Success logic is handled in context (alerts aren't great but works for now)
            alert("Siparişiniz alındı! Afiyet olsun.");
            navigate('/');
        } else {
            alert("Bakiye yetersiz! Lütfen Cüzdan'dan bakiye yükleyin.");
        }
    };

    if (cart.length === 0) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                    <ShoppingBag size={32} className="opacity-40" />
                </div>
                <h2 className="text-2xl font-bold font-display uppercase mb-2">Sepetin Boş</h2>
                <p className="text-zinc-500 text-center mb-8">Henüz harika kahvelerimizden birini seçmedin.</p>
                <button
                    onClick={() => navigate('/menu')}
                    className="bg-shaco-red text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-red-600 transition"
                >
                    Menüye Git
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className={`p-2 rounded-full transition ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-zinc-100 shadow-sm'}`}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-3xl font-display font-bold uppercase">Sepet</h1>
            </header>

            <div className="space-y-4">
                {cart.map((item) => (
                    <div
                        key={item.id}
                        className={`p-4 rounded-2xl border flex items-center gap-4 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}
                    >
                        <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />

                        <div className="flex-1">
                            <h3 className="font-bold font-display">{item.product.name}</h3>
                            <p className="text-base text-zinc-500 mb-1">
                                {item.customizations.length > 0 ? item.customizations.join(', ') : 'Standart'}
                            </p>
                            <span className="font-bold text-shaco-red">₺{item.totalPrice}</span>
                        </div>

                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 transition"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Summary Panel */}
            <div className={`fixed bottom-0 left-0 w-full p-6 pb-8 border-t rounded-t-3xl z-20 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]'}`}>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-zinc-500 font-bold uppercase tracking-widest text-base">Toplam Tutar</span>
                    <span className="text-3xl font-display font-bold">₺{total.toFixed(2)}</span>
                </div>

                <div className="flex gap-4 mb-6">
                    <div className={`flex-1 p-3 rounded-xl border flex flex-col justify-center ${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                        <span className="text-base text-zinc-500 uppercase tracking-wider mb-1">Cüzdan</span>
                        <span className={`font-bold ${balance < total ? 'text-red-500' : 'text-green-500'}`}>₺{balance.toFixed(2)}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={clearCart}
                        className={`p-4 rounded-xl border flex items-center justify-center transition ${theme === 'dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-300 hover:bg-zinc-100'}`}
                    >
                        <Trash2 size={20} className="text-zinc-500" />
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={balance < total}
                        className={`flex-1 py-4 rounded-xl font-bold font-display uppercase tracking-widest flex items-center justify-center gap-2 transition ${balance < total
                            ? 'bg-zinc-700 cursor-not-allowed opacity-50'
                            : 'bg-shaco-red hover:bg-red-600 shadow-lg shadow-red-500/30'
                            } text-white`}
                    >
                        {balance < total ? 'Yetersiz Bakiye' : 'Siparişi Onayla'} <CreditCard size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
