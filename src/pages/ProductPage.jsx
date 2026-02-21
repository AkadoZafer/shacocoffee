import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Wheat } from 'lucide-react';
import LazyImage from '../components/LazyImage';
import { useTheme } from '../context/ThemeContext';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const product = products.find(p => p.id === parseInt(id));

    if (!product) return (
        <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <p className="font-bold">Ürün bulunamadı</p>
        </div>
    );

    return (
        <div className={`min-h-screen pb-28 transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>

            {/* Hero Image */}
            <div className="relative h-[45vh] overflow-hidden">
                <LazyImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full"
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
                className={`relative -mt-10 rounded-t-3xl px-6 pt-6 z-10 min-h-[55vh] ${isDark ? 'bg-black' : 'bg-zinc-50'}`}
            >
                <div className={`w-10 h-1 rounded-full mx-auto mb-5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`} />

                {/* Product info */}
                <div className="flex justify-between items-start mb-5">
                    <div className="flex-1 min-w-0">
                        <span className="text-shaco-red text-base font-bold tracking-[0.2em] uppercase">
                            {product.category === 'signature' ? 'İMZA' : product.category === 'hot' ? 'SICAK' : product.category === 'cold' ? 'SOĞUK' : product.category?.toUpperCase()}
                        </span>
                        <h1 className={`text-2xl font-bold mt-1 leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h1>
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className={`text-base font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{product.rating}</span>
                            <span className={`text-base ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>•</span>
                            <span className={`text-base ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{product.calories} kcal</span>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                        <span className={`text-2xl font-bold inline-block ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            ₺{product.price}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <p className={`text-[14px] leading-relaxed mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {product.description}
                </p>

                {/* Ingredients and Allergens */}
                <div className="mb-6">
                    <SectionLabel label="İÇİNDEKİLER" isDark={isDark} />
                    <div className="flex flex-wrap gap-2 mb-6">
                        {product.ingredients?.map((ingredient, i) => (
                            <span key={i} className={`px-3 py-1.5 rounded-lg text-base font-medium ${isDark ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' : 'bg-white text-zinc-700 border border-zinc-200 shadow-sm'}`}>
                                {ingredient}
                            </span>
                        ))}
                    </div>

                    {/* Allergen Info */}
                    <div className={`p-4 rounded-xl flex items-start gap-3 mt-4 ${isDark ? 'bg-amber-500/10 border border-amber-500/20 text-amber-200' : 'bg-amber-50 border border-amber-200 text-amber-800'}`}>
                        <Wheat size={20} className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <div>
                            <p className="text-[15px] font-bold mb-1">Alerjen Bilgisi</p>
                            <p className="text-base leading-relaxed opacity-90">
                                Tüm ürünlerimiz ortak alanlarda hazırlanmaktadır. Eser miktarda süt, glüten ve kuruyemiş içerebilir. Lütfen baristaya alerjilerinizi bildiriniz.
                            </p>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}

function SectionLabel({ label, isDark }) {
    return (
        <p className={`text-base font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {label}
        </p>
    );
}
