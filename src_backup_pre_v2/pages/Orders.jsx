import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Coffee, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Orders() {
    const { orders } = useRewards();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const isDark = theme === 'dark';

    return (
        <div className={`min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className={`p-2 rounded-xl transition active:scale-90 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}>
                    <ArrowLeft size={18} />
                </button>
                <h1 className="text-xl font-display font-bold">Sipariş Geçmişi</h1>
            </header>

            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Coffee size={48} className="mb-4" />
                    <p>Henüz siparişiniz yok.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order, i) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`p-4 rounded-2xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'}`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold">{order.code}</h3>
                                        <span className={`text-base px-2 py-0.5 rounded-md font-bold uppercase ${order.status === 'Onaylandı' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <p className={`text-base ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{new Date(order.date || order.timestamp).toLocaleString('tr-TR')}</p>
                                </div>
                                <p className="font-bold text-lg text-shaco-red">₺{order.total}</p>
                            </div>

                            <div className={`space-y-2 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-base">
                                        <span>{item.name} <span className="text-zinc-500 text-base">x{item.quantity}</span></span>
                                        <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>
                                            {item.customizations?.length > 0 ? item.customizations.join(', ') : 'Standart'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
