import { useRewards } from '../context/RewardsContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, History, Coffee, X, QrCode, Gift, Store, Wallet, ChevronRight, ArrowRight, UserPlus, LogIn, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { fetchProducts } from '../services/menuService';
import { useFavorites } from '../context/FavoritesContext';
import StampCard from '../components/StampCard';
import LazyImage from '../components/LazyImage';
import { useSocialMedia } from '../context/SocialMediaContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../firebase';
import BranchStatusCard from '../components/BranchStatusCard';
import '../components/BranchStatusCard.css';
import { useTranslation } from 'react-i18next';

export default function Home() {
    const { stars, balance, favoriteProduct } = useRewards();
    const { user, isGuest, isStaff } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showHistory, setShowHistory] = useState(false);
    const [activeCampaign, setActiveCampaign] = useState(0);

    const isDark = theme === 'dark';
    const { isFavorite, toggleFavorite } = useFavorites();

    const [campaigns, setCampaigns] = useState([]);
    const [popularProducts, setPopularProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [productOfTheDayId, setProductOfTheDayId] = useState(null);

    // Stories State
    const [stories, setStories] = useState([]);
    const [activeStoryIndex, setActiveStoryIndex] = useState(null);

    useEffect(() => {
        const loadMenu = async () => {
            try {
                const data = await fetchProducts();
                setAllProducts(data);
                const available = data.filter(p => p.isAvailable).slice(0, 5);
                setPopularProducts(available);
            } catch (err) {
                console.warn("Menü yüklenemedi", err);
            } finally {
                setIsLoadingProducts(false);
            }
        };
        loadMenu();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
            if (docSnap.exists()) {
                setProductOfTheDayId(docSnap.data().productOfTheDay || null);
            }
        });
        return () => unsubscribe();
    }, []);

    const productOfTheDay = allProducts.find(p => p.id === productOfTheDayId);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'campaigns'), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.isActive) {
                    list.push({ id: doc.id, ...data });
                }
            });
            setCampaigns(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'stories'), (snapshot) => {
            const list = [];
            snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
            setStories(list.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
        });
        return () => unsubscribe();
    }, []);

    // Story Auto-Advance Logic
    useEffect(() => {
        if (activeStoryIndex === null) return;
        const timer = setTimeout(() => {
            if (activeStoryIndex < stories.length - 1) {
                setActiveStoryIndex(prev => prev + 1);
            } else {
                setActiveStoryIndex(null);
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [activeStoryIndex, stories.length]);

    useEffect(() => {
        if (campaigns.length === 0) return;
        const timer = setInterval(() => setActiveCampaign(prev => (prev + 1) % campaigns.length), 4000);
        return () => clearInterval(timer);
    }, [campaigns.length]);

    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting(t('home.greeting_morning'));
        else if (hour < 18) setGreeting(t('home.greeting_afternoon'));
        else setGreeting(t('home.greeting_evening'));
    }, [t]);

    const pFav = favoriteProduct && popularProducts.length > 0 ? popularProducts.find(p => p.name === favoriteProduct.name) : null;

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            <div className="relative overflow-hidden">
                <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-gradient-to-b from-shaco-red/5 via-transparent to-transparent' : 'bg-gradient-to-b from-red-50/50 to-transparent'}`} style={{ height: '220px' }} />

                <div className="p-6 pt-10 relative z-10">
                    {/* Header row: Brand + Avatar */}
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-8">
                        <div className="flex flex-1 items-center gap-4">
                            <div>
                                <h1 className={`text-[34px] font-serif font-black tracking-tight leading-none drop-shadow-sm ${isDark ? 'text-white' : 'text-zinc-900'}`}>Shaco</h1>
                                <p className="text-warm-amber font-sans text-xs tracking-[0.4em] font-bold uppercase mt-1">COFFEE CO.</p>
                            </div>
                            <div className={`p-2 rounded-2xl shadow-sm flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50' : 'bg-gradient-to-br from-white to-red-50 border border-red-100'}`}>
                                <img src="/images.png" alt="Shaco Logo" className="w-8 h-8 object-contain drop-shadow-md" />
                            </div>
                        </div>

                        {/* User Avatar Button */}
                        <motion.button whileTap={{ scale: 0.9 }} onClick={async () => {
                            try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                            navigate('/settings');
                        }} className={`relative w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border ${isDark ? 'bg-zinc-800/80 border-zinc-700/50' : 'bg-white border-zinc-200/50'}`}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className={`text-lg font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : <UserPlus size={18} />}
                                </span>
                            )}
                            {user && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-shaco-red border border-white" />}
                        </motion.button>
                    </motion.div>

                    {/* Greeting */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {greeting}, {user?.firstName ? `${user.firstName} ${user.lastName}` : t('home.guest')} 👋
                        </h2>
                        <p className={`text-base mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            {isStaff ? t('home.staff_day') : t('home.what_to_drink')}
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="px-6">

                {/* Stories Bubbles */}
                {stories.length > 0 && (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 pt-1">
                        {stories.map((story, idx) => (
                            <motion.button
                                key={story.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + idx * 0.05 }}
                                onClick={() => setActiveStoryIndex(idx)}
                                className="flex flex-col items-center gap-1.5 shrink-0"
                            >
                                <div className={`w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500`}>
                                    <div className={`w-full h-full rounded-full border-2 ${isDark ? 'border-black' : 'border-zinc-50'} overflow-hidden relative`}>
                                        <img src={story.image} alt="Story" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold max-w-[64px] truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                    {story.title || 'Shaco'}
                                </span>
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Guest Registration Banner */}
                {isGuest && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className={`rounded-3xl p-5 mb-6 relative overflow-hidden glass-liquid ${isDark ? 'bg-gradient-to-br from-warm-amber/10 to-espresso-dark/80' : 'bg-gradient-to-br from-amber-50 to-white/90 shadow-[0_8px_30px_rgba(200,151,58,0.15)]'}`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-warm-amber/20 rounded-full blur-3xl -translate-y-8 translate-x-8" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-base font-bold tracking-[0.15em] px-2 py-0.5 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>{t('home.guest_badge')}</span>
                            </div>
                            <h3 className={`text-[15px] font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('home.guest_title')}</h3>
                            <p className={`text-base mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                {t('home.guest_desc')}
                            </p>
                            <div className="flex gap-2">
                                <button onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { } navigate('/register'); }}
                                    className="flex-1 py-3 rounded-xl bg-shaco-red text-white font-bold text-base flex items-center justify-center gap-2 shadow-neon-red hover:shadow-neon-red-strong active:scale-95 transition-all duration-300">
                                    <UserPlus size={14} /> {t('home.register')}
                                </button>
                                <button onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { } navigate('/login'); }}
                                    className={`flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 hover:shadow-glass ${isDark ? 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-300 hover:bg-zinc-700/80' : 'bg-white/80 border border-zinc-200/50 text-zinc-600 shadow-sm hover:bg-white'}`}>
                                    <LogIn size={14} /> Giriş Yap
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Star & Balance - Hidden for guests */}
                {!isGuest && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className={`rounded-2xl p-5 mb-6 glass-panel relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-white/5 to-transparent border-white/10 shadow-[0_4px_30px_rgba(239,68,68,0.15)]' : 'bg-white/80 border-zinc-200/50 shadow-sm'}`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-shaco-red/20 rounded-full blur-3xl -translate-y-10 translate-x-10" />
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star size={13} className="text-yellow-500 fill-yellow-500" />
                                    <span className={`text-base font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>YILDIZ</span>
                                    <span className={`text-base font-bold ml-auto ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{stars}/15</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stars / 15) * 100, 100)}%` }}
                                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                    />
                                </div>
                                <p className={`text-[15px] mt-1.5 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
                                    {stars >= 15 ? 'Ödül kazandın! 🎉' : `Ödüle ${15 - stars} yıldız kaldı`}
                                </p>
                            </div>
                            <div className={`w-px h-10 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                            <div className="text-center px-2">
                                <p className={`text-base font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>BAKİYE</p>
                                <p className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-zinc-900'}`}>₺{balance.toFixed(0)}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Stamp Card - Only for registered users */}
                {!isGuest && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
                        <StampCard />
                    </motion.div>
                )}

                {/* ✅ Şube Durumu Kartı */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mb-6 -mx-6">
                    <BranchStatusCard />
                </motion.div>

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-2.5 mb-7 overflow-x-auto no-scrollbar pb-2">
                    <QuickPill icon={<QrCode size={15} />} label={t('home.qr_pay')} onClick={() => navigate('/pay')} isDark={isDark} accent />
                    {!isGuest && <QuickPill icon={<Wallet size={15} />} label={t('home.load_balance')} onClick={() => navigate('/wallet')} isDark={isDark} />}
                    <QuickPill icon={<Store size={15} />} label={t('home.stores')} onClick={() => navigate('/stores')} isDark={isDark} />
                </motion.div>

                {/* Campaigns */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-7">
                    <SectionHeader title="Kampanyalar" action="Tümü" isDark={isDark} />
                    {campaigns.length > 0 ? (
                        <>
                            <div className="relative h-32 rounded-2xl overflow-hidden">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeCampaign}
                                        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                                        transition={{ duration: 0.35 }}
                                        className={`absolute inset-0 bg-gradient-to-br ${campaigns[activeCampaign]?.gradient} rounded-2xl p-5 flex items-center justify-between`}
                                    >
                                        <div>
                                            <h4 className="text-base font-bold text-white mb-0.5">{campaigns[activeCampaign]?.title}</h4>
                                            <p className="text-base text-white/60 mb-3">{campaigns[activeCampaign]?.subtitle}</p>
                                            <button className="bg-white/15 backdrop-blur text-white text-[15px] font-bold px-3.5 py-1.5 rounded-lg">Kullan →</button>
                                        </div>
                                        <span className="text-4xl">{campaigns[activeCampaign]?.emoji}</span>
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                            <div className="flex justify-center gap-1.5 mt-3">
                                {campaigns.map((_, i) => (
                                    <button key={i} onClick={() => setActiveCampaign(i)}
                                        className={`h-1 rounded-full transition-all duration-300 ${i === activeCampaign ? 'w-5 bg-shaco-red' : `w-1.5 ${isDark ? 'bg-zinc-800' : 'bg-zinc-300'}`}`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className={`h-32 rounded-2xl flex flex-col items-center justify-center border border-dashed ${isDark ? 'bg-zinc-900/50 border-zinc-800' : 'bg-red-50/50 border-red-200'}`}>
                            <Gift size={24} className={`mb-2 ${isDark ? 'text-zinc-600' : 'text-red-300'}`} />
                            <p className={`text-[15px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Şu an aktif kampanya bulunmuyor.</p>
                        </div>
                    )}
                </motion.div>

                {/* Favorite Product (Müdavim Özelliği) */}
                {!isGuest && pFav && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-7">
                        <SectionHeader title="Sizin Klasikleriniz" action="Sipariş Ver" onAction={() => navigate(`/product/${pFav.id}`)} isDark={isDark} />
                        <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate(`/product/${pFav.id}`)}
                            className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer relative overflow-hidden ${isDark ? 'bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : 'bg-gradient-to-r from-yellow-50 to-white border border-yellow-200/50 shadow-sm'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent pointer-events-none" />
                            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative z-10">
                                <LazyImage src={pFav.image} alt={pFav.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h4 className={`font-bold text-[15px] truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{pFav.name}</h4>
                                    <span className="bg-gradient-to-r from-yellow-600 to-yellow-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-lg shadow-yellow-500/20">MÜDAVİM</span>
                                </div>
                                <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    Toplam <strong className={isDark ? 'text-yellow-400' : 'text-yellow-600'}>{favoriteProduct.count} kez</strong> aldınız.
                                </p>
                            </div>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10 ${isDark ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                <ChevronRight size={14} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Social Media */}
                <SocialMediaSection isDark={isDark} />

                {/* Günün Önerisi */}
                {productOfTheDay && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }} className="mb-7">
                        <SectionHeader title="Günün Önerisi" action="İncele" onAction={() => navigate(`/product/${productOfTheDay.id}`)} isDark={isDark} />
                        <div onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { } navigate(`/product/${productOfTheDay.id}`); }}
                            className={`relative rounded-3xl overflow-hidden cursor-pointer group ${isDark ? 'glass-liquid border border-amber-500/20' : 'bg-gradient-to-br from-amber-50 to-white border border-amber-200 shadow-lg'}`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl -translate-y-10 translate-x-10" />
                            <div className="flex h-36">
                                <div className="w-2/5 h-full p-2">
                                    <div className="w-full h-full rounded-2xl overflow-hidden relative">
                                        <LazyImage src={productOfTheDay.imageUrl || productOfTheDay.image} alt={productOfTheDay.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                        <div className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest">
                                            ÖZEL
                                        </div>
                                    </div>
                                </div>
                                <div className="w-3/5 p-4 pl-2 flex flex-col justify-center relative z-10">
                                    <h3 className={`font-serif font-black text-[22px] leading-tight mb-1 truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{productOfTheDay.name}</h3>
                                    <p className={`text-[13px] line-clamp-2 leading-tight mb-2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{productOfTheDay.description || productOfTheDay.shortDesc}</p>
                                    <div className="flex items-center gap-2 mt-auto">
                                        <span className={`text-[18px] font-black tracking-tight ${isDark ? 'text-warm-amber' : 'text-amber-600'}`}>₺{productOfTheDay.price}</span>
                                        {productOfTheDay.nutrition?.calories && (
                                            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md flex-shrink-0 ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-100 text-amber-700'}`}>
                                                {productOfTheDay.nutrition.calories} KCAL
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Popular */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-7">
                    <SectionHeader title="Sizin İçin Seçtiklerimiz" action="Menü" onAction={() => navigate('/menu')} isDark={isDark} />

                    {isLoadingProducts ? (
                        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`flex-shrink-0 w-36 h-48 rounded-3xl animate-pulse ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                            ))}
                        </div>
                    ) : popularProducts.length > 0 ? (
                        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-1 px-1 pb-2 pt-1">
                            {popularProducts.map((product, i) => (
                                <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + i * 0.05 }}
                                    onClick={async () => {
                                        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                        navigate(`/product/${product.id}`);
                                    }}
                                    className={`flex-shrink-0 w-36 rounded-3xl overflow-hidden cursor-pointer group transition-all duration-400 active:scale-95 ${isDark ? 'bg-gradient-to-b from-espresso-medium to-espresso-dark border border-white/5 shadow-lg shadow-black/50' : 'bg-white border border-zinc-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)]'}`}
                                >
                                    <div className="relative h-32 overflow-hidden mx-1 mt-1 rounded-2xl">
                                        {(product.imageUrl || product.image) ? (
                                            <LazyImage src={product.imageUrl || product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full glass-liquid flex flex-col items-center justify-center relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-warm-amber/5 to-transparent object-cover" />
                                                <Coffee size={28} strokeWidth={1} className={isDark ? 'text-zinc-600' : 'text-zinc-300'} />
                                            </div>
                                        )}
                                        {!isGuest && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleFavorite(product.id);
                                                }}
                                                className={`absolute top-2 right-2 p-1.5 rounded-lg z-10 backdrop-blur-md transition-all active:scale-90 ${isFavorite(product.id) ? 'bg-shaco-red/20 text-shaco-red' : 'bg-black/30 text-white'}`}
                                            >
                                                <Heart size={14} className={isFavorite(product.id) ? 'fill-current' : ''} />
                                            </button>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-2 left-2 right-2 glass-liquid rounded-lg py-1 px-2 flex justify-between items-center bg-black/30">
                                            <span className="text-white text-[13px] font-black tracking-wider">₺{product.price}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 pt-2">
                                        <h4 className={`font-serif font-semibold text-[15px] leading-tight line-clamp-2 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{product.name}</h4>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {product.category === 'cat_coffee' && <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-warm-amber/10 text-warm-amber font-bold">KAHVE</span>}
                                            {product.allergens?.includes('Milk') && <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-zinc-500/10 text-zinc-400 font-bold">SÜT</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className={`p-4 rounded-3xl text-center glass-liquid ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            <Coffee size={24} className="mx-auto mb-2 opacity-50" />
                            <p>Şu an popüler ürün bulunamadı.</p>
                        </div>
                    )}
                </motion.div>

                {/* History shortcut */}
                {!isGuest && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.95 }}
                        onClick={async () => { try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { } setShowHistory(true); }}
                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all duration-300 glass-panel relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)]' : 'bg-white/80 border-zinc-200/50 shadow-sm hover:shadow-md'}`}
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-shaco-red to-shaco-dark-red" />
                        <div className="flex items-center gap-4 pl-2">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner ${isDark ? 'bg-black/50 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                <History size={18} />
                            </div>
                            <div className="text-left">
                                <p className={`text-[16px] font-bold tracking-wide ${isDark ? 'text-white' : 'text-zinc-800'}`}>Sipariş Geçmişi</p>
                                <p className={`text-[13px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>Son siparişleri gör</p>
                            </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                            <ChevronRight size={16} />
                        </div>
                    </motion.button>
                )}
            </div>

            {/* History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                            className={`w-full max-w-md rounded-t-3xl p-6 border-t max-h-[70vh] overflow-hidden flex flex-col ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-10 h-1 rounded-full mx-auto mb-4 bg-zinc-700" />
                            <div className="flex justify-between items-center mb-5">
                                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Geçmiş</h2>
                                <button onClick={() => setShowHistory(false)} className={`p-1.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}><X size={16} /></button>
                            </div>
                            <div className="overflow-y-auto space-y-2">
                                {[
                                    { name: 'Caffe Latte', time: 'Bugün, 14:30', price: '85.00', stars: 5 },
                                    { name: "Jester's Delight", time: 'Dün, 11:20', price: '55.00', stars: 3 },
                                    { name: 'Americano', time: '15 Şubat, 09:15', price: '38.00', stars: 2 },
                                ].map((order, i) => (
                                    <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="bg-shaco-red/10 p-2 rounded-lg text-shaco-red"><Coffee size={14} /></div>
                                            <div>
                                                <p className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{order.name}</p>
                                                <p className={`text-base ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{order.time}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>-₺{order.price}</p>
                                            <p className="text-base text-yellow-500 font-bold">+{order.stars} ⭐</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Story Viewer Modal */}
            <AnimatePresence>
                {activeStoryIndex !== null && stories[activeStoryIndex] && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[70] bg-black sm:bg-black/90 sm:p-4 flex items-center justify-center pointer-events-auto"
                    >
                        <div className="w-full h-full sm:max-w-md sm:h-[85vh] sm:rounded-3xl overflow-hidden relative bg-zinc-900 shadow-2xl flex flex-col justify-end pb-8">
                            <div className="absolute top-4 left-4 right-4 z-20 flex gap-1.5">
                                {stories.map((_, i) => (
                                    <div key={i} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-white"
                                            initial={{ width: i < activeStoryIndex ? '100%' : '0%' }}
                                            animate={{ width: i === activeStoryIndex ? '100%' : i < activeStoryIndex ? '100%' : '0%' }}
                                            transition={i === activeStoryIndex ? { duration: 5, ease: 'linear' } : { duration: 0 }}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md p-1">
                                        <img src="/images.png" alt="Shaco" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-white text-sm font-bold tracking-wide drop-shadow-md">Shaco Coffee</span>
                                </div>
                                <button onClick={() => setActiveStoryIndex(null)} className="p-1.5 rounded-full bg-black/40 text-white backdrop-blur-md">
                                    <X size={20} />
                                </button>
                            </div>

                            <img src={stories[activeStoryIndex].image} alt="Story" className="absolute inset-0 w-full h-full object-cover z-0" />

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent pt-32 pb-8 px-6 z-10 pointer-events-none">
                                <h3 className="text-white text-2xl font-bold mb-2">{stories[activeStoryIndex].title}</h3>
                                {stories[activeStoryIndex].text && (
                                    <p className="text-white/90 text-sm leading-relaxed">{stories[activeStoryIndex].text}</p>
                                )}
                            </div>

                            <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                if (activeStoryIndex > 0) setActiveStoryIndex(prev => prev - 1);
                            }} />
                            <div className="absolute inset-y-0 right-0 w-1/3 z-20 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                if (activeStoryIndex < stories.length - 1) setActiveStoryIndex(prev => prev + 1);
                                else setActiveStoryIndex(null);
                            }} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function QuickPill({ icon, label, onClick, isDark, accent }) {
    const handleClick = async (e) => {
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { }
        if (onClick) onClick(e);
    };
    return (
        <button onClick={handleClick}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[15px] font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${accent
                ? 'bg-gradient-to-r from-shaco-red to-red-600 text-white shadow-[0_4px_20px_rgba(239,68,68,0.5)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.6)] border border-red-400/30'
                : isDark ? 'glass-panel bg-white/5 text-white border-white/10 hover:bg-white/10 hover:shadow-[0_4px_20px_rgba(255,255,255,0.05)]' : 'bg-white text-zinc-800 border border-zinc-200 shadow-sm hover:shadow-md hover:bg-zinc-50'
                }`}
        > {icon} {label} </button>
    );
}

function SectionHeader({ title, action, onAction, isDark }) {
    return (
        <div className="flex justify-between items-center mb-3">
            <h3 className={`text-[15px] font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>{title}</h3>
            <button onClick={onAction} className="text-shaco-red text-[15px] font-bold flex items-center gap-1">{action} <ArrowRight size={11} /></button>
        </div>
    );
}

const platformIcons = {
    instagram: (size = 18) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
    ),
    tiktok: (size = 18) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.15V11.7a4.79 4.79 0 01-3.77-1.8v-.01z" />
        </svg>
    ),
    facebook: (size = 18) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    ),
    youtube: (size = 18) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    ),
    x: (size = 18) => (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
};

const platformColors = {
    instagram: '#E4405F',
    tiktok: '#00F2EA',
    facebook: '#1877F2',
    youtube: '#FF0000',
    x: '#9CA3AF',
};

function SocialMediaSection({ isDark }) {
    const { accounts } = useSocialMedia();

    if (!accounts || accounts.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-7">
            <SectionHeader title="Bizi Takip Edin" isDark={isDark} />
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {accounts.map((account) => {
                    const IconFn = platformIcons[account.platform];
                    const color = platformColors[account.platform] || '#9CA3AF';
                    return (
                        <a
                            key={account.id}
                            href={account.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-95 shrink-0 ${isDark
                                ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                                : 'bg-white border-zinc-200 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div
                                className="w-6 h-6 rounded-md flex items-center justify-center text-white"
                                style={{ backgroundColor: color }}
                            >
                                {IconFn ? IconFn(12) : null}
                            </div>
                            <span className={`text-base font-bold whitespace-nowrap ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                                {account.username}
                            </span>
                        </a>
                    );
                })}
            </div>
        </motion.div>
    );
}
