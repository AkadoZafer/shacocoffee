import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const campaigns = [
    {
        id: 1,
        title: "Yeni Sezon",
        subtitle: "Pumpkin Spice Geri Döndü!",
        image: "https://images.unsplash.com/photo-1512568400610-62da28bc8484?q=80&w=1000&auto=format&fit=crop",
        color: "bg-orange-500"
    },
    {
        id: 2,
        title: "3 Al 2 Öde",
        subtitle: "Tüm Soğuk Kahvelerde",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=1000&auto=format&fit=crop",
        color: "bg-blue-500"
    },
    {
        id: 3,
        title: "Sabah Rutini",
        subtitle: "Kahve + Kruvasan 95₺",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop",
        color: "bg-shaco-red"
    }
];

export default function CampaignSlider() {
    const [current, setCurrent] = useState(0);
    const { theme } = useTheme();

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % campaigns.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-48 relative rounded-3xl overflow-hidden mb-8 shadow-2xl group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <img
                        src={campaigns[current].image}
                        alt={campaigns[current].title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 p-6 z-20 w-full bg-gradient-to-t from-black/80 to-transparent">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white mb-2 inline-block ${campaigns[current].color}`}>
                            Kampanya
                        </span>
                        <h2 className="text-2xl font-display font-bold text-white uppercase leading-none mb-1">
                            {campaigns[current].title}
                        </h2>
                        <p className="text-zinc-200 text-sm font-medium">
                            {campaigns[current].subtitle}
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-4 right-6 z-30 flex gap-1.5">
                {campaigns.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === current ? 'w-6 bg-white' : 'w-2 bg-white/40'}`}
                    />
                ))}
            </div>
        </div>
    );
}
