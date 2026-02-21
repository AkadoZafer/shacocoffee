import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useExtras } from '../context/ExtrasContext';
import { useMembership } from '../context/MembershipContext';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import { useSocialMedia } from '../context/SocialMediaContext';
import { useNavigate } from 'react-router-dom';
import { X, ImageIcon, Upload, Plus, Trash2, QrCode, Check, Crown, Shield, Coffee, Camera, Share2, DollarSign, Star } from 'lucide-react';
import { products as initialProducts } from '../data/products';
import { Html5Qrcode } from 'html5-qrcode';

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
    const { orders, confirmOrder, isFrequentItem } = useRewards();
    const { accounts: socialAccounts, addAccount: addSocialAccount, removeAccount: removeSocialAccount, updateAccount: updateSocialAccount, PLATFORM_OPTIONS } = useSocialMedia();
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

    // Barista Scanner State
    const [scannerAmount, setScannerAmount] = useState('');
    const [scanResult, setScanResult] = useState(null);
    const [scanError, setScanError] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const scannerRef = useRef(null);

    // Load registered customers for Barista
    const [customers, setCustomers] = useState([]);
    useEffect(() => {
        try {
            const stored = localStorage.getItem('shaco_customers');
            setCustomers(stored ? JSON.parse(stored) : []);
        } catch (e) {
            setCustomers([]);
        }
    }, [scanResult]);

    const isDark = theme === 'dark';
    const cardClass = isDark ? 'bg-zinc-900/80 border border-zinc-800' : 'bg-white border border-zinc-200 shadow-sm';
    const inputClass = isDark ? 'bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400';

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

    // Real Camera QR Scanner Logic using HTML5-QRCode
    const startScanner = () => {
        if (!scannerAmount || Number(scannerAmount) <= 0) {
            setScanError('Lütfen tarama öncesi ödenecek tutarı girin.');
            return;
        }
        setScanError('');
        setScanResult(null);
        setIsScanning(true);

        setTimeout(async () => {
            try {
                const html5QrCode = new Html5Qrcode("barista-qr-reader");
                scannerRef.current = html5QrCode;

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 }
                    },
                    (decodedText) => {
                        try {
                            const data = JSON.parse(decodedText);
                            if (data.action === "pay" && data.userId) {
                                handleTransaction(data.userId, Number(scannerAmount));
                                html5QrCode.stop().catch(console.error);
                                setIsScanning(false);
                            } else {
                                setScanError('Geçersiz QR formatı.');
                            }
                        } catch (e) {
                            setScanError('QR Kodu okunamadı.');
                        }
                    },
                    (err) => {
                        // Ignore background scan errors
                    }
                );
            } catch (err) {
                console.error("Camera error:", err);
                setScanError('Kamera başlatılamadı. İzinleri kontrol edin.');
                setIsScanning(false);
            }
        }, 300);
    };

    const stopScanner = () => {
        if (scannerRef.current) {
            try {
                // html5-qrcode throws an error if we call stop() when it isn't scanning.
                if (scannerRef.current.getState && scannerRef.current.getState() === 2) {
                    scannerRef.current.stop().catch(console.error);
                }
            } catch (e) {
                console.error("Stop scanner error", e);
            }
            scannerRef.current = null;
        }
        setIsScanning(false);
    };

    const handleTransaction = (userId, amount) => {
        // Find user by ID (In reality, we'd search the backend. Here we update mock db)
        setScanResult({ success: true, message: `₺${amount} ödeme başarıyla alındı!` });
        setScannerAmount('');
        // NOTE: A real app would deduct the specific user's balance in backend. 
        // For local demo, we just show success. 
    };

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.getState && scannerRef.current.getState() === 2) {
                        scannerRef.current.stop().catch(() => { });
                    }
                } catch (e) { }
            }
        };
    }, []);

    const adminSections = [
        { key: 'products', label: 'Ürünler', icon: <Coffee size={12} /> },
        { key: 'extras', label: 'Ekstralar', icon: <Plus size={12} /> },
        { key: 'membership', label: 'Üyelik', icon: <Crown size={12} /> },
        { key: 'users', label: 'Bakiye & Log', icon: <QrCode size={12} /> },
        { key: 'social', label: 'Sosyal Medya', icon: <Share2 size={12} /> },
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
                            <p className={`text-[15px] ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                Hoş geldin, {user?.name || 'Kullanıcı'} 👋
                            </p>
                        </div>
                        <div className={`px-2 py-1 rounded-lg text-base font-bold ${isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-sky-500/10 text-sky-400'}`}>
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
                            className={`px-3.5 py-2 rounded-xl text-[15px] font-bold tracking-wide flex items-center gap-1.5 whitespace-nowrap transition ${activeSection === s.key
                                ? 'bg-zinc-800 text-white border border-zinc-700'
                                : isDark ? 'border border-zinc-800 text-zinc-500' : 'border border-zinc-300 text-zinc-400'
                                }`}
                        >
                            {s.icon} {s.label}
                        </button>
                    ))}
                </div>

                {/* ============ ORDERS / BARISTA ============ */}
                {activeSection === 'orders' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                        {/* Payment Terminal Section */}
                        <div className={`rounded-2xl overflow-hidden mb-5 ${cardClass}`}>
                            <div className="p-4 border-b border-zinc-800/10 dark:border-zinc-800">
                                <SectionLabel label="ÖDEME AL (TARAT & ÇEK)" isDark={isDark} />
                                <p className={`text-[13px] mb-3 leading-relaxed ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                                    Ödenecek tutarı girin ve müşterinin QR kodunu taratın. Tutar sistemdeki bakiyesinden anında düşecektir.
                                </p>

                                {/* Input Amount */}
                                <div className="flex gap-2 mb-4">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-zinc-500 font-bold">₺</span>
                                        </div>
                                        <input
                                            type="number"
                                            value={scannerAmount}
                                            onChange={(e) => setScannerAmount(e.target.value)}
                                            placeholder="Tutar (örn. 85.00)"
                                            className={`w-full pl-8 pr-3 py-3 rounded-xl border text-[16px] font-bold outline-none focus:border-emerald-500 transition ${isDark ? 'bg-black border-zinc-800 text-white placeholder:text-zinc-700' : 'bg-white border-zinc-300 text-black placeholder:text-zinc-400'}`}
                                            disabled={isScanning}
                                        />
                                    </div>
                                    <button
                                        onClick={isScanning ? stopScanner : startScanner}
                                        className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition active:scale-95 ${isScanning ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-emerald-500 text-white shadow-emerald-500/30'} ${(!scannerAmount || scannerAmount <= 0) && !isScanning ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={(!scannerAmount || scannerAmount <= 0) && !isScanning}
                                    >
                                        {isScanning ? <X size={18} /> : <Camera size={18} />}
                                        {isScanning ? 'İptal' : 'Tarat'}
                                    </button>
                                </div>

                                {scanError && <p className="text-red-500 text-sm font-bold mb-2">{scanError}</p>}
                                {scanResult && (
                                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl flex gap-2 items-center text-sm font-bold mb-4">
                                        <Check size={16} />
                                        {scanResult.message}
                                    </div>
                                )}
                            </div>

                            {isScanning && (
                                <div className="p-4 bg-black/90">
                                    <div id="barista-qr-reader" className="w-full bg-white rounded-xl overflow-hidden shadow-inner"></div>
                                </div>
                            )}
                        </div>

                        {/* Incoming Orders Section */}
                        <div className="mt-8">
                            <SectionLabel label="GELEN SİPARİŞLER" isDark={isDark} />
                            <div className="space-y-3">
                                {orders.filter(o => o.status === 'Bekliyor').length === 0 ? (
                                    <p className={`text-sm ${isDark ? 'text-zinc-600' : 'text-zinc-400'} italic`}>Şu an bekleyen yeni sipariş bulunmuyor.</p>
                                ) : (
                                    orders.filter(o => o.status === 'Bekliyor').map(order => (
                                        <div key={order.id} className={`p-4 rounded-xl border-l-4 border-l-blue-500 relative overflow-hidden ${cardClass}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>SİPARİŞ NO: {order.code}</p>
                                                    <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{order.customerName || 'Müşteri'}</p>
                                                </div>
                                                <span className="text-shaco-red font-bold text-lg">₺{order.total}</span>
                                            </div>

                                            <div className="space-y-2 mt-3 p-3 rounded-lg bg-black/5 dark:bg-white/5">
                                                {order.items?.map((item, idx) => {
                                                    const isFreq = isFrequentItem(order.userId, item.name);
                                                    return (
                                                        <div key={idx} className="flex justify-between items-start">
                                                            <div>
                                                                <p className={`text-[15px] font-semibold flex items-center gap-1.5 ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                                                                    {item.quantity || 1}x {item.name}
                                                                    {isFreq && (
                                                                        <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-0.5">
                                                                            <Star size={10} className="fill-white" /> Müdavim Ürünü
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                {item.customizations?.length > 0 && (
                                                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>{item.customizations.join(', ')}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button onClick={() => confirmOrder(order.code)}
                                                    className="px-4 py-2 rounded-lg font-bold text-sm bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95 transition flex items-center gap-1.5">
                                                    <Check size={14} /> Hazırla & Onayla
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </motion.div>
                )}

                {/* ============ MEMBERSHIP ============ */}
                {activeSection === 'membership' && isAdmin && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <SectionLabel label="ÜYELİK SEVİYELERİ" isDark={isDark} />
                        <p className={`text-[15px] mb-4 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
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
                                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tierColors[tier.color] || tierColors.orange} flex items-center justify-center text-white text-base`}>{tier.emoji}</div>
                                                <span className={`text-[14px] font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{tier.label}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <label className={`text-[15px] font-bold tracking-wider block mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>MİNİMUM YILDIZ</label>
                                                <input type="number" value={tier.minStars} onChange={(e) => updateTier(tier.id, { minStars: Number(e.target.value) })}
                                                    className={`w-full p-2.5 rounded-xl border text-[15px] font-bold outline-none focus:border-shaco-red/50 transition text-center ${inputClass}`} />
                                            </div>
                                            <div className="flex-1">
                                                <label className={`text-[15px] font-bold tracking-wider block mb-1 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>İNDİRİM %</label>
                                                <input type="number" value={tier.discount} onChange={(e) => updateTier(tier.id, { discount: Number(e.target.value) })}
                                                    className={`w-full p-2.5 rounded-xl border text-[15px] font-bold outline-none focus:border-shaco-red/50 transition text-center ${inputClass}`} />
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
                                    className={`flex-1 p-2.5 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition ${inputClass}`} />
                                <input type="number" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} placeholder="₺"
                                    className={`w-20 p-2.5 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition text-center ${inputClass}`} />
                            </div>
                            <button onClick={handleAddExtra}
                                className="w-full py-2.5 rounded-xl bg-shaco-red text-white text-base font-bold flex items-center justify-center gap-1.5 active:scale-[0.97] transition">
                                <Plus size={14} /> Ekle
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            {extras.map((extra, i) => (
                                <motion.div key={extra.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                                    className={`p-3 rounded-2xl flex items-center justify-between ${cardClass}`}>
                                    <div>
                                        <p className={`text-[15px] font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>{extra.label}</p>
                                        <p className="text-shaco-red text-[15px] font-bold">+₺{extra.price}</p>
                                    </div>
                                    <button onClick={() => removeExtra(extra.id)}
                                        className={`p-2 rounded-lg transition active:scale-90 ${isDark ? 'text-zinc-600 hover:text-red-400 hover:bg-red-500/10' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'}`}>
                                        <Trash2 size={14} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                        {extras.length === 0 && (
                            <p className={`text-center text-base py-10 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>Henüz ekstra yok.</p>
                        )}
                    </motion.div>
                )}

                {/* ============ PRODUCTS ============ */}
                {activeSection === 'products' && isAdmin && !showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-end mb-3">
                            <button onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: 'hot', image: '', isFood: false }); setShowForm(true); }}
                                className="px-4 py-2 rounded-xl text-[15px] font-bold bg-shaco-red text-white shadow-md shadow-red-500/10">
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
                                        <h3 className={`font-semibold text-[15px] truncate ${isDark ? 'text-white' : 'text-zinc-900'}`}>{p.name}</h3>
                                        <p className={`text-[15px] truncate ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{p.shortDesc}</p>
                                    </div>
                                    <span className="text-shaco-red font-bold text-[15px] flex-shrink-0">₺{p.price}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ============ PRODUCT FORM ============ */}
                {activeSection === 'products' && isAdmin && showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                        <p className={`text-[15px] font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                            {editingProduct ? `"${editingProduct.name}" Düzenle` : 'Yeni Ürün'}
                        </p>

                        <FormField label="ÜRÜN ADI" isDark={isDark}>
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ürün adı"
                                className={`w-full p-3 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition ${inputClass}`} />
                        </FormField>

                        <FormField label="AÇIKLAMA" isDark={isDark}>
                            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Kısa açıklama" rows={2}
                                className={`w-full p-3 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition resize-none ${inputClass}`} />
                        </FormField>

                        <FormField label="FİYAT (₺)" isDark={isDark}>
                            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0"
                                className={`w-full p-3 rounded-xl border text-base outline-none focus:border-shaco-red/50 transition ${inputClass}`} />
                        </FormField>

                        <FormField label="KATEGORİ" isDark={isDark}>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.map((cat) => (
                                    <button key={cat.value} onClick={() => setForm({ ...form, category: cat.value })}
                                        className={`px-3 py-2 rounded-xl text-[15px] font-bold transition ${form.category === cat.value
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
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition active:scale-[0.97] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-zinc-100 border border-zinc-200 text-zinc-600'}`}>
                                    <Upload size={14} /> Galeriden Yükle
                                </button>
                                <button onClick={() => fileInputRef.current?.click()}
                                    className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-base font-bold transition active:scale-[0.97] ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' : 'bg-zinc-100 border border-zinc-200 text-zinc-600'}`}>
                                    <ImageIcon size={14} /> Fotoğraf Çek
                                </button>
                            </div>
                        </FormField>

                        <div className="flex gap-2.5 pt-3 pb-8">
                            <button onClick={() => setShowForm(false)} className={`flex-1 py-3.5 rounded-xl font-bold text-base transition ${isDark ? 'bg-zinc-900 border border-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'}`}>İptal</button>
                            <button onClick={() => { alert(editingProduct ? 'Ürün güncellendi!' : 'Ürün eklendi!'); setShowForm(false); }}
                                className="flex-1 py-3.5 rounded-xl font-bold text-base bg-shaco-red text-white shadow-lg shadow-red-500/15 active:scale-[0.97] transition">
                                {editingProduct ? 'Güncelle' : 'Ürünü Ekle'}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* ============ SOCIAL MEDIA ============ */}
                {activeSection === 'social' && isAdmin && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <SectionLabel label="MEVCUT HESAPLAR" isDark={isDark} />
                        {socialAccounts.length === 0 ? (
                            <p className={`text-center text-base py-6 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                Henüz sosyal medya hesabı eklenmemiş.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {socialAccounts.map(account => {
                                    const platformInfo = PLATFORM_OPTIONS.find(p => p.key === account.platform);
                                    return (
                                        <div key={account.id} className={`p-3.5 rounded-xl flex items-center gap-3 ${cardClass}`}>
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[15px] font-bold shrink-0"
                                                style={{ backgroundColor: platformInfo?.color || '#666' }}
                                            >
                                                {platformInfo?.label?.slice(0, 2).toUpperCase() || '??'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                                                    {platformInfo?.label || account.platform}
                                                </p>
                                                <p className={`text-base truncate ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>{account.username}</p>
                                            </div>
                                            <button
                                                onClick={() => removeSocialAccount(account.id)}
                                                className="text-red-500/60 hover:text-red-500 transition p-1.5"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <SectionLabel label="YENİ HESAP EKLE" isDark={isDark} />
                        <div className={`p-4 rounded-xl space-y-3 ${cardClass}`}>
                            <FormField label="PLATFORM" isDark={isDark}>
                                <select
                                    value={newSocialPlatform}
                                    onChange={(e) => {
                                        setNewSocialPlatform(e.target.value);
                                        const plat = PLATFORM_OPTIONS.find(p => p.key === e.target.value);
                                        if (plat && newSocialUsername) {
                                            setNewSocialUrl(plat.urlPrefix + newSocialUsername.replace('@', ''));
                                        }
                                    }}
                                    className={`w-full px-3 py-2.5 rounded-xl border text-base font-semibold ${inputClass}`}
                                >
                                    {PLATFORM_OPTIONS.map(p => (
                                        <option key={p.key} value={p.key}>{p.label}</option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="KULLANICI ADI" isDark={isDark}>
                                <input
                                    type="text"
                                    value={newSocialUsername}
                                    onChange={(e) => {
                                        setNewSocialUsername(e.target.value);
                                        const plat = PLATFORM_OPTIONS.find(p => p.key === newSocialPlatform);
                                        if (plat) {
                                            setNewSocialUrl(plat.urlPrefix + e.target.value.replace('@', ''));
                                        }
                                    }}
                                    placeholder="@shacocoffee"
                                    className={`w-full px-3 py-2.5 rounded-xl border text-base font-semibold ${inputClass}`}
                                />
                            </FormField>

                            <FormField label="URL" isDark={isDark}>
                                <input
                                    type="text"
                                    value={newSocialUrl}
                                    onChange={(e) => setNewSocialUrl(e.target.value)}
                                    placeholder="https://instagram.com/shacocoffee"
                                    className={`w-full px-3 py-2.5 rounded-xl border text-base font-semibold ${inputClass}`}
                                />
                            </FormField>

                            <button
                                onClick={() => {
                                    if (newSocialUsername.trim() && newSocialUrl.trim()) {
                                        addSocialAccount(newSocialPlatform, newSocialUsername.trim(), newSocialUrl.trim());
                                        setNewSocialUsername('');
                                        setNewSocialUrl('');
                                    }
                                }}
                                disabled={!newSocialUsername.trim() || !newSocialUrl.trim()}
                                className="w-full py-3 rounded-xl font-bold text-base bg-shaco-red text-white shadow-lg shadow-red-500/15 active:scale-[0.97] transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Plus size={14} /> Hesap Ekle
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div >
    );
}

function SectionLabel({ label, isDark }) {
    return <p className={`text-base font-bold tracking-[0.15em] mb-2.5 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{label}</p>;
}

function FormField({ label, isDark, children }) {
    return (
        <div>
            <p className={`text-base font-bold tracking-[0.15em] mb-2 ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>{label}</p>
            {children}
        </div>
    );
}
