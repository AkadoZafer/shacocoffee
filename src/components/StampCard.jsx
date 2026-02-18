import { motion, AnimatePresence } from 'framer-motion';
import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { Gift } from 'lucide-react';

export default function StampCard() {
    const { stampCount, stampJustEarned, freeRewardAvailable, setFreeRewardAvailable } = useRewards();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const totalSlots = 8;

    return (
        <div className="relative">
            {/* Free Reward Banner */}
            <AnimatePresence>
                {freeRewardAvailable && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center gap-3"
                    >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Gift size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-emerald-400 text-[12px] font-bold">Tebrikler! 🎉</p>
                            <p className={`text-[10px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Küçük boy 1 içecek hediyeniz var!</p>
                        </div>
                        <button
                            onClick={() => setFreeRewardAvailable(false)}
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1.5 rounded-lg"
                        >
                            Kullan
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stamp Card */}
            <div className={`rounded-2xl overflow-hidden relative ${isDark ? 'bg-zinc-950 border border-zinc-800' : 'bg-zinc-900 border border-zinc-800'}`}>
                {/* Card Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-1 shadow-sm">
                            <img src="/images.png" alt="Shaco" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                            <p className="text-white text-[13px] font-bold tracking-wide">SHACO COFFEE CO.</p>
                            <p className="text-zinc-500 text-[9px] tracking-widest">SADAKAT KARTI</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-shaco-red text-[11px] font-bold">{stampCount}/8</span>
                    </div>
                </div>

                {/* Promo Text */}
                <div className="px-5 pb-3">
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                        <span className="text-white font-bold">8 İçecek</span> Alana{' '}
                        <span className="text-shaco-red font-bold">Küçük Boy 1 İçecek Bizden Hediye!</span>
                    </p>
                </div>

                {/* Stamp Grid: 2 rows x 4 columns */}
                <div className="px-5 pb-5">
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: totalSlots }).map((_, i) => {
                            const isFilled = i < stampCount;
                            const isNew = stampJustEarned && i === stampCount - 1;
                            const isLast = i === totalSlots - 1;

                            return (
                                <div
                                    key={i}
                                    className={`relative aspect-square rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${isFilled
                                        ? 'border-shaco-red/50 bg-shaco-red/10'
                                        : isLast
                                            ? 'border-dashed border-amber-500/30 bg-amber-500/5'
                                            : 'border-zinc-700/50 bg-zinc-800/30'
                                        }`}
                                >
                                    {isFilled ? (
                                        <motion.div
                                            initial={isNew ? { scale: 0, rotate: -180 } : false}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                                            className="w-full h-full flex items-center justify-center"
                                        >
                                            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center p-0.5">
                                                <img
                                                    src="/images.png"
                                                    alt="stamp"
                                                    className="w-7 h-7 object-contain"
                                                />
                                            </div>
                                        </motion.div>
                                    ) : isLast ? (
                                        <div className="flex flex-col items-center gap-0.5">
                                            <Gift size={16} className="text-amber-500/60" />
                                            <span className="text-[7px] text-amber-500/60 font-bold">HEDİYE</span>
                                        </div>
                                    ) : (
                                        <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-700'}`} />
                                    )}

                                    {/* Slot Number */}
                                    <span className={`absolute bottom-0.5 right-1 text-[7px] font-mono ${isFilled ? 'text-shaco-red/40' : 'text-zinc-700'}`}>
                                        {i + 1}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom shimmer effect */}
                <div className="h-1 bg-gradient-to-r from-transparent via-shaco-red/30 to-transparent" />
            </div>
        </div>
    );
}
