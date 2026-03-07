import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Shield } from 'lucide-react';
import { RecaptchaVerifier, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import logo from '../assets/logo.png';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [captchaResolved, setCaptchaResolved] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const { sendOTP, verifyOTP } = useAuth();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const otpRefs = useRef([]);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // reCAPTCHA'yı sadece /login yolunda ve telefon adımında başlat
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(
                    auth,
                    'recaptcha-container',
                    {
                        size: 'normal',
                        theme: isDark ? 'dark' : 'light',
                        callback: () => { 
                            console.log('reCAPTCHA verified');
                            setCaptchaResolved(true);
                        },
                        'expired-callback': () => {
                            setCaptchaResolved(false);
                            if (window.recaptchaVerifier) window.recaptchaVerifier.reset();
                        }
                    }
                );
                window.recaptchaVerifier.render()
                    .then((widgetId) => {
                        window.recaptchaWidgetId = widgetId;
                        console.log('reCAPTCHA hazır:', widgetId);
                    })
                    .catch((err) => {
                        console.error('reCAPTCHA render gecikmesi cihaz kaynaklı olabilir, istek anında tekrar denenecek:', err);
                    });
            } catch (err) {
                console.error('reCAPTCHA init hatası:', err);
                window.recaptchaVerifier = null;
            }
        }

        // Sayfadan ayrılırken temizlik
        return () => {
            if (window.recaptchaVerifier) {
                console.log('reCAPTCHA temizleniyor (Unmount)');
                try { window.recaptchaVerifier.clear(); } catch (e) { }
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    // Geri sayım
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Telefon numarasını formatla
    const formatPhone = (val) => {
        const digits = val.replace(/\D/g, '');
        if (digits.startsWith('90')) return '+' + digits;
        if (digits.startsWith('0')) return '+9' + digits;
        if (digits.startsWith('5')) return '+90' + digits;
        return '+90' + digits;
    };

    // SMS Gönder
    const handleSendOTP = async () => {
        setError('');
        
        if (!captchaResolved) {
            setError(t('login.verification_required') || 'Lütfen robot olmadığınızı doğrulayın.');
            return;
        }

        const formatted = formatPhone(phone);

        if (formatted.length < 13) {
            setError(t('login.invalid_phone'));
            return;
        }

        setIsLoading(true);
        const result = await sendOTP(formatted);
        setIsLoading(false);

        if (result.success) {
            setStep('otp');
            setCountdown(120); // 2 dakika geri sayım
            setTimeout(() => otpRefs.current[0]?.focus(), 300);
        } else {
            setError(result.error);
        }
    };

    // OTP Kutusu Değişimi
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Sonraki kutuya otomatik geç
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // OTP Silme
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // OTP Yapıştırma
    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
    };

    // Kodu Doğrula
    const handleVerifyOTP = async () => {
        setError('');
        const code = otp.join('');
        if (code.length < 6) {
            setError(t('login.otp_subtitle'));
            return;
        }

        setIsLoading(true);
        const result = await verifyOTP(code);
        setIsLoading(false);

        if (result.success) {
            if (result.isNewUser) {
                // Firebase Auth state'in tamamen hazır olduğundan emin olmak için listener kullanıyoruz
                const unsubscribe = onAuthStateChanged(auth, (user) => {
                    if (user) {
                        unsubscribe(); // Sadece ilk tetiklemede çalışsın
                        navigate('/register');
                    }
                });
            } else {
                navigate('/');
            }
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-shaco-red/10 to-transparent pointer-events-none" />

            {/* Back Button */}
            <button onClick={() => step === 'otp' ? setStep('phone') : navigate('/')}
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

                    {step === 'phone' ? (
                        /* ============ TELEFON NUMARASI ADIMI ============ */
                        <div className="space-y-3">
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="05XX XXX XXXX"
                                    maxLength={15}
                                    className="w-full bg-black/50 border border-zinc-800 text-white pl-10 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-shaco-red focus:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition text-center font-display placeholder:text-zinc-600 text-lg tracking-wider"
                                />
                            </div>

                            {error && (
                                <p className="text-red-400 text-[15px] font-bold animate-pulse">{error}</p>
                            )}

                            <div className="flex justify-center w-full transform scale-90 sm:scale-100 origin-center">
                                <div id="recaptcha-container" className="my-2 object-center overflow-hidden rounded-xl border border-zinc-700/50"></div>
                            </div>

                            <motion.button
                                id="send-otp-btn"
                                whileHover={!isLoading && captchaResolved ? { scale: 1.02 } : {}}
                                whileTap={!isLoading && captchaResolved ? { scale: 0.98 } : {}}
                                onClick={handleSendOTP}
                                disabled={isLoading || !captchaResolved}
                                className={`w-full text-white font-bold py-3.5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] transition text-base flex items-center justify-center gap-2 ${isLoading || !captchaResolved ? 'bg-zinc-600/50 cursor-not-allowed shadow-none' : 'bg-shaco-red hover:bg-red-500'}`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Shield size={16} />
                                        {t('login.send_otp')}
                                    </>
                                )}
                            </motion.button>

                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="w-full text-zinc-600 text-base font-bold hover:text-zinc-400 transition py-2"
                            >
                                {t('login.guest_mode')}
                            </button>
                        </div>
                    ) : (
                        /* ============ OTP DOĞRULAMA ADIMI ============ */
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="space-y-2">
                                <p className="text-zinc-400 text-sm font-medium">
                                    <span className="text-white font-bold">{formatPhone(phone)}</span> {t('login.otp_subtitle')}
                                </p>
                            </div>

                            {/* 6 Haneli OTP Kutuları */}
                            <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={(el) => (otpRefs.current[i] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(i, e.target.value)}
                                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                        className={`w-11 h-14 text-center text-2xl font-bold rounded-xl border transition-all duration-200 bg-black/50 text-white focus:outline-none
                                            ${digit ? 'border-shaco-red shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'border-zinc-800'}
                                            focus:border-shaco-red focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]`}
                                    />
                                ))}
                            </div>

                            <p className="text-center text-[13px] text-zinc-500 px-4">
                                Mesaj gelmediyse lütfen <span className="text-zinc-400 font-bold">Spam/Gereksiz</span> klasörünü kontrol edin.
                            </p>

                            <div className="flex flex-col items-center gap-2">
                                {/* Geri Sayım */}
                                {countdown > 0 ? (
                                    <p className="text-zinc-600 text-sm font-mono">
                                        Kod geçerlilik: <span className="text-zinc-400">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</span>
                                    </p>
                                ) : (
                                    /* Tekrar Gönder */
                                    <button
                                        type="button"
                                        onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                                        className="text-shaco-red text-sm font-bold hover:underline"
                                    >
                                        {t('login.resend')}
                                    </button>
                                )}
                            </div>

                            {error && (
                                <p className="text-red-400 text-[15px] font-bold animate-pulse">{error}</p>
                            )}

                            <motion.button
                                whileHover={!isLoading ? { scale: 1.02 } : {}}
                                whileTap={!isLoading ? { scale: 0.98 } : {}}
                                onClick={handleVerifyOTP}
                                disabled={isLoading || otp.join('').length < 6}
                                className={`w-full text-white font-bold py-3.5 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(239,68,68,0.4)] transition text-base flex items-center justify-center gap-2 ${isLoading || otp.join('').length < 6 ? 'bg-red-500/50 cursor-not-allowed' : 'bg-shaco-red hover:bg-red-500'}`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    t('login.verify')
                                )}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* No staff hints for security */}
                </div>

                <p className="text-zinc-600 text-base text-center mt-6 font-mono">EST. 2024</p>
            </motion.div>
            {/* Visible reCAPTCHA moved to form */}
        </div>
    );
}
