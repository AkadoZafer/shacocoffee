import { useRewards } from '../context/RewardsContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, History, Coffee, X, QrCode, Gift, Store, Wallet, ChevronRight, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { products } from '../data/products';
import StampCard from '../components/StampCard';

export default function Home() {
    const { stars, balance } = useRewards();
    const { user, isGuest } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);
    const [activeCampaign, setActiveCampaign] = useState(0);

    const isDark = theme === 'dark';

    const campaigns = [
        { title: "Yeni Üyelere Özel", subtitle: "İlk siparişte %30 indirim", emoji: "🎁", gradient: "from-red-600 to-red-900" },
        { title: "3 Al 2 Öde", subtitle: "Tüm soğuk kahvelerde", emoji: "❄️", gradient: "from-cyan-600 to-blue-900" },
        { title: "Sabah Rutini", subtitle: "Kahve + Kruvasan 95₺", emoji: "☀️", gradient: "from-amber-600 to-orange-900" },
    ];

    useEffect(() => {
        const timer = setInterval(() => setActiveCampaign(prev => (prev + 1) % campaigns.length), 4000);
        return () => clearInterval(timer);
    }, []);

    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Günaydın');
        else if (hour < 18) setGreeting('Tünaydın');
        else setGreeting('İyi Akşamlar');
    }, []);

    const popularProducts = products.slice(0, 4);

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            <div className="relative overflow-hidden">
                <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-gradient-to-b from-shaco-red/5 via-transparent to-transparent' : 'bg-gradient-to-b from-red-50/50 to-transparent'}`} style={{ height: '220px' }} />

                <div className="p-6 pt-10 relative z-10">
                    {/* Header row: Brand + Avatar */}
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-shaco-red" />
                                <span className={`text-[10px] font-bold tracking-[0.25em] uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    Premium Coffee
                                </span>
                            </div>
                            <h1 className={`text-3xl font-display font-black uppercase tracking-tight leading-none ${isDark ? 'text-white' : 'text-zinc-900'}`}>SHACO</h1>
                            <p className="text-shaco-red font-display text-sm tracking-[0.3em] font-bold uppercase -mt-0.5">COFFEE CO.</p>
                        </div>
                        <button
                            onClick={() => navigate('/settings')}
                            className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition ${isDark ? 'border-zinc-800 hover:border-zinc-600' : 'border-zinc-200 hover:border-zinc-400'}`}
                        >
                            {user?.avatar ? (
                                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'S'}&background=ef4444&color=fff&size=40`}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </button>
                    </motion.div>

                    {/* Greeting */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                            {greeting}, {user?.name?.split(' ')[0] || 'Misafir'} 👋
                        </h2>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            Bugün ne içmek istersiniz?
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="px-6">

                {/* Guest Registration Banner */}
                {isGuest && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className={`rounded-2xl p-5 mb-6 relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-shaco-red/20 to-zinc-900 border border-zinc-800' : 'bg-gradient-to-br from-red-50 to-white border border-zinc-200 shadow-lg'}`}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-shaco-red/10 rounded-full blur-2xl -translate-y-6 translate-x-6" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold tracking-[0.15em] px-2 py-0.5 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>MİSAFİR KULLANICI</span>
                            </div>
                            <h3 className={`text-[15px] font-bold mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Shaco Ailesine Katılın!</h3>
                            <p className={`text-[12px] mb-4 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                Kayıt olun, yıldız kazanın ve özel fırsatlardan yararlanın.
                            </p>
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/register')}
                                    className="flex-1 py-3 rounded-xl bg-shaco-red text-white font-bold text-[12px] flex items-center justify-center gap-2 shadow-lg shadow-red-500/15 active:scale-[0.97] transition">
                                    <UserPlus size={14} /> Kayıt Ol
                                </button>
                                <button onClick={() => navigate('/login')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-[12px] flex items-center justify-center gap-2 transition active:scale-[0.97] ${isDark ? 'bg-zinc-800 border border-zinc-700 text-zinc-300' : 'bg-white border border-zinc-200 text-zinc-600 shadow-sm'}`}>
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
                        className={`rounded-2xl p-4 mb-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Star size={13} className="text-yellow-500 fill-yellow-500" />
                                    <span className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>YILDIZ</span>
                                    <span className={`text-[10px] font-bold ml-auto ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{stars}/15</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min((stars / 15) * 100, 100)}%` }}
                                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                    />
                                </div>
                                <p className={`text-[9px] mt-1.5 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
                                    {stars >= 15 ? 'Ödül kazandın! 🎉' : `Ödüle ${15 - stars} yıldız kaldı`}
                                </p>
                            </div>
                            <div className={`w-px h-10 ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                            <div className="text-center px-2">
                                <p className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>BAKİYE</p>
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

                {/* Quick Actions */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-2 mb-7 overflow-x-auto no-scrollbar">
                    <QuickPill icon={<QrCode size={15} />} label="QR Öde" onClick={() => navigate('/pay')} isDark={isDark} />
                    <QuickPill icon={<Wallet size={15} />} label="Bakiye Yükle" onClick={() => navigate('/wallet')} isDark={isDark} />
                    <QuickPill icon={<Store size={15} />} label="Mağazalar" onClick={() => navigate('/stores')} isDark={isDark} />
                    <QuickPill icon={<Gift size={15} />} label="Kuponlar" isDark={isDark} accent />
                </motion.div>

                {/* Campaigns */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-7">
                    <SectionHeader title="Kampanyalar" action="Tümü" isDark={isDark} />
                    <div className="relative h-32 rounded-2xl overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCampaign}
                                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                                transition={{ duration: 0.35 }}
                                className={`absolute inset-0 bg-gradient-to-br ${campaigns[activeCampaign].gradient} rounded-2xl p-5 flex items-center justify-between`}
                            >
                                <div>
                                    <h4 className="text-base font-bold text-white mb-0.5">{campaigns[activeCampaign].title}</h4>
                                    <p className="text-xs text-white/60 mb-3">{campaigns[activeCampaign].subtitle}</p>
                                    <button className="bg-white/15 backdrop-blur text-white text-[11px] font-bold px-3.5 py-1.5 rounded-lg">Kullan →</button>
                                </div>
                                <span className="text-4xl">{campaigns[activeCampaign].emoji}</span>
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
                </motion.div>

                {/* Popular */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-7">
                    <SectionHeader title="Popüler" action="Menü" onAction={() => navigate('/menu')} isDark={isDark} />
                    <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
                        {popularProducts.map((product, i) => (
                            <motion.div key={product.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.08 }}
                                onClick={() => navigate(`/product/${product.id}`)}
                                className={`flex-shrink-0 w-36 rounded-2xl overflow-hidden cursor-pointer group ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}
                            >
                                <div className="relative h-28 overflow-hidden">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                </div>
                                <div className="p-2.5">
                                    <h4 className={`font-bold text-[12px] leading-tight truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{product.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-shaco-red text-[11px] font-bold">₺{product.price}</span>
                                        <span className={`text-[9px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>⭐ {product.rating}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* History shortcut */}
                <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setShowHistory(true)}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition ${isDark ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700' : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>
                            <History size={17} />
                        </div>
                        <div className="text-left">
                            <p className={`text-[13px] font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>Sipariş Geçmişi</p>
                            <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Son siparişleri gör</p>
                        </div>
                    </div>
                    <ChevronRight size={15} className={isDark ? 'text-zinc-700' : 'text-zinc-300'} />
                </motion.button>
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
                                                <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{order.name}</p>
                                                <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{order.time}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>-₺{order.price}</p>
                                            <p className="text-[10px] text-yellow-500 font-bold">+{order.stars} ⭐</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function QuickPill({ icon, label, onClick, isDark, accent }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 ${accent
                ? 'bg-shaco-red/10 text-shaco-red border border-shaco-red/20'
                : isDark ? 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700' : 'bg-white text-zinc-700 border border-zinc-200 shadow-sm hover:shadow-md'
                }`}
        > {icon} {label} </button>
    );
}

function SectionHeader({ title, action, onAction, isDark }) {
    return (
        <div className="flex justify-between items-center mb-3">
            <h3 className={`text-[13px] font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>{title}</h3>
            <button onClick={onAction} className="text-shaco-red text-[11px] font-bold flex items-center gap-1">{action} <ArrowRight size={11} /></button>
        </div>
    );
}
