import QRCode from 'react-qr-code';
import { useRewards } from '../context/RewardsContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, History, Check, ArrowDownLeft, ArrowUpRight, X, Coffee, Clock } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const quickAmounts = [25, 50, 100, 200, 500];

export default function Pay() {
    const { balance, addBalance, activeOrder, dismissActiveOrder, orders } = useRewards();
    const [activeTab, setActiveTab] = useState('qr');
    const [topUpAmount, setTopUpAmount] = useState('');
    const [showTopUpSuccess, setShowTopUpSuccess] = useState(false);
    const { theme } = useTheme();
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

    // Auto-switch to QR tab if there's an active order
    useEffect(() => {
        if (activeOrder) setActiveTab('qr');
    }, [activeOrder]);

    const handleTopUp = (amount) => {
        const val = amount || Number(topUpAmount);
        if (val > 0 && addBalance) {
            addBalance(val);
            setTopUpAmount('');
            setShowTopUpSuccess(true);
            setTimeout(() => setShowTopUpSuccess(false), 1500);
        }
    };

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* Success Overlays */}
            <AnimatePresence>
                {showTopUpSuccess && (
                    <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className="fixed top-8 left-1/2 -translate-x-1/2 z-[70] bg-emerald-500 text-white px-5 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 font-bold text-sm">
                        <Check size={16} /> Bakiye Yüklendi!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="p-6 pt-10 pb-4">
                <h1 className="text-2xl font-display font-bold mb-0.5">Ödeme</h1>
                <p className={`text-xs ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Shaco Wallet ile hızlı ödeme</p>
            </div>

            {/* Balance Card */}
            <div className="px-6 mb-5">
                <div className={`p-5 rounded-2xl relative overflow-hidden ${isDark ? 'bg-gradient-to-br from-shaco-red/20 to-zinc-900 border border-zinc-800' : 'bg-gradient-to-br from-red-50 to-white border border-zinc-200 shadow-lg'}`}>
                    <div className="absolute top-3 right-4">
                        <span className={`text-[10px] font-bold tracking-[0.15em] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>SHACO</span>
                    </div>
                    <p className={`text-[10px] font-bold tracking-[0.2em] mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>MEVCUT BAKİYE</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-shaco-red text-xl font-bold">₺</span>
                        <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{balance.toFixed(0)}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 mt-2 ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        <span className="text-[10px]">•••• •••••</span>
                        <span className="text-[10px] font-mono">1095</span>
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
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold tracking-wide transition relative ${activeTab === tab.key
                                ? isDark ? 'bg-zinc-800 text-white shadow-md' : 'bg-white text-zinc-900 shadow-md'
                                : isDark ? 'text-zinc-500' : 'text-zinc-400'
                                }`}
                        >
                            {tab.label}
                            {tab.key === 'qr' && activeOrder && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-shaco-red rounded-full animate-pulse" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-6">
                {/* ============ QR TAB ============ */}
                {activeTab === 'qr' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {activeOrder ? (
                            /* Active Order - Show QR Code */
                            <div className="flex flex-col items-center">
                                {/* Order Header */}
                                <div className="w-full mb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Aktif Sipariş</h3>
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${activeOrder.status === 'Onaylandı'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            <Clock size={10} />
                                            {activeOrder.status}
                                        </div>
                                    </div>
                                    <p className={`text-[12px] font-mono font-bold tracking-wider ${isDark ? 'text-shaco-red' : 'text-shaco-red'}`}>
                                        {activeOrder.code}
                                    </p>
                                </div>

                                {/* QR Code */}
                                <div className={`w-full rounded-2xl p-6 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-md'}`}>
                                    <div className="flex justify-center mb-4">
                                        <div className="relative p-4">
                                            {/* Corner Markers */}
                                            <div className="absolute top-0 left-0 w-6 h-6 border-l-[3px] border-t-[3px] border-shaco-red rounded-tl-lg" />
                                            <div className="absolute top-0 right-0 w-6 h-6 border-r-[3px] border-t-[3px] border-shaco-red rounded-tr-lg" />
                                            <div className="absolute bottom-0 left-0 w-6 h-6 border-l-[3px] border-b-[3px] border-shaco-red rounded-bl-lg" />
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-r-[3px] border-b-[3px] border-shaco-red rounded-br-lg" />
                                            {/* QR Code */}
                                            <div className="bg-white p-3 rounded-xl">
                                                <QRCode size={180} style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                                    value={JSON.stringify({ code: activeOrder.code, total: activeOrder.total, items: activeOrder.items.map(i => i.name) })}
                                                    viewBox="0 0 256 256"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Details */}
                                    <div className={`border-t pt-4 mt-2 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                                        <p className={`text-[10px] font-bold tracking-[0.15em] mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>SİPARİŞ DETAYI</p>
                                        {activeOrder.items.map((item, i) => (
                                            <div key={i} className="flex justify-between items-center mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-shaco-red text-[10px] font-bold">1x</span>
                                                    <span className={`text-[12px] font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{item.name}</span>
                                                </div>
                                                <span className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>₺{item.price}</span>
                                            </div>
                                        ))}
                                        <div className={`flex justify-between items-center mt-3 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                                            <span className={`text-[12px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Toplam</span>
                                            <span className="text-shaco-red text-[14px] font-bold">₺{activeOrder.total}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <p className={`text-center text-[11px] font-bold mt-4 ${isDark ? 'text-shaco-red/70' : 'text-shaco-red'}`}>
                                    Bu QR kodu kasadaki baristaya gösterin
                                </p>

                                {/* Dismiss Button */}
                                <button onClick={dismissActiveOrder}
                                    className={`mt-4 w-full py-3 rounded-xl text-[12px] font-bold transition ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}>
                                    Sipariş QR'ını Kapat
                                </button>
                            </div>
                        ) : (
                            /* No Active Order - Prompt */
                            <div className="flex flex-col items-center py-8">
                                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-zinc-100'}`}>
                                    <Coffee size={32} className={isDark ? 'text-zinc-700' : 'text-zinc-400'} />
                                </div>
                                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>Aktif Sipariş Yok</h3>
                                <p className={`text-[12px] text-center mb-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    Menüden bir ürün seçip sipariş verdiğinizde<br />QR kodunuz burada görünecek.
                                </p>

                                {/* Recent Orders */}
                                {orders.length > 0 && (
                                    <>
                                        <p className={`text-[10px] font-bold tracking-[0.15em] mb-3 w-full ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>SON SİPARİŞLER</p>
                                        <div className="w-full space-y-1.5">
                                            {orders.slice(0, 3).map((order) => (
                                                <div key={order.id} className={`p-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                                                    <div>
                                                        <p className={`text-[12px] font-mono font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>{order.code}</p>
                                                        <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{order.items.map(i => i.name).join(', ')}</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-full text-[9px] font-bold ${order.status === 'Onaylandı' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                                                        }`}>{order.status}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ============ TOP UP TAB ============ */}
                {activeTab === 'topup' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <p className={`text-[10px] font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>HIZLI YÜKLEME</p>
                        <div className="grid grid-cols-3 gap-2 mb-5">
                            {quickAmounts.map((amount) => (
                                <button key={amount} onClick={() => handleTopUp(amount)}
                                    className={`py-4 rounded-xl text-center transition active:scale-95 ${isDark ? 'bg-zinc-900 border border-zinc-800 hover:border-shaco-red/30' : 'bg-white border border-zinc-200 shadow-sm hover:border-shaco-red/30'}`}>
                                    <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>₺{amount}</span>
                                </button>
                            ))}
                            <div className={`py-2 rounded-xl flex flex-col items-center justify-center ${isDark ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm'}`}>
                                <input type="number" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} placeholder="₺"
                                    className={`w-full text-center text-lg font-bold bg-transparent outline-none ${isDark ? 'text-white placeholder:text-zinc-700' : 'text-zinc-900 placeholder:text-zinc-300'}`} />
                                <span className={`text-[9px] ${isDark ? 'text-zinc-700' : 'text-zinc-400'}`}>Özel</span>
                            </div>
                        </div>

                        {topUpAmount && Number(topUpAmount) > 0 && (
                            <button onClick={() => handleTopUp()}
                                className="w-full py-4 rounded-2xl bg-shaco-red text-white font-bold text-[13px] shadow-lg shadow-red-500/15 active:scale-[0.97] transition flex items-center justify-center gap-2 mb-5">
                                <Plus size={16} /> ₺{topUpAmount} Yükle
                            </button>
                        )}

                        <p className={`text-[10px] font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>SON YÜKLEMELER</p>
                        <div className="space-y-1.5">
                            {payHistory.filter(h => h.type === 'topup').map((h) => (
                                <div key={h.id} className={`p-3 rounded-xl flex items-center justify-between ${isDark ? 'bg-zinc-900/60 border border-zinc-800' : 'bg-white border border-zinc-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><ArrowDownLeft size={14} /></div>
                                        <div>
                                            <p className={`text-[12px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{h.label}</p>
                                            <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{h.date}</p>
                                        </div>
                                    </div>
                                    <span className="text-emerald-500 text-[12px] font-bold">+₺{h.amount}</span>
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
                                            <p className={`text-[12px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{h.label}</p>
                                            <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{h.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[12px] font-bold ${h.amount > 0 ? 'text-emerald-500' : isDark ? 'text-white' : 'text-zinc-900'}`}>
                                            {h.amount > 0 ? '+' : ''}₺{Math.abs(h.amount)}
                                        </span>
                                        {h.stars > 0 && <p className="text-[9px] text-yellow-500 font-bold">+{h.stars} ⭐</p>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <p className={`text-center text-[10px] font-bold tracking-wider mt-5 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>
                            {payHistory.length} İŞLEM
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
