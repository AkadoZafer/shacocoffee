import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Star, Heart, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const slides = [
    {
        id: 1,
        title: "Sıra Bekleme",
        description: "En sevdiğin kahveyi yoldayken sipariş et, sen geldiğinde hazır olsun.",
        icon: Coffee,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
    },
    {
        id: 2,
        title: "Yıldızları Topla",
        description: "Her kahvede bir yıldız kazan. 15 yıldızda 1 kahve bizden hediye!",
        icon: Star,
        color: "text-yellow-500",
        bg: "bg-yellow-500/10"
    },
    {
        id: 3,
        title: "Kendi Deneyimini Yarat",
        description: "Favori ürünlerini kaydet, sana özel kampanyalardan ilk sen haberdar ol.",
        icon: Heart,
        color: "text-shaco-red",
        bg: "bg-red-500/10"
    }
];

export default function Onboarding({ onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const nextSlide = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onComplete();
        }
    };

    const skip = () => onComplete();

    const slide = slides[currentIndex];
    const Icon = slide.icon;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col justify-between ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <div className="flex justify-end p-6 pt-10">
                <button onClick={skip} className={`text-sm font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    ATLA
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.1, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full flex flex-col items-center"
                    >
                        <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center mb-10 ${slide.bg} glass-liquid`}>
                            <Icon size={64} className={slide.color} />
                        </div>
                        <h2 className="text-3xl font-serif font-black mb-4 tracking-tight drop-shadow-sm">{slide.title}</h2>
                        <p className={`text-lg leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            {slide.description}
                        </p>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="p-8 pb-12">
                <div className="flex justify-center gap-2 mb-8">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-shaco-red' : `w-2 flex-1 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`}`}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    className="w-full py-4 rounded-2xl bg-shaco-red text-white font-bold text-lg shadow-neon-red active:scale-95 transition-all flex justify-center items-center gap-2"
                >
                    {currentIndex === slides.length - 1 ? 'Hemen Başla' : 'İleri'}
                    {currentIndex === slides.length - 1 ? null : <ChevronRight size={20} />}
                </button>
            </div>
        </div>
    );
}
