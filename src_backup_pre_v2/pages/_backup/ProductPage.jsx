import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Flame, Droplet, Beaker, Plus, Minus, Zap, Check } from 'lucide-react';
import { useRewards } from '../context/RewardsContext';
import { useState } from 'react';
import CoffeeBuilder from '../components/CoffeeBuilder';
import { useTheme } from '../context/ThemeContext';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useRewards(); // Moved to top level
    const [isBrewing, setIsBrewing] = useState(false);

    // Customization State
    const [extras, setExtras] = useState({
        shot: false,
        syrup: false,
        soft: false
    });

    const product = products.find(p => p.id === parseInt(id));

    const { theme } = useTheme();

    if (!product) return <div className="text-white p-10">Ürün bulunamadı</div>;

    // Price Calculation
    const basePrice = product.price;
    const modifiers = (extras.shot ? 15 : 0) + (extras.syrup ? 10 : 0);
    const totalPrice = basePrice + modifiers;

    const [showSuccess, setShowSuccess] = useState(false);

    const toggleExtra = (key) => {
        setExtras(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleAddToCart = () => {
        const customizations = [];
        if (extras.shot) customizations.push("Ekstra Shot (+15₺)");
        if (extras.syrup) customizations.push("Şurup (+10₺)");
        if (extras.soft) customizations.push("Yumuşak İçim");

        if (addToCart(product, customizations, totalPrice)) {
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
            }, 1000);
        }
    };

    return (
        <div className={`min-h-screen relative pb-24 transition-colors duration-300 ${theme === 'dark' ? 'bg-black' : 'bg-zinc-50'}`}>
            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="fixed top-10 left-1/2 -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold"
                    >
                        <Check size={20} />
                        Sepete Eklendi!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Section / Brewing Animation */}
            <div className={`h-[55vh] relative overflow-hidden ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
                {/* ... existing hero code ... */}
                <AnimatePresence mode="wait">
                    {!isBrewing ? (
                        <motion.img
                            key="image"
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <motion.div
                            key="builder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`w-full h-full flex items-center justify-center ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100'}`}
                        >
                            <CoffeeBuilder
                                ingredients={product.ingredients}
                                onComplete={() => setIsBrewing(false)}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className={`absolute inset-0 bg-gradient-to-t pointer-events-none ${theme === 'dark' ? 'from-black via-transparent to-black/30' : 'from-zinc-50 via-transparent to-black/10'}`} />

                <button onClick={() => navigate(-1)} className="absolute top-6 left-6 bg-white/20 dark:bg-black/50 p-3 rounded-full backdrop-blur-md text-white border border-white/20 dark:border-white/10 hover:bg-white/30 dark:hover:bg-black/80 transition z-50">
                    <ArrowLeft size={24} />
                </button>

                {/* Brew Toggle Button */}
                {!isBrewing && (
                    <button
                        onClick={() => setIsBrewing(true)}
                        className="absolute top-6 right-6 bg-shaco-red/90 p-3 rounded-full backdrop-blur-md text-white border border-red-500/50 shadow-[0_0_15px_red] hover:scale-110 transition z-50 group"
                    >
                        <Beaker size={24} className="group-hover:animate-pulse" />
                    </button>
                )}
            </div>

            {/* Content Sheet */}
            <motion.div
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`relative -mt-16 rounded-t-[3rem] p-8 border-t min-h-[50vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-10 ${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-white border-white'}`}
            >
                <div className={`w-12 h-1 rounded-full mx-auto mb-8 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'}`} />

                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-shaco-red font-bold uppercase tracking-widest text-base">{product.category === 'Signature' ? 'İmza' : product.category}</span>
                        <h1 className={`text-4xl font-display font-bold leading-none mt-2 mb-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h1>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={14} fill="currentColor" />
                            <span className="text-base font-bold ml-1">{product.rating}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className={`text-3xl font-bold tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>₺{totalPrice}</span>
                        {modifiers > 0 && <span className="text-base text-zinc-500">+₺{modifiers} ekstra</span>}
                    </div>
                </div>

                {/* Customization Options */}
                <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Siparişi Özelleştir</h3>
                <div className="grid grid-cols-3 gap-3 mb-8">
                    <button
                        onClick={() => toggleExtra('shot')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition ${extras.shot
                            ? 'bg-shaco-red border-shaco-red text-white'
                            : (theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300')
                            }`}
                    >
                        <Zap size={20} />
                        <span className="text-base font-bold uppercase text-center">Ekstra Shot<br />+15₺</span>
                    </button>
                    <button
                        onClick={() => toggleExtra('syrup')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition ${extras.syrup
                            ? 'bg-shaco-red border-shaco-red text-white'
                            : (theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300')
                            }`}
                    >
                        <Droplet size={20} />
                        <span className="text-base font-bold uppercase text-center">Şeker/Şurup<br />+10₺</span>
                    </button>
                    <button
                        onClick={() => toggleExtra('soft')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition ${extras.soft
                            ? 'bg-zinc-800 border-white text-white'
                            : (theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:border-zinc-300')
                            }`}
                    >
                        <div className="w-5 h-5 rounded-full border-2 border-current opacity-60" />
                        <span className="text-base font-bold uppercase text-center">Yumuşak İçim<br />Ücretsiz</span>
                    </button>
                </div>

                <p className={`text-base leading-relaxed mb-8 ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {product.description}
                </p>

                {/* Gallery Container Placeholder */}
                <div className="mb-10">
                    <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        Kullanıcı Galerisi
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-24 h-24 rounded-xl border flex-shrink-0 flex items-center justify-center transition cursor-pointer ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-700 hover:border-shaco-red' : 'bg-zinc-100 border-zinc-200 text-zinc-400 hover:border-shaco-red'}`}>
                                <span className="text-base">IMG_0{i}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    className="w-full bg-shaco-red text-white font-bold font-display uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition active:scale-95 flex items-center justify-center gap-3"
                >
                    <Plus size={20} />
                    Sepete Ekle • ₺{totalPrice}
                </button>
            </motion.div>
        </div>
    );
}
