import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Plus, Check, Minus } from 'lucide-react';
import { useRewards } from '../context/RewardsContext';
import { useExtras } from '../context/ExtrasContext';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const sizes = [
    { key: 'small', label: 'Küçük', ml: '240ml', priceMod: 0 },
    { key: 'medium', label: 'Orta', ml: '360ml', priceMod: 8 },
    { key: 'large', label: 'Büyük', ml: '480ml', priceMod: 15 },
];

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useRewards();
    const { extras } = useExtras();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [selectedExtras, setSelectedExtras] = useState({});
    const [selectedSize, setSelectedSize] = useState('medium');
    const [quantity, setQuantity] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);

    const product = products.find(p => p.id === parseInt(id));

    if (!product) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <p className="font-bold">Ürün bulunamadı</p>
        </div>
    );

    const sizePrice = sizes.find(s => s.key === selectedSize)?.priceMod || 0;
    const extrasPrice = Object.keys(selectedExtras)
        .filter(k => selectedExtras[k])
        .reduce((sum, k) => {
            const extra = extras.find(e => String(e.id) === k);
            return sum + (extra?.price || 0);
        }, 0);
    const totalPrice = (product.price + sizePrice + extrasPrice) * quantity;

    const toggleExtra = (id) => {
        setSelectedExtras(prev => ({ ...prev, [String(id)]: !prev[String(id)] }));
    };

    const handleAddToCart = () => {
        const customizations = [];
        const sizeLabel = sizes.find(s => s.key === selectedSize)?.label;
        customizations.push(`Boy: ${sizeLabel}`);
        Object.keys(selectedExtras).filter(k => selectedExtras[k]).forEach(k => {
            const extra = extras.find(e => String(e.id) === k);
            if (extra) customizations.push(`${extra.label} (+₺${extra.price})`);
        });
        if (quantity > 1) customizations.push(`Adet: ${quantity}`);

        if (addToCart(product, customizations, totalPrice)) {
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 1200);
        }
    };

    const selectedCount = Object.values(selectedExtras).filter(Boolean).length;

    return (
        <div className={`min-h-screen pb-28 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>

            {/* Success Toast */}
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-bold text-sm"
                    >
                        <Check size={16} /> Sepete Eklendi!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Image */}
            <div className="relative h-[45vh] overflow-hidden">
                <motion.img
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black via-black/20 to-black/30' : 'bg-gradient-to-t from-zinc-50 via-transparent to-black/20'}`} />
                <button
                    onClick={() => navigate(-1)}
                    className={`absolute top-6 left-6 p-2.5 rounded-xl backdrop-blur-md border transition active:scale-90 z-20 ${isDark ? 'bg-black/40 border-white/10 text-white' : 'bg-white/70 border-white/50 text-zinc-900'}`}
                >
                    <ArrowLeft size={18} />
                </button>
            </div>

            {/* Content */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className={`relative -mt-10 rounded-t-3xl px-6 pt-6 z-10 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}
            >
                <div className={`w-10 h-1 rounded-full mx-auto mb-5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />

                {/* Product info */}
                <div className="flex justify-between items-start mb-5">
                    <div className="flex-1 min-w-0">
                        <span className="text-shaco-red text-[10px] font-bold tracking-[0.2em] uppercase">
                            {product.category === 'signature' ? 'İMZA' : product.category === 'hot' ? 'SICAK' : product.category === 'cold' ? 'SOĞUK' : product.category?.toUpperCase()}
                        </span>
                        <h1 className={`text-2xl font-bold mt-1 leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h1>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{product.rating}</span>
                            <span className={`text-[10px] ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>•</span>
                            <span className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{product.calories} kcal</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>₺{totalPrice}</span>
                        {(extrasPrice + sizePrice) > 0 && (
                            <p className="text-[10px] text-shaco-red font-bold mt-0.5">+₺{(extrasPrice + sizePrice) * quantity} ekstra</p>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className={`text-[13px] leading-relaxed mb-6 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    {product.description}
                </p>

                {/* Size */}
                {!product.isFood && (
                    <>
                        <SectionLabel label="BOY" isDark={isDark} />
                        <div className="flex gap-2 mb-6">
                            {sizes.map((s) => (
                                <button
                                    key={s.key}
                                    onClick={() => setSelectedSize(s.key)}
                                    className={`flex-1 py-3 rounded-xl text-center transition active:scale-95 ${selectedSize === s.key
                                        ? 'bg-shaco-red text-white'
                                        : isDark
                                            ? 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                                            : 'bg-white border border-zinc-200 text-zinc-600'
                                        }`}
                                >
                                    <p className="text-[12px] font-bold">{s.label}</p>
                                    <p className={`text-[10px] mt-0.5 ${selectedSize === s.key ? 'text-white/70' : isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        {s.ml}{s.priceMod > 0 ? ` +₺${s.priceMod}` : ''}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* Dynamic Extras from Admin */}
                {!product.isFood && extras.length > 0 && (
                    <>
                        <SectionLabel label={`EKSTRALAR${selectedCount > 0 ? ` (${selectedCount})` : ''}`} isDark={isDark} />
                        <div className="space-y-1.5 mb-6">
                            {extras.map((extra) => {
                                const isSelected = selectedExtras[String(extra.id)];
                                return (
                                    <button
                                        key={extra.id}
                                        onClick={() => toggleExtra(extra.id)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition active:scale-[0.98] ${isSelected
                                            ? isDark
                                                ? 'bg-shaco-red/10 border border-shaco-red/30'
                                                : 'bg-red-50 border border-red-200'
                                            : isDark
                                                ? 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'
                                                : 'bg-white border border-zinc-200 hover:border-zinc-300'
                                            }`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected
                                            ? 'bg-shaco-red text-white'
                                            : isDark ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                            {isSelected ? <Check size={13} /> : <Plus size={13} />}
                                        </div>
                                        <span className={`flex-1 text-[12px] font-semibold text-left ${isSelected ? 'text-shaco-red' : isDark ? 'text-zinc-300' : 'text-zinc-700'
                                            }`}>
                                            {extra.label}
                                        </span>
                                        <span className={`text-[11px] font-bold flex-shrink-0 ${isSelected ? 'text-shaco-red' : isDark ? 'text-zinc-600' : 'text-zinc-400'
                                            }`}>
                                            +₺{extra.price}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}

                {!product.isFood && extras.length === 0 && (
                    <div className={`text-center py-4 mb-6 rounded-xl border-dashed border ${isDark ? 'border-zinc-800 text-zinc-700' : 'border-zinc-300 text-zinc-400'}`}>
                        <p className="text-[11px]">Ekstra seçenekler yönetici tarafından eklenmedi</p>
                    </div>
                )}

                {/* Quantity */}
                <SectionLabel label="ADET" isDark={isDark} />
                <div className={`flex items-center justify-between p-3 rounded-xl mb-8 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                    <button
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition active:scale-90 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}
                    >
                        <Minus size={14} />
                    </button>
                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{quantity}</span>
                    <button
                        onClick={() => setQuantity(q => Math.min(10, q + 1))}
                        className="w-9 h-9 rounded-lg bg-shaco-red text-white flex items-center justify-center transition active:scale-90"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </motion.div>

            {/* Sticky Add to Cart - above navbar */}
            <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-[55]`}>
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-black/95 border border-zinc-800' : 'bg-white/95 border border-zinc-200 shadow-lg'} backdrop-blur-xl`}>
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-shaco-red text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 active:scale-[0.97] transition flex items-center justify-center gap-2.5 text-[13px] tracking-wide"
                    >
                        <Plus size={16} />
                        Sepete Ekle • ₺{totalPrice}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SectionLabel({ label, isDark }) {
    return (
        <p className={`text-[10px] font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {label}
        </p>
    );
}
