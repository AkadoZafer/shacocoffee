import QRCode from 'react-qr-code';
import { useRewards } from '../context/RewardsContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, History, Check, ArrowDownLeft, ArrowUpRight, X, Coffee, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const quickAmounts = [25, 50, 100, 200, 500];

export default function Pay() {
    const { balance, addBalance, orders, addToCart, checkoutCart } = useRewards();
    const [activeTab, setActiveTab] = useState('qr');
    const [topUpAmount, setTopUpAmount] = useState('');
    const { theme } = useTheme();
    const { addToast } = useToast();
    const isDark = theme === 'dark';

    const [payHistory] = useState([
        { id: 1, type: 'payment', label: 'Caffe Latte', amount: -85, date: 'Bugün, 14:30', stars: 5 },
        { id: 2, type: 'topup', label: 'Bakiye Yükleme', amount: 200, date: 'Bugün, 10:15', stars: 0 },
        { id: 3, type: 'payment', label: "Jester's Delight", amount: -55, date: 'Dün, 16:45', stars: 3 },
        { id: 4, type: 'topup', label: 'Bakiye Yükleme', amount: 100, date: '16 Şubat, 09:00', stars: 0 },
        { id: 5, type: 'payment', label: 'Americano', amount: -38, date: '15 Şubat, 11:30', stars: 2 },
        { id: 6, type: 'payment', label: 'Toxic Slush', amount: -35, date: '14 Şubat, 15:20', stars: 2 },
        { id: 7, type: 'topup', label: 'Bakiye Yükleme', amount: 500, date: '13 Şubat, 08:00', stars: 0 },
    ]);

    const handleTopUp = (amount) => {
        const val = amount || Number(topUpAmount);
        if (val > 0 && addBalance) {
            addBalance(val);
            setTopUpAmount('');
            addToast('+₺' + val + ' Bakiye Yüklendi!', 'success');
        }
    };

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-shaco-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>


            {/* Header */}
            <div className="p-6 pt-10 pb-4">
                <h1 className="text-2xl font-display font-bold mb-0.5">Ödeme</h1>
                <p className={`text-base ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Shaco Wallet ile hızlı ödeme</p>
            </div>

            {/* Balance Card */}
            <div className="px-6 mb-5">
                <div className={`p-5 rounded-2xl relative overflow-hidden glass-panel ${isDark ? 'bg-gradient-to-br from-shaco-red/10 to-zinc-900/80 border-white/5' : 'bg-gradient-to-br from-red-50 to-white/90 border-zinc-200/50 shadow-lg'}`}>
                    <div className="absolute top-3 right-4">
                        <span className={`text-base font-bold tracking-[0.15em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>SHACO</span>
                    </div>
                    <p className={`text-base font-bold tracking-[0.2em] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>MEVCUT BAKİYE</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-shaco-red text-xl font-bold">₺</span>
                        <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{balance.toFixed(0)}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-2 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        <span className="text-base">•••• •••••</span>
                        <span className="text-base font-mono">1095</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 mb-5">
                <div className={`flex p-1 rounded-xl ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-100'}`}>
                    {[
                        { key: 'qr', label: '☰ QR Öde' },
                        { key: 'topup', label: '₺ Yükle' },
                        { key: 'history', label: '⏱ Geçmiş' },
                    ].map(tab => (
                        <button key={tab.key} onClick={async () => {
                            try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                            setActiveTab(tab.key);
                        }}
                            className={`flex-1 py-2.5 rounded-lg text-[15px] font-bold tracking-wide transition-all duration-300 relative ${activeTab === tab.key
                                ? isDark ? 'bg-zinc-800/80 text-white shadow-glass shadow-md' : 'bg-white text-zinc-900 shadow-md'
                                : isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30' : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6">
                {/* ============ QR TAB ============ */}
                {activeTab === 'qr' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex flex-col items-center">

                            {/* Wallet Info Header */}
                            <div className="w-full mb-4 mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Cüzdan Kodu</h3>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-base font-bold bg-emerald-500/10 text-emerald-400">
                                        <Check size={10} />
                                        Aktif
                                    </div>
                                </div>
                                <p className={`text-base font-mono font-bold tracking-wider ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                    Kullanıma Hazır
                                </p>
                            </div>

                            {/* Clean QR Code without distractions or animations */}
                            <div className={`w-full rounded-3xl p-8 mb-6 relative overflow-hidden flex flex-col items-center justify-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-xl'}`}>
                                <div className="bg-white p-4 rounded-2xl shadow-sm mb-4">
                                    <QRCode
                                        size={220}
                                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        value={JSON.stringify({ userId: "USR-999120", action: "pay", timestamp: Date.now() })}
                                        viewBox="0 0 256 256"
                                        level="M"
                                    />
                                </div>
                                <p className={`text-center text-[15px] font-bold mt-4 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                    Sipariş vermek ve ödemek için<br />
                                    <span className="text-shaco-red">kasada bu QR kodu gösterin</span>
                                </p>
                            </div>

                            {/* Wallet Integration Buttons */}
                            <div className="w-full flex gap-2 mb-6">
                                <button
                                    onClick={() => alert("Apple Wallet entegrasyonu sunucu tarafı passkit sertifikası (ve .pkpass üretimi) gerektirir. Bu bir önizlemedir.")}
                                    className="flex-1 py-3.5 rounded-xl bg-black text-white flex items-center justify-center gap-2 font-bold text-sm shadow-md shadow-black/20 active:scale-95 transition"
                                >
                                    <svg viewBox="0 0 384 512" width="14" height="14" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                                    Cüzdana Ekle
                                </button>
                                <button
                                    onClick={() => alert("Google Wallet entegrasyonu backend üzerinden mülkiyet doğrulaması ve JWT API gerektirir. Bu bir önizlemedir.")}
                                    className={`flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-md active:scale-95 transition ${isDark ? 'bg-zinc-800 text-white shadow-black/20 hover:bg-zinc-700' : 'bg-white text-zinc-900 border border-zinc-200 shadow-zinc-200/50 hover:bg-zinc-50'}`}
                                >
                                    <svg viewBox="0 0 488 512" width="14" height="14" fill="currentColor" className={isDark ? "text-white" : "text-zinc-600"}><path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" /></svg>
                                    GPay'e Ekle
                                </button>
                            </div>

                            {/* Tips */}
                            <div className={`w-full p-4 rounded-xl flex gap-3 mb-6 ${isDark ? 'bg-zinc-900/50 border border-zinc-800/50' : 'bg-blue-50/50 border border-blue-100'}`}>
                                <Coffee size={18} className={isDark ? 'text-zinc-500' : 'text-blue-500'} />
                                <p className={`text-[15px] leading-relaxed font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    Bakiyenizden düşülerek temassız ödeme yapılır. Yetersiz bakiye durumunda kredi kartı veya nakit ile kasadan da ödeyebilirsiniz.
                                </p>
                            </div>



                        </div>
                    </motion.div>
                )}

                {/* ============ TOP UP TAB ============ */}
                {activeTab === 'topup' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className={`text-base font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>HIZLI YÜKLEME</p>
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {quickAmounts.map((amount) => (
                                <button key={amount} onClick={async () => {
                                    try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                                    handleTopUp(amount);
                                }}
                                    className={`py-4 rounded-xl text-center transition-all duration-300 active:scale-95 ${isDark ? 'bg-zinc-900/60 border border-white/5 hover:border-shaco-red/30 hover:shadow-glass hover:bg-zinc-800/80' : 'bg-white border border-zinc-200 mb-1 shadow-sm hover:border-shaco-red/30 hover:shadow-md'}`}>
                                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>₺{amount}</span>
                                </button>
                            ))}
                            <div className={`py-2 rounded-xl flex flex-col items-center justify-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}>
                                <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="₺"
                                    className={`w-full text-center text-lg font-bold bg-transparent outline-none ${isDark ? 'text-white placeholder:text-zinc-700' : 'text-zinc-900 placeholder:text-zinc-300'}`} />
                                <span className={`text-[15px] ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>Özel</span>
                            </div>
                        </div>

                        {topUpAmount && Number(topUpAmount) > 0 && (
                            <button onClick={() => handleTopUp()}
                                className="w-full py-4 rounded-2xl bg-shaco-red text-white font-bold text-[15px] shadow-lg shadow-red-500/15 active:scale-[0.97] transition flex items-center justify-center gap-2 mb-5">
                                <Plus size={16} /> ₺{topUpAmount} Yükle
                            </button>
                        )}

                        <p className={`text-base font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>SON YÜKLEMELER</p>
                        <div className="space-y-1.5">
                            {payHistory.filter(h => h.type === 'topup').map((h) => (
                                <div key={h.id} className={`p-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><ArrowDownLeft size={14} /></div>
                                        <div>
                                            <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{h.label}</p>
                                            <p className={`text-base ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{h.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-500 text-base font-bold">+₺{h.amount}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ============ HISTORY TAB ============ */}
                {activeTab === 'history' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="space-y-1.5">
                            {payHistory.map((h, i) => (
                                <motion.div key={h.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    className={`p-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.type === 'topup' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-shaco-red/10 text-shaco-red'}`}>
                                            {h.type === 'topup' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                        </div>
                                        <div>
                                            <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{h.label}</p>
                                            <p className={`text-base ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{h.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-base font-bold ${h.amount > 0 ? 'text-emerald-500' : isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {h.amount > 0 ? '+' : ''}₺{Math.abs(h.amount)}
                                        </span>
                                        {h.stars > 0 && <p className="text-[15px] text-yellow-500 font-bold">+{h.stars} ⭐</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <p className={`text-center text-base font-bold tracking-wider mt-5 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>
                            {payHistory.length} İŞLEM
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
