import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coffee, Search, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import LazyImage from '../components/LazyImage';
import { useTheme } from '../context/ThemeContext';
import { fetchMenuCategories } from '../services/menuService';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useTranslation } from 'react-i18next';

export default function Menu() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { isGuest } = useAuth();
    const { t } = useTranslation();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const isDark = theme === 'dark';
    const { toggleFavorite, isFavorite } = useFavorites();

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const cats = await fetchMenuCategories();
                if (cats && cats.length > 0) {
                    // Duplicate ID veya isime göre tekrar edenleri temizle
                    const seen = new Set();
                    const uniqueCats = cats.filter(cat => {
                        const key = (cat.id || cat.name || '').toLowerCase();
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                    });
                    setCategories([{ id: 'all', name: t('menu.all') }, ...uniqueCats]);
                } else {
                    throw new Error('Boş kategori listesi');
                }
            } catch (err) {
                console.error("Kategori yükleme hatası, hardcoded kullanılıyor", err);
                setCategories([
                    { id: 'all', name: t('menu.all') },
                    { id: 'espresso-based', name: 'Espresso Based' },
                    { id: 'tea-based', name: 'Tea Based' },
                    { id: 'special-lattes', name: 'Special Lattes' },
                    { id: 'shaco-special', name: 'Shaco Special' },
                    { id: 'shacochino', name: 'Shacochino' }
                ]);
            }
        };
        loadCategories();
    }, [t]);

    useEffect(() => {
        const loadProducts = async () => {
            setIsLoading(true);
            try {
                let qArgs = [collection(db, 'menu')];
                if (activeCategory !== 'all') {
                    qArgs.push(where('category', '==', activeCategory));
                }
                const q = query(...qArgs);
                const snapshot = await getDocs(q);

                const list = [];
                snapshot.forEach(d => {
                    const data = d.data();
                    if (data.isAvailable !== false) {
                        list.push({ id: d.id, ...data });
                    }
                });
                setProducts(list);
            } catch (err) {
                console.error("Menü yükleme hatası", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProducts();
    }, [activeCategory]);

    const filteredProducts = useMemo(() => {
        let items = products;
        if (searchQuery.trim()) {
            items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [products, searchQuery]);

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* Header */}
            <div className="p-6 pb-0">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className={`p-2 rounded-xl transition active:scale-90 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}
                        >
                            <ArrowLeft size={16} />
                        </button>
                        <h1 className={`text-[28px] font-serif font-black tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('menu.title')}</h1>
                    </div>
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-2.5 rounded-xl transition active:scale-90 ${showSearch ? 'bg-shaco-red text-white' : isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}
                    >
                        <Search size={16} />
                    </button>
                </div>

                {/* Search bar */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-4"
                        >
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('menu.search_placeholder')}
                                className={`w-full p-3 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition ${isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Category Filter Pills */}
                {!isLoading && categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 px-1 snap-x">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`shrink-0 snap-start px-4 py-2 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${activeCategory === cat.id
                                    ? 'bg-gradient-to-r from-warm-amber to-amber-light text-espresso-dark shadow-[0_4px_15px_rgba(200,151,58,0.4)]'
                                    : isDark
                                        ? 'glass-liquid text-zinc-400 hover:text-white'
                                        : 'bg-white text-zinc-500 border border-zinc-200 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-6">

                {/* Loading State */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                        ))}
                    </div>
                )}

                {/* Product Grid - Premium Liquid Glass List */}
                {!isLoading && (
                    <div className="space-y-3">
                        {filteredProducts.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <Link to={`/product/${product.id}`}>
                                    <div className={`flex items-center gap-4 p-3 rounded-[1.25rem] transition-all duration-300 active:scale-[0.98] ${isDark ? 'glass-liquid hover:bg-white/5' : 'bg-white border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)]'}`}>

                                        {/* Image or Placeholder */}
                                        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 relative group">
                                            {(product.imageUrl || product.image) ? (
                                                <LazyImage
                                                    src={product.imageUrl || product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full glass-liquid flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-tr from-warm-amber/10 to-transparent" />
                                                    <Coffee size={24} className={isDark ? 'text-zinc-600' : 'text-zinc-300'} />
                                                </div>
                                            )}
                                            {!isGuest && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        toggleFavorite(product.id);
                                                    }}
                                                    className={`absolute top-1 left-1 p-1.5 rounded-lg z-10 transition-all active:scale-90 ${isFavorite(product.id) ? 'bg-shaco-red/20 text-shaco-red backdrop-blur-md' : 'bg-black/30 text-white backdrop-blur-sm'}`}
                                                >
                                                    <Heart size={14} className={isFavorite(product.id) ? 'fill-current' : ''} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h4 className={`font-serif font-bold text-[17px] leading-tight truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h4>
                                            <p className={`text-[13px] mt-1 line-clamp-2 leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{product.description || product.shortDesc}</p>

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-warm-amber text-[17px] font-black tracking-wider w-full text-right drop-shadow-[0_0_5px_rgba(200,151,58,0.3)]">₺{product.price}</span>
                                            </div>
                                        </div>

                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-center py-16 rounded-3xl mt-4 glass-liquid ${isDark ? 'border-white/5' : ''}`}
                    >
                        <div className={`w-20 h-20 mx-auto mb-5 rounded-[2rem] flex items-center justify-center glass-liquid`}>
                            <Coffee size={32} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
                        </div>
                        <p className={`text-lg font-bold font-serif ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                            {searchQuery ? t('menu.no_results') : t('menu.empty')}
                        </p>
                        <p className={`text-[15px] mt-1.5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {searchQuery ? t('menu.no_results_desc') : t('menu.empty_desc')}
                        </p>
                    </motion.div>
                )}

                {/* Results count */}
                {!isLoading && filteredProducts.length > 0 && (
                    <p className={`text-center text-[12px] font-bold tracking-[0.2em] mt-8 uppercase ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {t('menu.results_count', { count: filteredProducts.length })}
                    </p>
                )}
            </div>
        </div>
    );
}
