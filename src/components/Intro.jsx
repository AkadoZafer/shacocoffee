import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Intro({ onComplete }) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 300);
        const t2 = setTimeout(() => setPhase(2), 1800);
        const t3 = setTimeout(() => setPhase(3), 2600);
        const t4 = setTimeout(() => onComplete(), 3800);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }, [onComplete]);

    return (
        <motion.div
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="relative flex flex-col items-center">

                {/* Animated spinning ring 1 */}
                <motion.svg
                    className="absolute w-56 h-56"
                    viewBox="0 0 100 100"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={phase >= 1 ? {
                        opacity: phase >= 2 ? [1, 0] : 1,
                        scale: 1,
                        rotate: 360
                    } : {}}
                    transition={{
                        rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 0.6, ease: "backOut" },
                        opacity: { duration: 0.4 }
                    }}
                >
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="80 70.8" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="48" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="80 70.8" strokeDashoffset="-150.8" strokeLinecap="round" />
                </motion.svg>

                {/* Animated spinning ring 2 - opposite direction */}
                <motion.svg
                    className="absolute w-64 h-64"
                    viewBox="0 0 100 100"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={phase >= 1 ? {
                        opacity: phase >= 2 ? [0.6, 0] : 0.6,
                        scale: 1,
                        rotate: -360
                    } : {}}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 0.8, ease: "backOut" },
                        opacity: { duration: 0.4 }
                    }}
                >
                    <circle cx="50" cy="50" r="49" fill="none" stroke="#ef4444" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="80 73.9" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="49" fill="none" stroke="#ef4444" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="80 73.9" strokeDashoffset="-153.9" strokeLinecap="round" />
                </motion.svg>

                {/* Breathing ambient glow */}
                <motion.div
                    className="absolute w-72 h-72 bg-red-600/10 blur-[100px] rounded-full"
                    initial={{ scale: 0 }}
                    animate={phase >= 2 ? { scale: [0.6, 1.2, 1], opacity: [0, 0.8, 0.4] } : {}}
                    transition={{ duration: 1.5 }}
                />

                {/* Logo - smooth scale up from center */}
                <motion.div
                    className="mb-8 relative z-10"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={phase >= 2 ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.8, type: "spring", damping: 15, stiffness: 100 }}
                >
                    <div className="relative">
                        <motion.div
                            className="absolute inset-[-6px] rounded-full border border-red-600/30"
                            initial={{ opacity: 0 }}
                            animate={phase >= 2 ? { opacity: [0, 1, 0.5] } : {}}
                            transition={{ delay: 0.3, duration: 1 }}
                        />
                        <img
                            src="/images.png"
                            alt="Shaco Coffee Logo"
                            className="w-44 h-44 object-cover rounded-full shadow-[0_0_40px_rgba(220,38,38,0.25)]"
                        />
                    </div>
                </motion.div>

                {/* Text letters slide up one by one */}
                <div className="relative z-10 flex overflow-hidden mb-2">
                    {"SHACO".split("").map((letter, i) => (
                        <motion.span
                            key={i}
                            className="text-5xl font-display font-black text-white tracking-[0.15em]"
                            initial={{ y: 60, opacity: 0 }}
                            animate={phase >= 3 ? { y: 0, opacity: 1 } : {}}
                            transition={{ delay: i * 0.07, duration: 0.35, ease: "backOut" }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* COFFEE CO. with growing lines */}
                <motion.div
                    className="relative z-10 flex items-center gap-3 mt-1"
                    initial={{ opacity: 0 }}
                    animate={phase >= 3 ? { opacity: 1 } : {}}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <motion.div
                        className="h-[1px] bg-gradient-to-r from-transparent to-red-600"
                        initial={{ width: 0 }}
                        animate={phase >= 3 ? { width: 40 } : {}}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    />
                    <span className="text-base font-light text-zinc-500 tracking-[0.4em]">
                        COFFEE CO.
                    </span>
                    <motion.div
                        className="h-[1px] bg-gradient-to-l from-transparent to-red-600"
                        initial={{ width: 0 }}
                        animate={phase >= 3 ? { width: 40 } : {}}
                        transition={{ delay: 0.5, duration: 0.4 }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
}
