import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useExtras } from '../context/ExtrasContext';
import { useMembership } from '../context/MembershipContext';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, ImageIcon, Upload, Plus, Trash2, QrCode, Check, Crown, Shield, Coffee, Camera, Search } from 'lucide-react';
import { products as initialProducts } from '../data/products';

const categories = [
    { label: '☕ Sıcak', value: 'hot' },
    { label: '🧊 Soğuk', value: 'cold' },
    { label: '⭐ Özel', value: 'signature' },
    { label: '🍰 Tatlı', value: 'dessert' },
];

export default function AdminPanel() {
    const { theme } = useTheme();
    const { extras, addExtra, removeExtra } = useExtras();
    const { tiers, updateTier } = useMembership();
    const { user } = useAuth();
    const { orders, confirmOrder } = useRewards();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [products] = useState(initialProducts);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const isAdmin = user?.role === 'admin';
    const isBarista = user?.role === 'barista';

    const defaultSection = isBarista ? 'orders' : 'products';
    const [activeSection, setActiveSection] = useState(defaultSection);

    const [form, setForm] = useState({
        name: '', description: '', price: '', category: 'hot', image: '', isFood: false,
    });

    const [newExtraName, setNewExtraName] = useState('');
    const [newExtraPrice, setNewExtraPrice] = useState('');

    // QR Scanner State
    const [isScanning, setIsScanning] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [scannedOrder, setScannedOrder] = useState(null);
    const [scanError, setScanError] = useState('');

    const isDark = theme === 'dark';
    const cardClass = isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm';
    const inputClass = isDark ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400';

    // Pending orders (from customers)
    const pendingOrders = orders.filter(o => o.status === 'Bekliyor');

    const handleEdit = (product) => {
        setForm({
            name: product.name, description: product.description || '', price: String(product.price),
            category: product.category || 'hot', image: product.image || '', isFood: product.isFood || false,
        });
        setEditingProduct(product);
        setShowForm(true);
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setForm({ ...form, image: reader.result });
            reader.readAsDataURL(file);
        }
    };

    const handleAddExtra = () => {
        if (newExtraName.trim() && newExtraPrice) {
            addExtra(newExtraName.trim(), Number(newExtraPrice));
            setNewExtraName('');
            setNewExtraPrice('');
        }
    };

    // Real Camera QR Scanner
    const startCamera = async () => {
        try {
            setIsScanning(true);
            setScanError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            setScanError('Kamera erişimi reddedildi. Manuel giriş kullanın.');
            setIsScanning(false);
            setShowManualInput(true);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsScanning(false);
    };

    // Clean up camera on unmount
    useEffect(() => {
        return () => stopCamera();
    }, []);

    // Search order by code
    const searchOrder = (code) => {
        const trimmed = code.trim().toUpperCase();
        const found = orders.find(o => o.code === trimmed);
        if (found) {
            setScannedOrder(found);
            setScanError('');
            stopCamera();
        } else {
            setScanError(`"${trimmed}" kodlu sipariş bulunamadı.`);
        }
    };

    const handleManualSearch = () => {
        if (manualCode.trim()) searchOrder(manualCode);
    };

    const handleConfirmOrder = () => {
        if (scannedOrder) {
            confirmOrder(scannedOrder.code);
            setScannedOrder({ ...scannedOrder, status: 'Onaylandı' });
        }
    };

    const adminSections = [
        { key: 'products', label: 'Ürünler', icon: <Coffee size={12} /> },
        { key: 'extras', label: 'Ekstralar', icon: <Plus size={12} /> },
        { key: 'membership', label: 'Üyelik', icon: <Crown size={12} /> },
        { key: 'orders', label: 'Siparişler', icon: <QrCode size={12} /> },
    ];

    const baristaSections = [
        { key: 'orders', label: 'Siparişler', icon: <QrCode size={12} /> },
    ];

    const sections = isBarista ? baristaSections : adminSections;

    return (
        <div className={`min-h-screen pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>

            {/* Header */}
            <div className="relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-shaco-red via-red-400 to-shaco-red" />
                <div className="p-6 pt-8">
                    <div className="flex items-center justify-between mb-1">
                        <div>
                            <h1 className="text-xl font-display font-bold leading-tight">
                                {isBarista ? 'Barista Paneli' : 'Yönetici Paneli'}
                            </h1>
                            <p className={`text-[11px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                Hoş geldin, {user?.name || 'Kullanıcı'} 👋
                            </p>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-[10px] font-bold ${isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-400'}`}>
                            <Shield size={10} className="inline -mt-0.5 mr-1" />
                            {isAdmin ? 'Admin' : 'Barista'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6">
                {/* Section Tabs */}
                <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar">
                    {sections.map(s => (
                        <button key={s.key} onClick={() => { setActiveSection(s.key); setShowForm(false); }}
                            className={`px-3.5 py-2 rounded-xl text-[11px] font-bold tracking-wide flex items-center gap-1.5 whitespace-nowrap transition ${activeSection === s.key
                                ? 'bg-zinc-800 text-white border border-zinc-700'
                                : isDark ? 'border border-zinc-800 text-zinc-500' : 'border border-zinc-300 text-zinc-400'
                                }`}
                        >
                            {s.icon} {s.label}
                            {s.key === 'orders' && pendingOrders.length > 0 && (
                                <span className="ml-1 w-4 h-4 bg-shaco-red rounded-full text-white text-[9px] font-bold flex items-center justify-center">{pendingOrders.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ============ ORDERS / BARISTA ============ */}
                {activeSection === 'orders' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* QR Scanner Section */}
                        <div className={`rounded-2xl overflow-hidden mb-5 ${cardClass}`}>
                            <div className="p-4">
                                <SectionLabel label="SİPARİŞ QR TARAT" isDark={isDark} />
                                <p className={`text-[11px] mb-3 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    Müşterinin telefonundaki QR kodu taratın
                                </p>
                            </div>

                            {isScanning ? (
                                /* Camera View */
                                <div className="relative aspect-[4/3] bg-black">
                                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                    {/* Scanning overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 relative">
                                            <div className="absolute top-0 left-0 w-8 h-8 border-l-3 border-t-3 border-shaco-red rounded-tl-lg" style={{ borderWidth: '3px' }} />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-r-3 border-t-3 border-shaco-red rounded-tr-lg" style={{ borderWidth: '3px' }} />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-3 border-b-3 border-shaco-red rounded-bl-lg" style={{ borderWidth: '3px' }} />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-3 border-b-3 border-shaco-red rounded-br-lg" style={{ borderWidth: '3px' }} />
                                            <motion.div
                                                animate={{ top: ['0%', '100%', '0%'] }}
                                                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                                                className="absolute left-0 right-0 h-0.5 bg-shaco-red shadow-[0_0_8px_red]"
                                            />
                                        </div>
                                    </div>
                                    <button onClick={stopCamera} className="absolute top-3 right-3 bg-black/60 backdrop-blur p-2 rounded-full text-white">
                                        <X size={16} />
                                    </button>
                                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-[11px] font-bold">
                                        QR Kod taranıyor...
                                    </p>
                                </div>
                            ) : (
                                <div className="px-4 pb-4">
                                    <button onClick={startCamera}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-shaco-red to-red-600 text-white font-bold text-[13px] flex items-center justify-center gap-2.5 shadow-lg shadow-red-500/20 active:scale-[0.97] transition">
                                        <Camera size={18} /> Kamerayı Aç & QR Tarat
                                    </button>
                                </div>
                            )}

                            {/* Manual Input Toggle */}
                            <div className="px-4 pb-4">
                                <button onClick={() => setShowManualInput(!showManualInput)}
                                    className={`text-[11px] font-bold ${isDark ? 'text-zinc-500 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-500'} transition`}>
                                    {showManualInput ? 'Manuel girişi gizle' : 'Manuel giriş göster'}
                                </button>

                                {showManualInput && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                                        <div className="flex gap-2">
                                            <input
                                                value={manualCode}
                                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                                placeholder="SHC-XXXXXX"
                                                className={`flex-1 p-3 rounded-xl border text-[13px] font-mono font-bold outline-none focus:border-shaco-red/50 transition ${inputClass}`}
                                            />
                                            <button onClick={handleManualSearch}
                                                className="px-4 py-3 rounded-xl bg-shaco-red text-white font-bold text-[12px] active:scale-95 transition">
                                                Ara
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {scanError && (
                                    <p className="text-red-400 text-[11px] font-bold mt-2">{scanError}</p>
                                )}
                            </div>
                        </div>

                        {/* Scanned Order Result */}
                        <AnimatePresence>
                            {scannedOrder && (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className={`p-4 rounded-2xl mb-5 border-2 ${scannedOrder.status === 'Onaylandı' ? 'border-emerald-500/40' : 'border-amber-500/40'} ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>

                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className={`font-mono font-bold text-[14px] ${isDark ? 'text-white' : 'text-zinc-900'}`}>{scannedOrder.code}</p>
                                            <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                {new Date(scannedOrder.timestamp).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${scannedOrder.status === 'Onaylandı'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {scannedOrder.status === 'Onaylandı' ? <Check size={10} /> : '⏳'}
                                            {scannedOrder.status}
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className={`space-y-2 py-3 border-y ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
                                        {scannedOrder.items.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-shaco-red text-[10px] font-bold bg-shaco-red/10 w-5 h-5 rounded flex items-center justify-center">1x</span>
                                                    <div>
                                                        <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{item.name}</p>
                                                        {item.customizations?.length > 0 && (
                                                            <p className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{item.customizations.join(', ')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className={`text-[13px] font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>₺{item.price}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between mt-3">
                                        <span className={`text-[13px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>Toplam</span>
                                        <span className="text-shaco-red text-[16px] font-bold">₺{scannedOrder.total}</span>
                                    </div>

                                    {/* Confirm Button */}
                                    {scannedOrder.status === 'Bekliyor' && (
                                        <button onClick={handleConfirmOrder}
                                            className="w-full mt-4 py-3.5 rounded-xl bg-emerald-500 text-white font-bold text-[13px] flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.97] transition">
                                            <Check size={16} /> Siparişi Onayla
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pending Orders List */}
                        {pendingOrders.length > 0 && (
                            <>
                                <SectionLabel label={`BEKLEYEN SİPARİŞLER (${pendingOrders.length})`} isDark={isDark} />
                                <div className="space-y-1.5">
                                    {pendingOrders.map((order, i) => (
                                        <motion.div key={order.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                            onClick={() => setScannedOrder(order)}
                                            className={`p-3.5 rounded-2xl cursor-pointer transition active:scale-[0.98] ${cardClass}`}>
                                            <div className="flex items-center justify-between">
                                                <span className={`text-[13px] font-mono font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{order.code}</span>
                                                <span className={`text-[10px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                    {new Date(order.timestamp).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                                                {order.items.length} ürün • ₺{order.total}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}

                        {pendingOrders.length === 0 && !scannedOrder && (
                            <div className="text-center py-10">
                                <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-zinc-900' : 'bg-zinc-100'}`}>
                                    <Coffee size={28} className={isDark ? 'text-zinc-700' : 'text-zinc-400'} />
                                </div>
                                <p className={`text-[13px] font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>Bekleyen sipariş yok</p>
                                <p className={`text-[11px] mt-1 ${isDark ? 'text-zinc-700' : 'text-zinc-300'}`}>Yeni siparişler burada görünecek</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ============ MEMBERSHIP ============ */}
                {activeSection === 'membership' && isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <SectionLabel label="ÜYELİK SEVİYELERİ" isDark={isDark} />
                        <p className={`text-[11px] mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            Her seviye için gereken minimum yıldız ve indirim oranını ayarlayın.
                        </p>
                        <div className="space-y-2.5">
                            {tiers.map((tier) => {
                                const tierColors = {
                                    orange: 'from-orange-600 to-orange-800',
                                    zinc: 'from-zinc-400 to-zinc-600',
                                    yellow: 'from-yellow-500 to-amber-600',
                                };
                                return (
                                    <div key={tier.id} className={`p-4 rounded-2xl ${cardClass}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tierColors[tier.color] || tierColors.orange} flex items-center justify-center text-white text-sm`}>{tier.emoji}</div>
                                                <span className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{tier.label}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className={`text-[9px] font-bold tracking-wider block mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>MİNİMUM YILDIZ</label>
                                                <input type="number" value={tier.minStars} onChange={(e) => updateTier(tier.id, { minStars: Number(e.target.value) })}
                                                    className={`w-full p-2.5 rounded-xl border text-[13px] font-bold outline-none focus:border-shaco-red/50 transition text-center ${inputClass}`} />
                                            </div>
                                            <div className="flex-1">
                                                <label className={`text-[9px] font-bold tracking-wider block mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>İNDİRİM %</label>
                                                <input type="number" value={tier.discount} onChange={(e) => updateTier(tier.id, { discount: Number(e.target.value) })}
                                                    className={`w-full p-2.5 rounded-xl border text-[13px] font-bold outline-none focus:border-shaco-red/50 transition text-center ${inputClass}`} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* ============ EXTRAS ============ */}
                {activeSection === 'extras' && isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className={`p-4 rounded-2xl mb-4 ${cardClass}`}>
                            <SectionLabel label="YENİ EKSTRA EKLE" isDark={isDark} />
                            <div className="flex gap-2 mb-2">
                                <input value={newExtraName} onChange={(e) => setNewExtraName(e.target.value)} placeholder="Ekstra adı"
                                    className={`flex-1 p-2.5 rounded-xl border text-[12px] outline-none focus:border-shaco-red/50 transition ${inputClass}`} />
                                <input type="number" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} placeholder="₺"
                                    className={`w-20 p-2.5 rounded-xl border text-[12px] outline-none focus:border-shaco-red/50 transition text-center ${inputClass}`} />
                            </div>
                            <button onClick={handleAddExtra}
                                className="w-full py-2.5 rounded-xl bg-shaco-red text-white text-[12px] font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition">
                                <Plus size={14} /> Ekle
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            {extras.map((extra, i) => (
                                <motion.div key={extra.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                    className={`p-3 rounded-2xl flex items-center justify-between ${cardClass}`}>
                                    <div>
                                        <p className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{extra.label}</p>
                                        <p className="text-shaco-red text-[11px] font-bold">+₺{extra.price}</p>
                                    </div>
                                    <button onClick={() => removeExtra(extra.id)}
                                        className={`p-2 rounded-lg transition active:scale-90 ${isDark ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'}`}>
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        {extras.length === 0 && (
                            <p className={`text-center text-sm py-10 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Henüz ekstra yok.</p>
                        )}
                    </motion.div>
                )}

                {/* ============ PRODUCTS ============ */}
                {activeSection === 'products' && isAdmin && !showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-end mb-3">
                            <button onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: 'hot', image: '', isFood: false }); setShowForm(true); }}
                                className="px-4 py-2 rounded-xl text-[11px] font-bold bg-shaco-red text-white shadow-md shadow-red-500/10">
                                + Yeni Ürün
                            </button>
                        </div>
                        <div className="space-y-2">
                            {products.map((p, i) => (
                                <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                    onClick={() => handleEdit(p)}
                                    className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3.5 transition active:scale-[0.98] hover:border-shaco-red/20 ${cardClass}`}>
                                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-semibold text-[13px] truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{p.name}</h3>
                                        <p className={`text-[11px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{p.shortDesc}</p>
                                    </div>
                                    <span className="text-shaco-red font-bold text-[13px] flex-shrink-0">₺{p.price}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ============ PRODUCT FORM ============ */}
                {activeSection === 'products' && isAdmin && showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <p className={`text-[13px] font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            {editingProduct ? `"${editingProduct.name}" Düzenle` : 'Yeni Ürün'}
                        </p>

                        <FormField label="ÜRÜN ADI" isDark={isDark}>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ürün adı"
                                className={`w-full p-3 rounded-xl border text-sm outline-none focus:border-shaco-red/50 transition ${inputClass}`} />
                        </FormField>

                        <FormField label="AÇIKLAMA" isDark={isDark}>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kısa açıklama" rows={2}
                                className={`w-full p-3 rounded-xl border text-sm outline-none focus:border-shaco-red/50 transition resize-none ${inputClass}`} />
                        </FormField>

                        <FormField label="FİYAT (₺)" isDark={isDark}>
                            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0"
                                className={`w-full p-3 rounded-xl border text-sm outline-none focus:border-shaco-red/50 transition ${inputClass}`} />
                        </FormField>

                        <FormField label="KATEGORİ" isDark={isDark}>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => (
                                    <button key={cat.value} onClick={() => setForm({ ...form, category: cat.value })}
                                        className={`px-3 py-2 rounded-xl text-[11px] font-bold transition ${form.category === cat.value
                                            ? 'bg-shaco-red text-white shadow-sm' : isDark ? 'bg-zinc-900 text-zinc-500 border border-zinc-800' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </FormField>

                        <FormField label="ÜRÜN FOTOĞRAFI" isDark={isDark}>
                            {form.image && (
                                <div className="rounded-2xl overflow-hidden mb-3 aspect-[16/10] relative group">
                                    <img src={form.image} alt="" className="w-full h-full object-cover" />
                                    <button onClick={() => setForm({ ...form, image: '' })}
                                        className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition">
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                            <div className="flex gap-2">
                                <button onClick={() => fileInputRef.current?.click()}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition active:scale-[0.97] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-zinc-100 border border-zinc-200 text-zinc-600'}`}>
                                    <Upload size={14} /> Galeriden Yükle
                                </button>
                                <button onClick={() => fileInputRef.current?.click()}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold transition active:scale-[0.97] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-zinc-100 border border-zinc-200 text-zinc-600'}`}>
                                    <ImageIcon size={14} /> Fotoğraf Çek
                                </button>
                            </div>
                        </FormField>

                        <div className="flex gap-2.5 pt-3 pb-8">
                            <button onClick={() => setShowForm(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-[12px] transition ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>İptal</button>
                            <button onClick={() => { alert(editingProduct ? 'Ürün güncellendi!' : 'Ürün eklendi!'); setShowForm(false); }}
                                className="flex-1 py-3.5 rounded-xl font-bold text-[12px] bg-shaco-red text-white shadow-lg shadow-red-500/15 active:scale-[0.97] transition">
                                {editingProduct ? 'Güncelle' : 'Ürünü Ekle'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function SectionLabel({ label, isDark }) {
    return <p className={`text-[10px] font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{label}</p>;
}

function FormField({ label, isDark, children }) {
    return (
        <div>
            <p className={`text-[10px] font-bold tracking-[0.15em] mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{label}</p>
            {children}
        </div>
    );
}
