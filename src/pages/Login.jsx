import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email.trim()) { setError('E-posta veya telefon gerekli'); return; }
        if (!password.trim()) { setError('Şifre gerekli'); return; }
        if (password.length < 4) { setError('Şifre en az 4 karakter olmalı'); return; }

        const result = await login(email, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none" />

            {/* Back Button */}
            <button onClick={() => navigate('/')}
                className="absolute top-8 left-6 z-20 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition">
                <ArrowLeft size={18} />
            </button>

            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full max-w-sm">
                <div className="flex justify-center mb-8 relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-tr from-shaco-red to-purple-600 rounded-full blur-2xl opacity-40" />
                    <img src={logo} alt="Shaco" className="w-28 h-28 rounded-full border-4 border-zinc-900 relative z-10 bg-black object-cover" />
                </div>

                <div className="glass-dark p-6 rounded-3xl border border-white/10 text-center">
                    <h1 className="text-3xl font-display font-bold text-white mb-0.5 uppercase tracking-tighter">Shaco</h1>
                    <h2 className="text-lg font-display text-shaco-red uppercase tracking-[0.4em] font-bold mb-5">Coffee Co.</h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="E-posta veya telefon"
                            className="w-full bg-black/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-shaco-red focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition text-center font-display placeholder:text-zinc-600 text-base"
                        />

                        <div className="relative">
                            <input
                                type={showPass ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Şifre"
                                className="w-full bg-black/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-shaco-red focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition text-center font-display placeholder:text-zinc-600 text-base"
                            />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition">
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-400 text-[15px] font-bold animate-pulse">{error}</p>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-shaco-red text-white font-bold py-3 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition text-base"
                        >
                            Giriş Yap
                        </motion.button>

                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="w-full text-zinc-500 text-base font-bold hover:text-shaco-red transition py-2"
                        >
                            Hesabın yok mu? <span className="text-shaco-red underline">Kayıt Ol</span>
                        </button>
                    </form>

                    {/* No staff hints for security */}
                </div>

                <p className="text-zinc-600 text-base text-center mt-6 font-mono">EST. 2024</p>
            </motion.div>
        </div>
    );
}
