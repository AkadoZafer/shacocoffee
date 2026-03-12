import { CreditCard, Plus, ArrowUpRight, Zap, Check, Wallet as WalletIcon } from 'lucide-react';
import { useRewards } from '../context/RewardsContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useTranslation } from 'react-i18next';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const quickAmounts = [25, 50, 100, 200, 500];

export default function Wallet() {
    const { balance, topUpBalance } = useRewards();
    const { theme } = useTheme();
    const { isGuest, user } = useAuth();
    const navigate = useNavigate();
    const [selectedAmount, setSelectedAmount] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [showAddCardModal, setShowAddCardModal] = useState(false);
    const [cards, setCards] = useState([]);
    const [isCardsLoading, setIsCardsLoading] = useState(true);
    const [isSavingCard, setIsSavingCard] = useState(false);
    const [cardForm, setCardForm] = useState({
        holderName: '',
        number: '',
        expiry: '',
        nickname: ''
    });
    const { addToast } = useToast();
    const isDark = theme === 'dark';
    const { t } = useTranslation();

    const detectCardBrand = (rawDigits) => {
        if (rawDigits.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(rawDigits)) return 'mastercard';
        return 'card';
    };

    const formatCardNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const formatExpiry = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    const isCardNumberValid = (digits) => digits.length >= 12 && digits.length <= 19;

    const isExpiryValid = (expiryValue) => {
        const match = expiryValue.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;
        const month = Number(match[1]);
        const year = Number(match[2]);
        if (month < 1 || month > 12) return false;

        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        return true;
    };

    const persistCards = async (nextCards) => {
        if (!user?.uid) return false;
        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                savedCards: nextCards,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            try {
                await setDoc(userRef, {
                    savedCards: nextCards,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
                return true;
            } catch (fallbackError) {
                console.error('Card save failed:', fallbackError);
                return false;
            }
        }
    };

    useEffect(() => {
        const loadSavedCards = async () => {
            if (isGuest || !user?.uid) {
                setCards([]);
                setIsCardsLoading(false);
                return;
            }

            setIsCardsLoading(true);
            try {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const savedCards = userSnap.exists() && Array.isArray(userSnap.data()?.savedCards)
                    ? userSnap.data().savedCards
                    : [];
                setCards(savedCards);
            } catch (error) {
                console.error('Cards fetch failed:', error);
                addToast(t('wallet.cards_load_error'), 'error');
                setCards([]);
            } finally {
                setIsCardsLoading(false);
            }
        };

        void loadSavedCards();
    }, [isGuest, user?.uid, addToast, t]);

    const handleTopUp = () => {
        if (isGuest) {
            setShowAuthPrompt(true);
            return;
        }
        const amount = selectedAmount || parseInt(customAmount);
        if (!amount || amount <= 0) return;

        topUpBalance(amount);
        addToast(t('wallet.topup_success', { amount }), 'success');
        setSelectedAmount(null);
        setCustomAmount('');
    };

    const activeAmount = selectedAmount || parseInt(customAmount) || 0;

    const resetCardForm = () => {
        setCardForm({
            holderName: '',
            number: '',
            expiry: '',
            nickname: ''
        });
    };

    const handleAddCard = async () => {
        if (isGuest || !user?.uid) {
            setShowAuthPrompt(true);
            return;
        }

        const holderName = cardForm.holderName.trim();
        const digits = cardForm.number.replace(/\D/g, '');
        const expiry = cardForm.expiry;
        const nickname = cardForm.nickname.trim();

        if (!holderName || !isCardNumberValid(digits) || !isExpiryValid(expiry)) {
            addToast(t('wallet.invalid_card_form'), 'error');
            return;
        }

        const [expMonth, expYear] = expiry.split('/');
        const newCard = {
            id: `card_${Date.now()}`,
            brand: detectCardBrand(digits),
            last4: digits.slice(-4),
            holderName,
            expMonth,
            expYear,
            nickname: nickname || null,
            isDefault: cards.length === 0,
            createdAt: new Date().toISOString()
        };

        const nextCards = cards.length === 0
            ? [newCard]
            : [...cards, { ...newCard, isDefault: false }];

        setIsSavingCard(true);
        try {
            const ok = await persistCards(nextCards);
            if (!ok) {
                addToast(t('wallet.card_save_error'), 'error');
                return;
            }
            setCards(nextCards);
            setShowAddCardModal(false);
            resetCardForm();
            addToast(t('wallet.card_saved_success'), 'success');
        } finally {
            setIsSavingCard(false);
        }
    };

    const handleSetDefaultCard = async (cardId) => {
        if (isGuest || !user?.uid) return;
        const nextCards = cards.map(card => ({ ...card, isDefault: card.id === cardId }));
        const ok = await persistCards(nextCards);
        if (!ok) {
            addToast(t('wallet.card_save_error'), 'error');
            return;
        }
        setCards(nextCards);
        addToast(t('wallet.default_card_updated'), 'success');
    };

    const handleRemoveCard = async (cardId) => {
        if (isGuest || !user?.uid) return;
        const filtered = cards.filter(card => card.id !== cardId);
        const nextCards = filtered.map((card, idx) => ({
            ...card,
            isDefault: filtered.some(c => c.isDefault) ? card.isDefault : idx === 0
        }));

        const ok = await persistCards(nextCards);
        if (!ok) {
            addToast(t('wallet.card_save_error'), 'error');
            return;
        }
        setCards(nextCards);
        addToast(t('wallet.card_removed'), 'success');
    };

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${isDark ? 'bg-shaco-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>


            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-xl transition active:scale-90 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>
                    </button>
                    <h1 className="text-xl font-display font-bold">{t('wallet.title')}</h1>
                </div>
            </div>

            {/* Balance Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-white/10 p-6 rounded-3xl relative overflow-hidden mb-8 shadow-xl"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-shaco-red/8 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-shaco-red/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <WalletIcon size={14} className="text-zinc-500" />
                        <p className="text-zinc-500 text-base font-bold tracking-[0.2em]">{t('wallet.total_balance')}</p>
                    </div>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl text-shaco-red font-bold">₺</span>
                        <h2 className="text-5xl font-display font-bold text-white tracking-tighter">{balance.toFixed(0)}</h2>
                        <span className="text-lg text-zinc-600 font-bold">.{(balance % 1).toFixed(2).slice(2)}</span>
                    </div>

                    {/* Shaco Brand */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className="w-1 h-1 rounded-full bg-shaco-red" />
                        <span className="text-[15px] text-zinc-600 font-bold tracking-[0.2em]">SHACO COFFEE</span>
                    </div>
                </div>
            </motion.div>

            {/* Quick Top-Up Section */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={13} className="text-amber-500" />
                    <p className={`text-base font-bold tracking-[0.15em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('wallet.quick_label')}</p>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-4">
                    {quickAmounts.map((amount) => (
                        <button
                            key={amount}
                            onClick={async () => {
                                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                setSelectedAmount(amount); setCustomAmount('');
                            }}
                            className={`py-3 rounded-xl text-center transition-all duration-300 active:scale-95 ${selectedAmount === amount
                                ? 'bg-shaco-red text-white shadow-neon-red hover:shadow-neon-red-strong'
                                : isDark
                                    ? 'bg-zinc-900/80 border border-white/5 text-zinc-400 hover:border-zinc-700 hover:shadow-glass hover:bg-zinc-800/80'
                                    : 'bg-white border border-zinc-200/50 text-zinc-600 hover:border-zinc-300 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <p className="text-[15px] font-bold">₺{amount}</p>
                        </button>
                    ))}
                </div>

                {/* Custom Amount */}
                <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 transition-all duration-300 glass-panel ${isDark ? 'bg-zinc-900/60 border border-white/5 focus-within:border-zinc-700 focus-within:shadow-glass' : 'bg-white/80 border border-zinc-200/50 shadow-sm focus-within:border-zinc-300 focus-within:shadow-md'}`}>
                    <span className={`text-lg font-bold ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>₺</span>
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                        placeholder={t('wallet.custom_placeholder')}
                        className={`flex-1 bg-transparent outline-none text-base font-display ${isDark ? 'text-white placeholder:text-zinc-700' : 'text-zinc-900 placeholder:text-zinc-400'}`}
                    />
                </div>

                {/* Load Button */}
                <button
                    onClick={async () => {
                        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                        handleTopUp();
                    }}
                    disabled={activeAmount <= 0}
                    className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 ${activeAmount > 0
                        ? 'bg-shaco-red text-white shadow-neon-red hover:shadow-neon-red-strong'
                        : isDark ? 'bg-zinc-900/50 border border-white/5 text-zinc-700 cursor-not-allowed' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        }`}
                >
                    <ArrowUpRight size={16} />
                    {activeAmount > 0 ? t('wallet.load_button', { amount: activeAmount }) : t('wallet.select_amount')}
                </button>
            </motion.div>

            {/* Payment Methods */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                        <CreditCard size={13} className={isDark ? 'text-zinc-600' : 'text-zinc-400'} />
                        <h3 className={`text-base font-bold tracking-[0.15em] ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('wallet.my_cards')}</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (isGuest) {
                                setShowAuthPrompt(true);
                                return;
                            }
                            setShowAddCardModal(true);
                        }}
                        className="text-shaco-red hover:text-red-400 transition p-1 active:scale-95"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {isCardsLoading ? (
                    <div className={`p-4 rounded-2xl text-center text-base ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-500' : 'bg-white border border-zinc-200 text-zinc-400'}`}>
                        {t('wallet.cards_loading')}
                    </div>
                ) : cards.length === 0 ? (
                    <div className={`p-4 rounded-2xl text-center text-base ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-500' : 'bg-white border border-zinc-200 text-zinc-400'}`}>
                        {t('wallet.no_cards')}
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                onClick={() => handleSetDefaultCard(card.id)}
                                className={`p-4 rounded-2xl flex items-center gap-4 transition active:scale-[0.98] cursor-pointer ${isDark ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700' : 'bg-white border border-zinc-200 shadow-sm hover:shadow-md'}`}
                            >
                                <div className={`w-10 h-7 rounded flex items-center justify-center font-bold italic text-[9px] flex-shrink-0 ${card.brand === 'visa'
                                    ? 'bg-gradient-to-br from-blue-200 to-blue-500 text-blue-950 border border-blue-600'
                                    : card.brand === 'mastercard'
                                        ? 'bg-gradient-to-br from-red-200 to-red-500 text-red-950 border border-red-600'
                                        : isDark
                                            ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                                    }`}
                                >
                                    {card.brand === 'visa' ? 'VISA' : card.brand === 'mastercard' ? 'MC' : 'CARD'}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-display font-bold tracking-widest text-[14px] ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                        •••• {card.last4}
                                    </p>
                                    <p className={`text-[15px] font-mono tracking-widest mt-0.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                        {(card.nickname || card.brand || 'Card').toUpperCase()} • {card.expMonth}/{card.expYear}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void handleRemoveCard(card.id);
                                    }}
                                    className={`p-1.5 rounded-lg active:scale-95 ${isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}
                                    aria-label={t('wallet.remove_card')}
                                >
                                    <Plus size={14} className="rotate-45" />
                                </button>
                                <div className={`w-2.5 h-2.5 rounded-full ${card.isDefault ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : `border ${isDark ? 'border-zinc-700' : 'border-zinc-300'}`}`} />
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Auth Prompt Modal for Guests */}
            <AnimatePresence>
                {showAddCardModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={() => { if (!isSavingCard) setShowAddCardModal(false); }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-sm rounded-3xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('wallet.add_card')}</h3>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={cardForm.holderName}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, holderName: e.target.value }))}
                                    placeholder={t('wallet.card_holder')}
                                    className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
                                />
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={cardForm.number}
                                    onChange={(e) => setCardForm(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                                    placeholder={t('wallet.card_number')}
                                    className={`w-full p-3 rounded-xl border outline-none font-mono ${isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={cardForm.expiry}
                                        onChange={(e) => setCardForm(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                                        placeholder={t('wallet.expiry')}
                                        className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
                                    />
                                    <input
                                        type="text"
                                        value={cardForm.nickname}
                                        onChange={(e) => setCardForm(prev => ({ ...prev, nickname: e.target.value }))}
                                        placeholder={t('wallet.card_label_optional')}
                                        className={`w-full p-3 rounded-xl border outline-none ${isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400'}`}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2.5 mt-5">
                                <button
                                    type="button"
                                    onClick={() => setShowAddCardModal(false)}
                                    disabled={isSavingCard}
                                    className={`flex-1 py-3 rounded-xl font-bold text-base transition active:scale-95 ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}
                                >
                                    {t('wallet.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAddCard}
                                    disabled={isSavingCard}
                                    className="flex-1 py-3 rounded-xl font-bold text-base bg-shaco-red text-white active:scale-95 transition"
                                >
                                    {isSavingCard ? t('wallet.saving') : t('wallet.save_card')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
                {showAuthPrompt && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6" onClick={() => setShowAuthPrompt(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className={`w-full max-w-xs rounded-3xl p-6 text-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <WalletIcon size={24} />
                            </div>
                            <h3 className={`font-bold text-lg mb-1 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{t('wallet.auth_required')}</h3>
                            <p className={`text-base mb-5 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{t('wallet.auth_required_desc')}</p>
                            <div className="flex gap-2.5">
                                <button onClick={() => navigate('/login')}
                                    className={`flex-1 py-3 rounded-xl font-bold text-base transition ${isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'}`}>
                                    {t('home.login')}
                                </button>
                                <button onClick={() => navigate('/register')}
                                    className="flex-1 py-3 rounded-xl font-bold text-base bg-shaco-red text-white">
                                    {t('settings.register')}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
