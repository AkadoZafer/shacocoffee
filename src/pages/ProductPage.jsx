import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Wheat, Coffee, Heart, Flame, Zap, Dumbbell, Droplets } from 'lucide-react';
import LazyImage from '../components/LazyImage';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect } from 'react';
import { fetchProducts } from '../services/menuService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { isFavorite, toggleFavorite } = useFavorites();
    const { isGuest } = useAuth();
    const { t } = useTranslation();

    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProduct = async () => {
            try {
                const allProds = await fetchProducts();
                // useParams'dan gelen id string, mock datada prod_X gibi string kullanıyoruz
                const found = allProds.find(p => p.id === id || p.id === parseInt(id));
                setProduct(found);
            } catch (error) {
                console.error("Ürün yüklenemedi", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadProduct();
    }, [id]);

    if (isLoading) return (
        <div className={`min-h-screen flex flex-col items-center justify-center ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
            <div className={`w-20 h-20 rounded-[2rem] animate-pulse mb-6 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
            <div className={`w-40 h-4 rounded-full animate-pulse ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
        </div>
    );

    if (!product) return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <div className={`w-24 h-24 mb-6 rounded-full flex items-center justify-center glass-liquid`}>
                <Coffee size={36} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
            </div>
            <p className="font-serif font-bold text-2xl mb-2">{t('product.not_found')}</p>
            <p className={isDark ? 'text-zinc-500' : 'text-zinc-400'}>{t('product.not_found_desc')}</p>
            <button onClick={() => navigate('/menu')} className="mt-8 px-6 py-3 rounded-xl bg-warm-amber text-espresso-dark font-bold active:scale-95 transition-all">
                {t('product.back_to_menu')}
            </button>
        </div>
    );

    return (
        <div className={`h-screen overflow-y-auto flex flex-col transition-colors duration-300 ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>

            {/* Hero Image */}
            <div className="relative h-[45vh] shrink-0 overflow-hidden">
                {(product.imageUrl || product.image) ? (
                    <LazyImage
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full glass-liquid flex items-center justify-center bg-gradient-to-b from-espresso-medium/30 to-black/80">
                        <Coffee size={80} strokeWidth={1} className={isDark ? 'text-zinc-700/50' : 'text-zinc-300'} />
                    </div>
                )}

                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-black via-black/40 to-black/30' : 'bg-gradient-to-t from-zinc-50 via-transparent to-black/10'}`} />
                <button
                    onClick={() => navigate(-1)}
                    className={`absolute top-6 left-6 p-3 rounded-2xl glass-liquid transition-all active:scale-90 z-20 ${isDark ? 'text-white border-white/10' : 'text-zinc-900 border-zinc-200/50'}`}
                >
                    <ArrowLeft size={20} />
                </button>
                {!isGuest && (
                    <button
                        onClick={() => toggleFavorite(product.id)}
                        className={`absolute top-6 right-6 p-3 rounded-2xl glass-liquid transition-all active:scale-90 z-20 ${isFavorite(product.id) ? 'bg-shaco-red/20 text-shaco-red border-shaco-red/20' : isDark ? 'bg-black/20 text-white border-white/10' : 'bg-white/80 text-zinc-900 border-zinc-200/50'}`}
                    >
                        <Heart size={20} className={isFavorite(product.id) ? 'fill-current' : ''} />
                    </button>
                )}
            </div>

            {/* Content */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className={`relative flex-1 -mt-12 rounded-t-[2.5rem] px-7 pt-8 pb-24 z-10 ${isDark ? 'glass-liquid bg-black/40' : 'glass-liquid bg-white/60 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}
            >
                <div className={`w-12 h-1.5 rounded-full mx-auto mb-6 ${isDark ? 'bg-zinc-700/50' : 'bg-zinc-300'}`} />

                {/* Product info */}
                <div className="flex justify-between items-start mb-6 w-full">
                    <div className="flex-1 w-full relative">
                        <span className="text-warm-amber text-[10px] font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(200,151,58,0.5)]">
                            {product.category === 'signature' ? t('product.signature') : product.category === 'cat_hot' ? t('product.hot') : product.category === 'cat_cold' ? t('product.cold') : t('product.fresh')}
                        </span>

                        <div className="flex justify-between w-full items-end gap-4 mt-2 mb-1">
                            <h1 className={`text-[32px] font-serif font-black leading-none tracking-tight break-words flex-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h1>
                            <span className={`text-[28px] font-black tracking-tight shrink-0 drop-shadow-md ${isDark ? 'text-warm-amber' : 'text-espresso-dark'}`}>
                                ₺{product.price}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <div className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-yellow-50 text-yellow-600'}`}>
                                <Star size={12} className="fill-current" />
                                <span className="text-[12px] font-black tracking-wider">4.8</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className={`text-[15px] leading-relaxed mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {product.description || product.shortDesc}
                </p>

                {/* Nutrition Card - Phase 10 */}
                {product.nutrition && (
                    <div className="mb-6">
                        <SectionLabel label={t('product.nutrition_title')} isDark={isDark} />
                        <div className="grid grid-cols-2 gap-3 mt-3">
                            {product.nutrition.calories !== undefined && (
                                <div className={`flex items-center gap-3 p-3 rounded-2xl glass-liquid ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-zinc-200/50'}`}>
                                    <div className="bg-orange-500/20 p-2 rounded-xl text-orange-500">
                                        <Flame size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold leading-tight ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>{t('product.calories')}</p>
                                        <p className={`text-sm font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{product.nutrition.calories} kcal</p>
                                    </div>
                                </div>
                            )}
                            {product.nutrition.caffeine !== undefined && (
                                <div className={`flex items-center gap-3 p-3 rounded-2xl glass-liquid ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-zinc-200/50'}`}>
                                    <div className="bg-yellow-500/20 p-2 rounded-xl text-yellow-500">
                                        <Zap size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold leading-tight ${isDark ? 'text-yellow-500' : 'text-yellow-600'}`}>{t('product.caffeine')}</p>
                                        <p className={`text-sm font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{product.nutrition.caffeine} mg</p>
                                    </div>
                                </div>
                            )}
                            {product.nutrition.protein !== undefined && (
                                <div className={`flex items-center gap-3 p-3 rounded-2xl glass-liquid ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-zinc-200/50'}`}>
                                    <div className="bg-blue-500/20 p-2 rounded-xl text-blue-500">
                                        <Dumbbell size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold leading-tight ${isDark ? 'text-blue-500' : 'text-blue-600'}`}>{t('product.protein')}</p>
                                        <p className={`text-sm font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{product.nutrition.protein} g</p>
                                    </div>
                                </div>
                            )}
                            {product.nutrition.fat !== undefined && (
                                <div className={`flex items-center gap-3 p-3 rounded-2xl glass-liquid ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-zinc-200/50'}`}>
                                    <div className="bg-stone-500/20 p-2 rounded-xl text-stone-500">
                                        <Droplets size={18} />
                                    </div>
                                    <div>
                                        <p className={`text-xs font-bold leading-tight ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{t('product.fat')}</p>
                                        <p className={`text-sm font-black ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{product.nutrition.fat} g</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Extras and Allergens */}
                <div className="mb-6 space-y-6">

                    {product.extras && product.extras.length > 0 && (
                        <div>
                            <SectionLabel label={t('product.ingredients_title')} isDark={isDark} />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {(Array.isArray(product.extras) ? product.extras : product.extras.split(',')).map((extra, i) => (
                                    <span key={i} className={`px-4 py-2 rounded-xl text-[13px] font-bold tracking-wide ${isDark ? 'glass-liquid text-zinc-200' : 'bg-white text-zinc-700 border border-zinc-200 shadow-sm'}`}>
                                        {extra.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Allergen Info */}
                    {product.allergens && (Array.isArray(product.allergens) ? product.allergens.length > 0 : product.allergens.trim() !== '') && (
                        <div className={`p-5 rounded-2xl flex items-start gap-4 mt-6 glass-liquid ${isDark ? 'bg-amber-500/5' : 'bg-amber-50 border-amber-200/50'}`}>
                            <div className="bg-amber-500/20 p-2.5 rounded-xl shrink-0">
                                <Wheat size={24} className="text-amber-500" />
                            </div>
                            <div>
                                <p className={`text-[15px] font-black tracking-wide mb-1.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>{t('product.allergen_title')}</p>
                                <p className={`text-[13px] leading-relaxed ${isDark ? 'text-zinc-400' : 'text-amber-800/80'}`}>
                                    {t('product.allergen_desc', { list: Array.isArray(product.allergens) ? product.allergens.join(', ') : product.allergens })}
                                </p>
                            </div>
                        </div>
                    )}
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
