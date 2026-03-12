import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Check } from 'lucide-react';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user, completeRegistration } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!user?.uid || user?.role === 'guest') {
            navigate('/login');
        }
    }, [user, navigate]);

    const update = (key, val) => setForm({ ...form, [key]: val });

    const handleRegister = async () => {
        if (isLoading || !user?.uid) {
            return;
        }

        setError('');

        if (!form.firstName.trim()) {
            setError(t('register.error_first'));
            return;
        }
        if (!form.lastName.trim()) {
            setError(t('register.error_last'));
            return;
        }

        try {
            setIsLoading(true);
            const result = await completeRegistration({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim()
            });

            if (!result.success) {
                setError(result.error || 'Kayıt tamamlanamadı.');
                setIsLoading(false);
                return;
            }

            setIsLoading(false);
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);

        } catch (err) {
            console.error('Kayıt sırasında teknik hata fırlatıldı:', err);
            setError('Sistem hatası: ' + (err?.message || 'Bilinmeyen hata'));
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Check size={36} className="text-emerald-500" />
                    </div>
                    <h2 className="text-white text-xl font-bold font-display mb-1">{t('register.welcome')}</h2>
                    <p className="text-zinc-500 text-base">{t('common.loading')}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements MUST have pointer-events-none */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none" />

            {/* Back Button */}
            <button onClick={() => navigate(-1)}
                className="absolute top-8 left-6 z-20 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition">
                <ArrowLeft size={18} />
            </button>

            {/* Main Content Container - needs relative and z-10 to stay above backgrounds */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm relative z-10">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Shaco" className="w-20 h-20 rounded-full border-4 border-zinc-900 bg-black object-cover" />
                </div>

                <div className="glass-dark p-6 rounded-3xl border border-white/10">
                    <h1 className="text-xl font-display font-bold text-white mb-0.5 text-center">{t('register.title')}</h1>
                    <p className="text-zinc-600 text-[15px] text-center mb-1">{t('register.subtitle')}</p>

                    {/* Telefon numarasını göster */}
                    {user?.phone && (
                        <p className="text-center text-sm text-shaco-red font-bold font-mono mb-4">{user.phone}</p>
                    )}

                    <div className="space-y-3">
                        {/* Ad */}
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(e) => update('firstName', e.target.value)}
                                placeholder={t('register.first_name')}
                                className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-3 py-3.5 rounded-xl focus:outline-none focus:border-shaco-red transition text-base font-display placeholder:text-zinc-700"
                            />
                        </div>

                        {/* Soyad */}
                        <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(e) => update('lastName', e.target.value)}
                                placeholder={t('register.last_name')}
                                className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-3 py-3.5 rounded-xl focus:outline-none focus:border-shaco-red transition text-base font-display placeholder:text-zinc-700"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-[15px] font-bold animate-pulse text-center">{error}</p>
                        )}

                        <button
                            type="button"
                            onClick={handleRegister}
                            disabled={isLoading}
                            className={`w-full text-white font-bold py-3.5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] transition text-base mt-2 flex items-center justify-center gap-2 ${isLoading ? 'bg-red-500/50 cursor-not-allowed' : 'bg-shaco-red hover:bg-red-500'}`}
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t('register.submit')
                            )}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
