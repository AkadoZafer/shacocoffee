import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useRewards } from '../context/RewardsContext';
import { useMembership } from '../context/MembershipContext';
import { User, CreditCard, History, HelpCircle, Shield, ChevronRight, LogOut, Moon, Sun, Star, Camera, ImageIcon, Save, X, MessageSquare, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

export default function Settings() {
    const { user, logout, updateAvatar, updateProfile, isGuest, isStaff } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { stars, balance, orders } = useRewards();
    const { getTierForStars } = useMembership();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        name: user?.firstName ? `${user.firstName} ${user.lastName}` : '',
        phone: user?.phone || '',
        birthDate: user?.birthDate || ''
    });

    const [supportPhone, setSupportPhone] = useState('');
    const [supportEmail, setSupportEmail] = useState('');
    const [showSupport, setShowSupport] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (docSnap) => {
            if (docSnap.exists()) {
                setSupportPhone(docSnap.data().supportPhone || '');
                setSupportEmail(docSnap.data().supportEmail || '');
            }
        });
        return () => unsubscribe();
    }, []);

    const isDark = theme === 'dark';
    const tier = getTierForStars(stars);

    const tierStyles = {
        orange: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
        zinc: { color: 'text-zinc-300', bg: 'bg-zinc-400/10', border: 'border-zinc-400/30' },
        yellow: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    };
    const membership = tierStyles[tier.color] || tierStyles.orange;

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = () => {
        updateProfile(formData);
        setEditMode(false);
    };

    const roleLabel = user?.role === 'admin' ? t('settings.account_section') : user?.role === 'barista' ? 'Barista' : user?.role === 'guest' ? t('settings.guest_role') : t('settings.customer');

    // Feedback State
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [feedbackAnonymous, setFeedbackAnonymous] = useState(false);
    const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

    const handleSubmitFeedback = async () => {
        if (feedbackRating < 1) {
            alert('Lütfen en az 1 yıldız veriniz.');
            return;
        }
        setIsSubmittingFeedback(true);
        try {
            await addDoc(collection(db, 'feedbacks'), {
                uid: auth.currentUser.uid,
                displayName: feedbackAnonymous ? 'Anonim' : (user?.firstName ? `${user.firstName} ${user.lastName}` : 'Kullanıcı'),
                rating: feedbackRating,
                comment: feedbackComment,
                isAnonymous: feedbackAnonymous,
                createdAt: serverTimestamp()
            });
            setShowFeedback(false);
            setFeedbackRating(0);
            setFeedbackComment('');
            setFeedbackAnonymous(false);
            alert(t('feedback.success'));
        } catch (error) {
            console.error('Feedback error:', error);
            alert(t('feedback.error'));
        } finally {
            setIsSubmittingFeedback(false);
        }
    };

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* Top gradient area */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-shaco-red/8 to-transparent h-48 pointer-events-none" />
                <div className="p-6 pt-10 relative z-10">
                    <motion.h1 initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-2xl font-display font-bold mb-0.5">{t('settings.personal_info').split(' ')[0]}</motion.h1>
                    <p className={`text-base tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('settings.account_section')} & {t('settings.general_section')}</p>
                </div>
            </div>

            <div className="px-6">
                {/* User Card */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className={`relative p-5 rounded-3xl mb-8 overflow-hidden ${isDark ? 'bg-gradient-to-br from-zinc-900 to-zinc-900/50 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-lg'}`}
                >
                    <div className="absolute top-0 right-0 w-28 h-28 bg-shaco-red/5 rounded-full blur-2xl -translate-y-8 translate-x-8" />

                    <div className="flex items-center gap-4 relative z-10">
                        {/* Avatar with upload */}
                        <div className="relative">
                            {/* Input without 'capture' attribute to allow gallery selection */}
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="avatar"
                                    className={`w-16 h-16 rounded-2xl object-cover shadow-lg shadow-red-500/20 ${!isGuest ? 'cursor-pointer' : ''}`}
                                    onClick={() => !isGuest && fileInputRef.current?.click()}
                                />
                            ) : (
                                <div
                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black uppercase ${isDark ? 'bg-gradient-to-br from-shaco-red to-red-700' : 'bg-gradient-to-br from-shaco-red to-red-600'} text-white shadow-lg shadow-red-500/20 ${!isGuest ? 'cursor-pointer' : ''}`}
                                    onClick={() => !isGuest && fileInputRef.current?.click()}
                                >
                                    {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'S'}
                                </div>
                            )}
                            {!isGuest && (
                                <div
                                    className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer ${isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-white border border-zinc-300 shadow-sm'}`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon size={12} className={isDark ? 'text-zinc-400' : 'text-zinc-500'} />
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full bg-transparent font-bold border-b text-lg focus:outline-none ${isDark ? 'border-zinc-700 text-white' : 'border-zinc-300 text-zinc-900'}`}
                                />
                            ) : (
                                <h2 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>{user?.firstName ? `${user.firstName} ${user.lastName}` : 'Misafir'}</h2>
                            )}

                            {!isGuest && (
                                <>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-base font-bold tracking-wider px-2 py-0.5 rounded-md border ${membership.bg} ${membership.color} ${membership.border}`}>
                                            {tier.emoji} {tier.label}
                                        </span>
                                        {tier.discount > 0 && (
                                            <span className="text-[15px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                                %{tier.discount} İndirim
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[15px] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                            <Star size={10} className="inline text-yellow-500 fill-yellow-500 -mt-0.5" /> {stars} yıldız
                                        </span>
                                        <span className={`text-base px-1.5 py-0.5 rounded ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                            {roleLabel}
                                        </span>
                                    </div>
                                </>
                            )}
                            {isGuest && (
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-base px-1.5 py-0.5 rounded ${isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-400'}`}>
                                        {roleLabel}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mini stats */}
                    {!isGuest && (
                        <div className={`flex gap-4 mt-4 pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                            <div className="flex-1 text-center">
                                <p className={`text-base tracking-wider font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{t('settings.balance').toUpperCase()}</p>
                                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>₺{balance.toFixed(0)}</p>
                            </div>
                            <div className={`w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                            <div className="flex-1 text-center">
                                <p className={`text-base tracking-wider font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{t('orders.title').toUpperCase()}</p>
                                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{orders.length}</p>
                            </div>
                            <div className={`w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                            <div className="flex-1 text-center">
                                <p className={`text-base tracking-wider font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{t('settings.coupon').toUpperCase()}</p>
                                <p className={`text-lg font-bold text-shaco-red`}>0</p>
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* HESAP */}
                {!isGuest && (
                    <>
                        <SectionLabel label={t('settings.account_section')} isDark={isDark} delay={0.15} />
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-7">
                            <div className={`rounded-3xl overflow-hidden shadow-sm border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                                {/* Personal Info Edit Section */}
                                <ProfileRow
                                    icon={<User size={17} />}
                                    iconBg="bg-red-500/10 text-red-400"
                                    label={t('settings.personal_info')}
                                    isDark={isDark}
                                    onClick={() => setEditMode(!editMode)}
                                    rightIcon={editMode ? <X size={16} /> : <ChevronRight size={15} />}
                                    isFirst={true}
                                />
                                <AnimatePresence>
                                    {editMode && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4">
                                            <div className="space-y-4 pt-2">
                                                <div className="space-y-1">
                                                    <label className={`text-base uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('settings.full_name')}</label>
                                                    <input
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className={`w-full p-3 rounded-xl text-base ${isDark ? 'bg-zinc-800/50 text-white' : 'bg-zinc-50 text-zinc-900'}`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={`text-base uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('settings.phone')}</label>
                                                    <input
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                        className={`w-full p-3 rounded-xl text-base ${isDark ? 'bg-zinc-800/50 text-white' : 'bg-zinc-50 text-zinc-900'}`}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className={`text-base uppercase font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('settings.birth_date')}</label>
                                                    <input
                                                        type="date"
                                                        value={formData.birthDate}
                                                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                                        className={`w-full p-3 rounded-xl text-base ${isDark ? 'bg-zinc-800/50 text-white' : 'bg-zinc-50 text-zinc-900'}`}
                                                    />
                                                </div>
                                                <button
                                                    onClick={handleSaveProfile}
                                                    className="w-full py-3 bg-shaco-red text-white text-base font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition"
                                                >
                                                    <Save size={16} /> {t('settings.save')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!isStaff && <ProfileRow icon={<CreditCard size={17} />} iconBg="bg-sky-500/10 text-sky-400" label={t('settings.payment_methods')} isDark={isDark} onClick={() => navigate('/wallet')} />}
                                <ProfileRow icon={<History size={17} />} iconBg="bg-emerald-500/10 text-emerald-400" label={t('settings.order_history')} isDark={isDark} onClick={() => navigate('/orders')} isLast={false} />
                                <ProfileRow icon={<MessageSquare size={17} />} iconBg="bg-yellow-500/10 text-yellow-500" label={t('settings.feedback')} isDark={isDark} onClick={() => setShowFeedback(true)} isLast={true} />
                            </div>
                        </motion.div>
                    </>
                )}

                {/* GENEL */}
                <SectionLabel label={t('settings.general_section')} isDark={isDark} delay={0.25} />
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-7">
                    <div className={`rounded-3xl overflow-hidden shadow-sm border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                        <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-zinc-800/80 hover:bg-zinc-800/30' : 'border-zinc-100/80 hover:bg-zinc-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                    {isDark ? <Sun size={17} /> : <Moon size={17} />}
                                </div>
                                <span className={`text-[15px] font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{t('settings.dark_mode')}</span>
                            </div>
                            <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-all duration-300 relative ${isDark ? 'bg-shaco-red' : 'bg-zinc-300'}`}>
                                <div className={`bg-white rounded-full absolute top-[3px] transition-all duration-300 shadow-sm ${isDark ? 'left-[22px]' : 'left-[3px]'}`} style={{ width: 18, height: 18 }} />
                            </button>
                        </div>

                        {/* Dil Seçimi */}
                        <div className={`p-4 flex items-center justify-between border-b ${isDark ? 'border-zinc-800/80 hover:bg-zinc-800/30' : 'border-zinc-100/80 hover:bg-zinc-50'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${isDark ? 'bg-zinc-700/60' : 'bg-zinc-100'}`}>
                                    🌐
                                </div>
                                <span className={`text-[15px] font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{t('settings.language')}</span>
                            </div>
                            <button
                                onClick={() => i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black tracking-wider transition-all active:scale-90 border ${isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:border-shaco-red/50' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:border-shaco-red/50'}`}
                            >
                                <img
                                    src={i18n.language === 'tr' ? 'https://flagcdn.com/24x18/tr.png' : 'https://flagcdn.com/24x18/gb.png'}
                                    alt={i18n.language === 'tr' ? 'TR' : 'EN'}
                                    className="w-6 h-[18px] rounded-sm object-cover"
                                />
                                <span>{i18n.language === 'tr' ? 'TR' : 'EN'}</span>
                            </button>
                        </div>

                        <ProfileRow
                            icon={<HelpCircle size={17} />}
                            iconBg="bg-violet-500/10 text-violet-400"
                            label={t('settings.help_support')}
                            subtitle={t('settings.contact_us')}
                            isDark={isDark}
                            onClick={() => setShowSupport(!showSupport)}
                            rightIcon={showSupport ? <X size={16} /> : <ChevronRight size={15} />}
                            isLast={!showSupport}
                        />
                        <AnimatePresence>
                            {showSupport && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-4 pb-4 bg-black/5 dark:bg-white/5 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="pt-4 space-y-2">
                                        <p className={`text-xs uppercase font-bold tracking-wider mb-2 ml-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{t('settings.contact_channels')}</p>
                                        <a href={`tel:${supportPhone || '+905536970907'}`} className={`w-full p-3 rounded-xl flex items-center gap-3 transition active:scale-[0.98] ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-zinc-50 shadow-sm'}`}>
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">📞</div>
                                            <div className="flex-1 text-left">
                                                <p className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('settings.contact_us')}</p>
                                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{supportPhone || '+90 (553) 697 09 07'}</p>
                                            </div>
                                        </a>
                                        <a href={`mailto:${supportEmail || 'iletisim@shacocoffee.com'}`} className={`w-full p-3 rounded-xl flex items-center gap-3 transition active:scale-[0.98] ${isDark ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-white hover:bg-zinc-50 shadow-sm'}`}>
                                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✉️</div>
                                            <div className="flex-1 text-left">
                                                <p className={`text-[15px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('settings.email')}</p>
                                                <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{supportEmail || 'iletisim@shacocoffee.com'}</p>
                                            </div>
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Logout / Login for Guests */}
                {isGuest ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="space-y-2">
                        <button
                            onClick={() => navigate('/login')}
                            className={`w-full p-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition active:scale-[0.98] bg-shaco-red text-white shadow-lg shadow-red-500/15`}
                        >
                            <LogOut size={16} /> {t('login.login') || 'Giriş Yap'}
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className={`w-full p-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-white border border-zinc-200 text-zinc-700 shadow-sm'}`}
                        >
                            <LogOut size={16} /> Kayıt Ol
                        </button>
                    </motion.div>
                ) : (
                    <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        onClick={() => setShowLogoutConfirm(true)}
                        className={`w-full p-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2.5 transition active:scale-[0.98] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-500/5' : 'bg-white border border-zinc-200 text-red-500 hover:bg-red-50 shadow-sm'}`}
                    >
                        <LogOut size={16} /> Çıkış Yap
                    </motion.button>
                )}
            </div>

            {/* Logout Confirm */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={() => setShowLogoutConfirm(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-xs rounded-3xl p-6 text-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500"><LogOut size={24} /></div>
                            <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Çıkış Yap</h3>
                            <p className={`text-base mb-6 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Hesabından çıkmak istediğine emin misin?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowLogoutConfirm(false)} className={`flex-1 py-3 rounded-xl font-bold text-base ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>Vazgeç</button>
                                <button onClick={() => { setShowLogoutConfirm(false); logout(); }} className="flex-1 py-3 rounded-xl font-bold text-base bg-red-500 text-white">Çıkış</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {showFeedback && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowFeedback(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-zinc-900'}`}>Deneyimini Paylaş</h3>
                                <button onClick={() => setShowFeedback(false)} className={`p-1.5 rounded-lg ${isDark ? 'bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-zinc-900'}`}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Stars */}
                            <div className="flex justify-center gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackRating(star)}
                                        className="transition-transform active:scale-90"
                                    >
                                        <Star size={32} className={`${feedbackRating >= star ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-zinc-700' : 'text-zinc-300'}`} />
                                    </button>
                                ))}
                            </div>

                            {/* Comment Box */}
                            <div className="mb-4">
                                <textarea
                                    value={feedbackComment}
                                    onChange={(e) => setFeedbackComment(e.target.value)}
                                    maxLength={300}
                                    placeholder="Görüşlerinizi bizimle paylaşın..."
                                    className={`w-full p-3 rounded-xl border h-28 resize-none text-[15px] outline-none transition-colors ${isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-white focus:border-shaco-red focus:bg-zinc-800' : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-shaco-red focus:bg-white'}`}
                                />
                                <div className={`text-right text-[11px] mt-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    {feedbackComment.length} / 300
                                </div>
                            </div>

                            {/* Anonymous Toggle */}
                            <label className="flex items-center gap-3 mb-6 cursor-pointer">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${feedbackAnonymous ? 'bg-shaco-red border-shaco-red' : isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-300 bg-zinc-50'}`}>
                                    {feedbackAnonymous && <Check size={14} className="text-white" />}
                                </div>
                                <input type="checkbox" checked={feedbackAnonymous} onChange={(e) => setFeedbackAnonymous(e.target.checked)} className="hidden" />
                                <span className={`text-[15px] font-medium select-none ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>Anonim gönder</span>
                            </label>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmitFeedback}
                                disabled={isSubmittingFeedback || feedbackRating < 1}
                                className={`w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center transition-all ${isSubmittingFeedback || feedbackRating < 1 ? (isDark ? 'bg-zinc-800 text-zinc-600' : 'bg-zinc-200 text-zinc-400') : 'bg-shaco-red text-white hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-[0.98]'}`}
                            >
                                {isSubmittingFeedback ? 'Gönderiliyor...' : 'Gönder'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function SectionLabel({ label, isDark, delay }) {
    return (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay }}
            className={`text-base font-bold tracking-[0.2em] mb-2.5 ml-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}
        >{label}</motion.p>
    );
}

function ProfileRow({ icon, iconBg, label, subtitle, isDark, onClick, rightIcon, isFirst, isLast }) {
    return (
        <button onClick={onClick}
            className={`w-full p-4 flex items-center justify-between transition active:bg-black/5 ${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50/50'} ${!isLast ? (isDark ? 'border-b border-zinc-800/80' : 'border-b border-zinc-100/80') : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
                <div className="text-left">
                    <span className={`text-[15px] font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>{label}</span>
                    {subtitle && <p className={`text-base -mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{subtitle}</p>}
                </div>
            </div>
            {rightIcon || <ChevronRight size={15} className={isDark ? 'text-zinc-700' : 'text-zinc-300'} />}
        </button>
    );
}
