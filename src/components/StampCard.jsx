import { motion, AnimatePresence } from 'framer-motion';
import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { Gift } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function StampCard() {
    const { stampCount, stampJustEarned, freeRewardAvailable, setFreeRewardAvailable } = useRewards();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useTranslation();

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
                        className={`mb-3 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center gap-3`}
                    >
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Gift size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="text-emerald-500 text-base font-bold">{t('loyalty.reward_title')}</p>
                            <p className={`text-base ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{t('loyalty.reward_desc')}</p>
                        </div>
                        <button
                            onClick={() => setFreeRewardAvailable(false)}
                            className="text-base font-bold text-emerald-500 bg-emerald-500/15 px-3 py-1.5 rounded-lg"
                        >
                            {t('loyalty.redeem')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stamp Card */}
            <div className={`rounded-2xl overflow-hidden relative glass-panel ${isDark ? 'bg-gradient-to-br from-white/5 to-transparent border-white/10 shadow-[0_4px_30px_rgba(239,68,68,0.1)]' : 'bg-white border-zinc-200 shadow-sm'}`}>
                {/* Card Header */}
                <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center p-1 shadow-sm ${isDark ? 'bg-white' : 'bg-zinc-100 border border-zinc-200'}`}>
                            <img src="/images.png" alt="Shaco" className="w-7 h-7 object-contain" />
                        </div>
                        <div>
                            <p className={`text-[15px] font-bold tracking-wide ${isDark ? 'text-white' : 'text-zinc-900'}`}>SHACO COFFEE CO.</p>
                            <p className={`text-[15px] tracking-widest ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('loyalty.title')}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-shaco-red text-[15px] font-bold">{stampCount}/8</span>
                    </div>
                </div>

                {/* Promo Text */}
                <div className="px-5 pb-3">
                    <p className={`text-base leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {t('loyalty.promo')}
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
                                            : isDark
                                                ? 'border-zinc-700/50 bg-zinc-800/30'
                                                : 'border-zinc-200 bg-zinc-50'
                                        }`}
                                >
                                    {isFilled ? (
                                        <motion.div
                                            initial={isNew ? { scale: 0, rotate: -180 } : false}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: 'spring', stiffness: 260, damping: 15 }}
                                            className="w-full h-full flex items-center justify-center"
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center p-0.5 ${isDark ? 'bg-white' : 'bg-zinc-100 border border-zinc-200'}`}>
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
                                            <span className="text-[7px] text-amber-500/60 font-bold">{t('loyalty.gift')}</span>
                                        </div>
                                    ) : (
                                        <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                                    )}

                                    {/* Slot Number */}
                                    <span className={`absolute bottom-0.5 right-1 text-[7px] font-mono ${isFilled ? 'text-shaco-red/40' : isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>
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
