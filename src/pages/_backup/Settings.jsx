import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useRewards } from '../context/RewardsContext';
import { Moon, Sun, Globe, History, Briefcase, Info, LogOut, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Settings() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { lang, toggleLang, t } = useLanguage();
    const { stars, balance } = useRewards();

    const [activeSheet, setActiveSheet] = useState(null); // 'franchise' | 'about' | 'locations'
    const location = useLocation();

    // Removed useEffect for openHistory as it's no longer relevant

    const Sheet = ({ title, children, onClose }) => (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className={`w-full max-w-md rounded-t-3xl p-6 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border-t shadow-2xl overflow-y-auto max-h-[80vh] pb-12`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-12 h-1 bg-zinc-500/20 rounded-full mx-auto mb-6" />
                <h2 className={`text-2xl font-bold font-display mb-6 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{title}</h2>
                {children}
            </motion.div>
        </div>
    );

    const SettingsButton = ({ icon, label, color, onClick, theme }) => (
        <button
            onClick={onClick}
            className={`w-full p-4 rounded-3xl flex items-center justify-between transition-all duration-200 ease-out
                       ${theme === 'dark' ? 'glass-dark border border-white/5 hover:border-white/10' : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md'}`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${color}`}>
                    {icon}
                </div>
                <div className="text-left">
                    <span className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{label}</span>
                </div>
            </div>
            <ChevronRight size={20} className="opacity-30" />
        </button>
    );

    return (
        <div className={`min-h-screen p-6 pb-32 pt-12 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <h1 className={`text-4xl font-display font-bold mb-8 uppercase tracking-wide ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Ayarlar</h1>

            {/* Profile Section */}
            <div className={`p-6 rounded-3xl border mb-6 flex items-center gap-4 ${theme === 'dark' ? 'glass-dark border-white/5' : 'bg-white border-zinc-200 shadow-sm'}`}>
                <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-shaco-red">
                    <img src="https://ui-avatars.com/api/?name=Zafer&background=ef4444&color=fff" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h2 className={`text-xl font-bold font-display ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>{user?.name || 'Guest'}</h2>
                    {/* Removed CHAOS MEMBER text */}
                </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-1 gap-4">
                <SettingsButton
                    icon={<Globe size={20} />}
                    label="Bayilerimiz"
                    color="text-green-500 bg-green-500/10"
                    onClick={() => setActiveSheet('locations')}
                    theme={theme}
                />
                <SettingsButton
                    icon={<Briefcase size={20} />}
                    label="Bayilik Başvurusu"
                    color="text-shaco-red bg-shaco-red/10"
                    onClick={() => setActiveSheet('franchise')}
                    theme={theme}
                />
                <SettingsButton
                    icon={<Info size={20} />}
                    label="Hakkımızda"
                    color="text-blue-500 bg-blue-500/10"
                    onClick={() => setActiveSheet('about')}
                    theme={theme}
                />
            </div>

            {/* Toggles */}
            <div className={`mt-8 p-6 rounded-3xl border ${theme === 'dark' ? 'glass-dark border-white/5' : 'bg-white border-zinc-200 shadow-sm'} space-y-6`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-purple-500/10 text-purple-600'}`}>
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </div>
                        <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Görünüm</span>
                    </div>
                    <button onClick={toggleTheme} className={`px-4 py-2 rounded-full text-xs font-bold border ${theme === 'dark' ? 'border-white/20 text-white hover:bg-white/10' : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>
                        {theme === 'dark' ? 'Koyu Mod' : 'Açık Mod'}
                    </button>
                </div>
            </div>

            <button onClick={logout} className="mt-8 w-full p-4 rounded-xl bg-zinc-900 text-red-500 font-bold border border-zinc-800 hover:bg-zinc-800 transition flex items-center justify-center gap-2">
                <LogOut size={18} />
                Çıkış Yap
            </button>

            {/* Sheets */}
            <AnimatePresence>
                {activeSheet && (
                    <Sheet title={activeSheet === 'locations' ? 'Bayilerimiz' : activeSheet === 'franchise' ? 'Bayilik' : 'Hakkımızda'} onClose={() => setActiveSheet(null)}>
                        {activeSheet === 'locations' && (
                            <div className="space-y-4">
                                <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
                                    <h3 className={`font-bold text-lg mb-1 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Shaco Konya (Merkez)</h3>
                                    <p className="text-zinc-500 text-sm mb-4">Melikşah, Melikşah Cd. NO:121/A, 42090 Meram/Konya</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-shaco-red text-white py-2 rounded-lg font-bold text-sm hover:bg-red-600 transition"
                                            onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Melikşah,+Melikşah+Cd.+NO:121/A,+42090+Meram/Konya')}
                                        >
                                            Yol Tarifi
                                        </button>
                                        <button className={`flex-1 py-2 rounded-lg font-bold text-sm border ${theme === 'dark' ? 'border-zinc-600 text-zinc-300 hover:bg-zinc-700' : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100'}`}
                                            onClick={() => window.open('tel:+905555555555')}
                                        >
                                            Ara
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSheet === 'franchise' && (
                            <div className="space-y-4">
                                <p className={`opacity-80 leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    Shaco Coffee Co. ailesine katılın! Kaosu yaymaya hazır ortaklar arıyoruz.
                                </p>
                                <input type="text" placeholder="Ad Soyad" className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-black/40 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black'} border`} />
                                <input type="email" placeholder="E-posta" className={`w-full p-3 rounded-lg ${theme === 'dark' ? 'bg-black/40 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-black'} border`} />
                                <button className="w-full bg-shaco-red text-white font-bold py-3 rounded-xl shadow-lg">Başvuruyu Gönder</button>
                            </div>
                        )}

                        {activeSheet === 'about' && (
                            <div className="space-y-4">
                                <p className={`opacity-80 leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                                    Shaco Coffee Co. 2026 yılında basit bir misyonla kuruldu: Günlük rutininize biraz kaos getirmek.
                                </p>
                            </div>
                        )}
                    </Sheet>
                )}
            </AnimatePresence>
        </div>
    );
}
