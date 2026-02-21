import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Login() {
    const [name, setName] = useState('');
    const { login, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            login(name);
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Chaos */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-sm"
            >
                <div className="flex justify-center mb-8 relative">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-tr from-shaco-red to-purple-600 rounded-full blur-2xl opacity-40"
                    />
                    <img src={logo} alt="Shaco" className="w-32 h-32 rounded-full border-4 border-zinc-900 relative z-10 bg-black object-cover" />
                </div>

                <div className="glass-dark p-6 rounded-3xl border border-white/10 text-center">
                    <h1 className="text-4xl font-display font-bold text-white mb-1 uppercase tracking-tighter loading-text">Shaco</h1>
                    <h2 className="text-xl font-display text-shaco-red uppercase tracking-[0.4em] font-bold mb-6">Coffee Co.</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ADINIZ NEDİR?"
                                className="w-full bg-black/50 border border-zinc-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-shaco-red focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition text-center font-display tracking-wider uppercase placeholder:text-zinc-600 text-base"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-shaco-red text-white font-bold py-3 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:bg-red-500 transition text-base"
                        >
                            Giriş Yap
                        </motion.button>
                    </form>
                </div>

                <p className="text-zinc-600 text-base text-center mt-8 font-mono">EST. 2024</p>
            </motion.div>
        </div>
    );
}
