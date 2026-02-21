import { products } from '../data/products';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coffee, UtensilsCrossed, Search, SlidersHorizontal, Star, ShoppingCart, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';

const categoryFilters = [
    { label: 'Tümü', value: 'all' },
    { label: 'Sıcak', value: 'hot', emoji: '☕' },
    { label: 'Soğuk', value: 'cold', emoji: '🧊' },
    { label: 'Özel', value: 'signature', emoji: '⭐' },
    { label: 'Tatlı', value: 'dessert', emoji: '🍰' },
];

export default function Menu() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('drinks');
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);

    const isDark = theme === 'dark';

    const filteredProducts = useMemo(() => {
        let items = products.filter(p => activeTab === 'food' ? p.isFood : !p.isFood);
        if (activeCategory !== 'all') {
            items = items.filter(p => p.category === activeCategory);
        }
        if (searchQuery.trim()) {
            items = items.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        return items;
    }, [activeTab, activeCategory, searchQuery]);

    const featuredProduct = activeTab === 'drinks' && activeCategory === 'all' && !searchQuery
        ? products.find(p => p.category === 'signature' && !p.isFood)
        : null;

    const gridProducts = featuredProduct
        ? filteredProducts.filter(p => p.id !== featuredProduct.id)
        : filteredProducts;

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
                        <h1 className="text-xl font-display font-bold">Menü</h1>
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
                                placeholder="Ürün ara..."
                                className={`w-full p-3 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition ${isDark ? 'bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600' : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drink/Food Tabs */}
                <div className={`flex p-1 rounded-xl mb-4 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-100'}`}>
                    <TabButton
                        active={activeTab === 'drinks'}
                        onClick={() => { setActiveTab('drinks'); setActiveCategory('all'); }}
                        icon={<Coffee size={14} />}
                        label="İçecekler"
                        isDark={isDark}
                    />
                    <TabButton
                        active={activeTab === 'food'}
                        onClick={() => { setActiveTab('food'); setActiveCategory('all'); }}
                        icon={<UtensilsCrossed size={14} />}
                        label="Yiyecekler"
                        isDark={isDark}
                    />
                </div>

                {/* Category Filter Pills */}
                {activeTab === 'drinks' && (
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-5">
                        {categoryFilters.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setActiveCategory(cat.value)}
                                className={`px-3 py-1.5 rounded-lg text-[15px] font-bold whitespace-nowrap transition ${activeCategory === cat.value
                                    ? 'bg-shaco-red text-white'
                                    : isDark
                                        ? 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                        : 'bg-white text-zinc-500 border border-zinc-200'
                                    }`}
                            >
                                {cat.emoji && `${cat.emoji} `}{cat.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="px-6">
                {/* Featured Item */}
                {featuredProduct && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                    >
                        <Link to={`/product/${featuredProduct.id}`}>
                            <div className={`relative rounded-2xl overflow-hidden aspect-[2.2/1] group`}>
                                <img
                                    src={featuredProduct.image}
                                    alt={featuredProduct.name}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-5 z-10">
                                    <span className="text-shaco-red text-[15px] font-bold tracking-[0.2em] uppercase block mb-1">İMZA TARİF</span>
                                    <h3 className="text-white font-bold text-xl leading-tight">{featuredProduct.name}</h3>
                                    <p className="text-white/50 text-base mt-0.5">{featuredProduct.shortDesc}</p>
                                </div>
                                <div className="absolute bottom-4 right-4 z-10">
                                    <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-base font-bold text-white">
                                        ₺{featuredProduct.price}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Product Grid - Clean list style */}
                <div className="space-y-2.5">
                    {gridProducts.map((product, i) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                        >
                            <Link to={`/product/${product.id}`}>
                                <div className={`flex items-center gap-3.5 p-3 rounded-2xl transition active:scale-[0.98] ${isDark ? 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700' : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md'}`}>
                                    {/* Image */}
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-semibold text-[15px] leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h4>
                                        <p className={`text-[15px] mt-0.5 truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{product.shortDesc}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-shaco-red text-base font-bold">₺{product.price}</span>
                                            <span className={`text-base flex items-center gap-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                <Star size={9} className="text-yellow-500 fill-yellow-500" /> {product.rating}
                                            </span>
                                            <span className={`text-[15px] px-1.5 py-0.5 rounded ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                                {product.calories} kcal
                                            </span>
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredProducts.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                            <Coffee size={24} className="text-zinc-500" />
                        </div>
                        <p className={`text-base font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                            {searchQuery ? 'Sonuç bulunamadı' : 'Bu kategoride ürün yok'}
                        </p>
                        <p className={`text-base mt-1 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>
                            {searchQuery ? 'Farklı bir arama deneyin' : 'Yakında eklenecek'}
                        </p>
                    </motion.div>
                )}

                {/* Results count */}
                {filteredProducts.length > 0 && (
                    <p className={`text-center text-base font-bold tracking-wider mt-6 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>
                        {filteredProducts.length} ÜRÜN
                    </p>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label, isDark }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-2.5 rounded-lg text-base font-bold tracking-wide flex items-center justify-center gap-1.5 transition-all ${active
                ? isDark ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-900 shadow-md'
                : isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-600'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}
