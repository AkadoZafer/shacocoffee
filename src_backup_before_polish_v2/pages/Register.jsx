import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, User, Phone, Mail, Lock, Check } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Register() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const update = (key, val) => setForm({ ...form, [key]: val });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!form.firstName.trim()) { setError('Ad gerekli'); return; }
        if (!form.lastName.trim()) { setError('Soyad gerekli'); return; }
        if (!form.phone.trim()) { setError('Telefon numarası gerekli'); return; }
        if (!form.email.trim()) { setError('E-posta gerekli'); return; }
        if (!form.email.includes('@')) { setError('Geçerli bir e-posta girin'); return; }
        if (!form.password.trim()) { setError('Şifre gerekli'); return; }
        if (form.password.length < 4) { setError('Şifre en az 4 karakter olmalı'); return; }
        if (form.password !== form.confirmPassword) { setError('Şifreler eşleşmiyor'); return; }

        const result = register(form);
        if (result.success) {
            setSuccess(true);
            setTimeout(() => navigate('/'), 1500);
        } else {
            setError(result.error);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Check size={36} className="text-emerald-500" />
                    </div>
                    <h2 className="text-white text-xl font-bold font-display mb-1">Hoş Geldiniz!</h2>
                    <p className="text-zinc-500 text-sm">Hesabınız oluşturuldu</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none" />

            {/* Back Button */}
            <button onClick={() => navigate(-1)}
                className="absolute top-8 left-6 z-20 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition">
                <ArrowLeft size={18} />
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <img src={logo} alt="Shaco" className="w-20 h-20 rounded-full border-4 border-zinc-900 bg-black object-cover" />
                </div>

                <div className="glass-dark p-6 rounded-3xl border border-white/10">
                    <h1 className="text-xl font-display font-bold text-white mb-0.5 text-center">Kayıt Ol</h1>
                    <p className="text-zinc-600 text-[11px] text-center mb-5">Shaco ailesine katılın</p>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Ad - Soyad */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={(e) => update('firstName', e.target.value)}
                                    placeholder="Ad"
                                    className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:border-shaco-red transition text-sm font-display placeholder:text-zinc-700"
                                />
                            </div>
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={(e) => update('lastName', e.target.value)}
                                    placeholder="Soyad"
                                    className="w-full bg-black/50 border border-zinc-800 text-white px-3 py-3 rounded-xl focus:outline-none focus:border-shaco-red transition text-sm font-display placeholder:text-zinc-700"
                                />
                            </div>
                        </div>

                        {/* Telefon */}
                        <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                placeholder="Telefon numarası"
                                className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:border-shaco-red transition text-sm font-display placeholder:text-zinc-700"
                            />
                        </div>

                        {/* E-posta */}
                        <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                placeholder="E-posta adresi"
                                className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:border-shaco-red transition text-sm font-display placeholder:text-zinc-700"
                            />
                        </div>

                        {/* Şifre */}
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={form.password}
                                onChange={(e) => update('password', e.target.value)}
                                placeholder="Şifre"
                                className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-9 py-3 rounded-xl focus:outline-none focus:border-shaco-red transition text-sm font-display placeholder:text-zinc-700"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition">
                                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                        </div>

                        {/* Şifre Tekrar */}
                        <div className="relative">
                            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={form.confirmPassword}
                                onChange={(e) => update('confirmPassword', e.target.value)}
                                placeholder="Şifre tekrar"
                                className="w-full bg-black/50 border border-zinc-800 text-white pl-9 pr-3 py-3 rounded-xl focus:outline-none focus:border-shaco-red transition text-sm font-display placeholder:text-zinc-700"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-[11px] font-bold animate-pulse text-center">{error}</p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-shaco-red text-white font-bold py-3 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition text-sm mt-2"
                        >
                            Kayıt Ol
                        </motion.button>

                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="w-full text-zinc-500 text-[12px] font-bold hover:text-shaco-red transition py-1"
                        >
                            Zaten hesabın var mı? <span className="text-shaco-red underline">Giriş Yap</span>
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
