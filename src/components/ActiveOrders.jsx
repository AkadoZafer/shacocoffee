import { useRewards } from '../context/RewardsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ActiveOrders({ className }) {
    const { orders, cancelOrder } = useRewards();

    if (orders.length === 0) return null;

    return (
        <div className={`z-40 pointer-events-none ${className || "fixed bottom-24 left-0 right-0 px-6"}`}>
            <div className="pointer-events-auto space-y-3">
                <AnimatePresence>
                    {orders.map((order) => (
                        <motion.div
                            key={order.id}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="glass-dark p-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                        >
                            {/* Status Bar */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${order.status === 'Onaylandı' ? 'bg-green-500' : 'bg-shaco-red animate-pulse'}`} />

                            <div className="flex justify-between items-center pl-3">
                                <div>
                                    <h4 className="font-display font-bold text-white text-lg leading-none">
                                        {order.items?.[0]?.name || 'Sipariş'}{order.items?.length > 1 ? ` +${order.items.length - 1}` : ''}
                                    </h4>
                                    <p className="text-zinc-400 text-base mt-1">
                                        {order.code} • ₺{order.total}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-base font-bold uppercase tracking-wider flex items-center gap-1 ${order.status === 'Onaylandı' ? 'text-green-500' : 'text-shaco-red'}`}>
                                        {order.status === 'Onaylandı' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                        {order.status === 'Onaylandı' ? 'Hazır' : 'Hazırlanıyor'}
                                    </span>
                                </div>
                            </div>

                            {/* Cancel Button (Only if Preparing) */}
                            {order.status === 'Bekliyor' && (
                                <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={() => cancelOrder(order.id)}
                                        className="text-base text-zinc-500 hover:text-red-500 flex items-center gap-1 transition"
                                    >
                                        <XCircle size={14} /> İptal & İade
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
