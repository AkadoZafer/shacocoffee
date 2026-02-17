import QRCode from 'react-qr-code';
import { useRewards } from '../context/RewardsContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Camera, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Pay() {
    const { balance, deductBalance } = useRewards();
    const [qrValue, setQrValue] = useState("shaco-user-123-" + Date.now());
    const [isPaid, setIsPaid] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isScanning, setIsScanning] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const { theme } = useTheme();

    // 3D Tilt Logic
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-100, 100], [30, -30]), { stiffness: 300, damping: 30 });
    const rotateY = useSpring(useTransform(x, [-100, 100], [-30, 30]), { stiffness: 300, damping: 30 });

    function handleMouseMove(event) {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct * 200);
        y.set(yPct * 200);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setQrValue("shaco-user-123-" + Date.now());
            setTimeLeft(30);
        }, 30000);

        const countdown = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(interval);
            clearInterval(countdown);
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            setIsScanning(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            // Simulate payment after 4 seconds
            setTimeout(() => {
                handleMockPayment();
            }, 4000);

        } catch (err) {
            console.error("Camera access denied:", err);
            // Fallback: Simulate without camera
            setTimeout(() => {
                handleMockPayment();
            }, 2000);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    const handleMockPayment = () => {
        stopCamera();
        const cost = 5.50;
        if (deductBalance(cost)) {
            setIsPaid(true);
            setTimeout(() => setIsPaid(false), 2000);
        } else {
            alert("Yetersiz Bakiye!");
        }
    };

    return (
        <div className={`flex flex-col h-full min-h-screen relative p-6 pt-12 items-center justify-center perspective-1000 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            {/* Success Overlay */}
            <AnimatePresence>
                {isPaid && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
                    >
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full border-4 border-shaco-red flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.6)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h2 className="text-white font-display text-2xl mt-6 tracking-widest uppercase">Ödeme Başarılı</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <h1 className={`font-display text-3xl uppercase tracking-widest mb-12 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Ödemek İçin Tarat</h1>

            {/* 3D QR Container / Camera Viewfinder */}
            <motion.div
                ref={ref}
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative group w-full max-w-xs aspect-square"
            >
                {/* Card Backing */}
                <div className="absolute inset-0 bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden glass-panel">
                    {/* Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 dark:via-white/5 to-transparent pointer-events-none" />

                    <div className="absolute inset-0 bg-shaco-red/20 blur-3xl rounded-full opacity-20 group-hover:opacity-50 transition duration-700" />

                    {/* Content */}
                    <div
                        className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 transform-style-3d cursor-pointer"
                        onClick={startCamera}
                    >
                        {/* Camera Overlay */}
                        {isScanning ? (
                            <div className="absolute inset-0 bg-black z-30">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-3xl" />
                                <div className="absolute inset-4 border-2 border-white/50 rounded-xl pointer-events-none animate-pulse"></div>
                                <button onClick={(e) => { e.stopPropagation(); stopCamera(); }} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white">
                                    <X size={20} />
                                </button>
                                <p className="absolute bottom-8 left-0 right-0 text-center text-white text-xs font-bold animate-pulse">QR KOD ARANIYOR...</p>
                            </div>
                        ) : (
                            <>
                                {/* Scanner Animation */}
                                <motion.div
                                    animate={{ top: ["10%", "90%", "10%"] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute left-4 right-4 h-1 bg-shaco-red/80 shadow-[0_0_15px_red] z-20"
                                />

                                <div className="bg-white p-3 rounded-xl shadow-lg transform translate-z-[20px] pointer-events-none border border-zinc-100">
                                    <QRCode
                                        size={180}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        value={qrValue}
                                        viewBox={`0 0 256 256`}
                                    />
                                </div>

                                <p className="mt-4 text-zinc-500 dark:text-zinc-500 font-mono text-[10px] tracking-widest transform translate-z-[10px] flex items-center gap-2">
                                    <Camera size={14} /> TARATMAK İÇİN DOKUN
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Timer / Code Status */}
            <div className="mt-12 flex flex-col items-center">
                <div className={`border px-4 py-2 rounded-full flex items-center gap-3 shadow-md ${theme === 'dark' ? 'glass-panel border-transparent text-white' : 'bg-white border-zinc-200 text-zinc-900'}`}>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className={`font-mono text-xs tracking-widest ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        YENİLENME: 00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </span>
                </div>
            </div>

            {/* Balance Display */}
            <div className="mt-8 text-center w-full">
                <div className={`border-t pt-6 ${theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'}`}>
                    <p className="text-zinc-500 font-display uppercase tracking-[0.3em] text-xs mb-2">Kullanılabilir Bakiye</p>
                    <h3 className={`text-6xl font-display font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                        <span className="text-3xl align-top text-shaco-red mr-1">₺</span>
                        {balance.toFixed(2)}
                    </h3>
                </div>
            </div>
        </div>
    );
}
