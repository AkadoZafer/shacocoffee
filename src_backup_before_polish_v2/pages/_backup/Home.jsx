import { useRewards } from '../context/RewardsContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, History, Coffee, CreditCard, Wallet, Settings as SettingsIcon, X, Check, Edit2, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import logo from '../assets/logo.png';
import { useTheme } from '../context/ThemeContext';
import CampaignSlider from '../components/CampaignSlider';

export default function Home() {
    const { stars, balance, transactions } = useRewards();
    const { user, updateProfile } = useAuth();
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [newName, setNewName] = useState('');

    // Time-based Greeting
    const [greeting, setGreeting] = useState('Welcome');
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Günaydın');
        else if (hour < 18) setGreeting('Tünaydın');
        else setGreeting('İyi Akşamlar');
    }, []);

    useEffect(() => {
        if (user?.name) setNewName(user.name);
    }, [user]);

    const handleSaveProfile = () => {
        if (newName.trim()) {
            updateProfile(newName);
            setShowProfileEdit(false);
        }
    };

    // Membership Logic
    const getMembership = () => {
        if (stars < 10) return { label: 'BRONZE MEMBER', color: 'text-orange-400', border: 'border-orange-400' };
        if (stars < 30) return { label: 'SILVER MEMBER', color: 'text-zinc-300', border: 'border-zinc-300' };
        return { label: 'GOLD MEMBER', color: 'text-yellow-400', border: 'border-yellow-400' };
    };
    const membership = getMembership();

    return (
        <div className={`min-h-screen p-6 pb-32 flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* Header / Identity */}
            <header className="flex justify-between items-center mb-8 mt-2">
                <div>
                    <h2 className={`font-display uppercase tracking-[0.2em] text-xs mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>{greeting},</h2>
                    {/* Removed neon-text, kept bold font */}
                    <h1 className={`text-3xl font-display font-bold uppercase leading-none ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{user?.name || 'TRAVELLER'}</h1>
                </div>
                <div onClick={() => setShowProfileEdit(true)} className="relative group cursor-pointer active:scale-95 transition">
                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${membership.border} p-1 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]`}>
                        <img src={logo} alt="Profile" className={`w-full h-full object-cover rounded-full ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                    </div>
                </div>
            </header>

            {/* Membership Badge */}
            <div className="mb-6">
                {/* ... (Badge code same as before) */}
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${membership.border} border border-opacity-30 bg-white/10 dark:bg-zinc-900`}>
                    <Star size={12} className={membership.color} fill="currentColor" />
                    <span className={`text-[10px] font-bold tracking-widest uppercase ${membership.color}`}>{membership.label}</span>
                </div>
            </div>

            {/* Campaign Slider */}
            <CampaignSlider />

            {/* Quick Order (Favorites) Row */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-bold tracking-widest text-xs uppercase ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-600'}`}>Hızlı Sipariş</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`flex-shrink-0 p-4 rounded-2xl flex items-center gap-3 border transition cursor-pointer active:scale-95 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 shadow-sm hover:border-zinc-300'}`}>
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-500">
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>White Mocha</p>
                                <p className="text-[10px] text-zinc-500">Standart • 85₺</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Card (Click to open History) */}
            <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowHistory(true)}
                className="relative overflow-hidden cursor-pointer group shadow-2xl rounded-3xl p-6 mb-8 bg-gradient-to-b from-zinc-800 to-zinc-900 border border-white/5 hover:border-white/10 transition-all duration-300"
            >
                {/* ... (Stats card content same as before) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-shaco-red/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition" />

                <div className="relative z-10 flex justify-between items-end mb-4">
                    <div>
                        <p className={`font-bold text-[10px] tracking-widest mb-1 ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>YILDIZ BAKİYESİ</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">{stars}</span>
                            <span className="text-zinc-500 font-bold text-sm">/ 15</span>
                        </div>
                    </div>
                    <div>
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-white/10 group-hover:text-white transition-all duration-300 border border-white/5">
                            <History size={20} />
                        </div>
                    </div>
                </div>

                {/* Progress */}
                <div className="relative z-10 w-full h-2 bg-zinc-900/50 rounded-full overflow-hidden mb-4 border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stars / 15) * 100}%` }}
                        className="h-full bg-gradient-to-r from-shaco-red to-red-600 shadow-[0_0_15px_#ef4444]"
                    />
                </div>

                {/* Wallet Balance Row */}
                <div className="relative z-10 flex justify-between items-center pt-4 border-t border-zinc-200 dark:border-white/5">
                    <span className="text-[10px] font-bold tracking-widest text-zinc-400">CÜZDAN BAKİYESİ</span>
                    <span className="text-2xl font-bold text-white">₺{balance.toFixed(2)}</span>
                </div>
            </motion.div>

            {/* 2x2 Action Grid */}
            <div className="grid grid-cols-2 gap-4 flex-1">
                <DashboardCard
                    title="Menü" // Menu -> Menü
                    icon={<Coffee size={32} />}
                    color="bg-orange-500/20 text-orange-400"
                    onClick={() => navigate('/menu')}
                    delay={0.1}
                />
                <DashboardCard
                    title="Öde" // Pay & Earn -> Öde
                    icon={<CreditCard size={32} />}
                    color="bg-shaco-red/20 text-shaco-red"
                    onClick={() => navigate('/pay')}
                    delay={0.2}
                />
                <DashboardCard
                    title="Cüzdan" // Wallet -> Cüzdan
                    icon={<Wallet size={32} />}
                    color="bg-blue-500/20 text-blue-400"
                    onClick={() => navigate('/wallet')}
                    delay={0.3}
                />
                <DashboardCard
                    title="Ayarlar" // Settings -> Ayarlar
                    icon={<SettingsIcon size={32} />}
                    color="bg-zinc-500/20 text-zinc-400"
                    onClick={() => navigate('/settings')}
                    delay={0.4}
                />
            </div>

            {/* History Modal (Popup) */}
            <AnimatePresence>
                {showHistory && (
                    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="bg-zinc-50 dark:bg-zinc-900 w-full max-w-md rounded-t-3xl p-6 border-t border-zinc-200 dark:border-white/10 max-h-[70vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white">Geçmiş Siparişler</h2>
                                <button onClick={() => setShowHistory(false)} className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="overflow-y-auto space-y-4 pr-2">
                                {/* Only Dummy Data for now */}
                                <div className="flex justify-between items-center p-3 bg-white dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-transparent">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-shaco-red/20 p-2 rounded-full text-shaco-red"><Coffee size={16} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white">Latte Siparişi</p>
                                            <p className="text-xs text-zinc-500">Bugün, 14:30</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">-₺85.00</p>
                                        <p className="text-xs text-yellow-500 font-bold">+5 Yıldız</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showProfileEdit && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={() => setShowProfileEdit(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-6 border border-zinc-200 dark:border-white/10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button onClick={() => setShowProfileEdit(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-black dark:hover:text-white">
                                <X size={20} />
                            </button>

                            <h2 className="text-xl font-display font-bold text-zinc-900 dark:text-white mb-6 text-center">Profili Düzenle</h2>

                            <div className="w-24 h-24 mx-auto mb-6 relative">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-shaco-red">
                                    <img src={logo} alt="Profile" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 right-0 bg-white text-black p-2 rounded-full cursor-pointer hover:bg-gray-200 shadow-md">
                                    <Edit2 size={14} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-2 block">Kullanıcı Adı</label>
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="w-full bg-zinc-100 dark:bg-black/50 border border-zinc-300 dark:border-zinc-700 rounded-xl p-4 text-zinc-900 dark:text-white font-bold focus:border-shaco-red outline-none transition"
                                    />
                                </div>

                                <button
                                    onClick={handleSaveProfile}
                                    className="w-full bg-shaco-red text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-red-600 transition flex items-center justify-center gap-2"
                                >
                                    <Check size={18} /> Kaydet
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}

function DashboardCard({ title, icon, color, onClick, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            onClick={onClick}
            className="group rounded-3xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 active:scale-95 shadow-lg aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800 hover:border-white/20 hover:shadow-xl hover:-translate-y-1"
        >
            <div className={`p-4 rounded-full ${color} transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/10 group-hover:text-white`}>
                {icon}
            </div>
            <span className="text-sm font-bold text-zinc-400 font-display uppercase tracking-wider group-hover:text-white transition-colors duration-300">{title}</span>
        </motion.div>
    );
}
