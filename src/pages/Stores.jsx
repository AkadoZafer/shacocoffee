import { useTheme } from '../context/ThemeContext';
import { MapPin, Navigation, Phone, Clock, Star, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { fetchBranches } from '../services/menuService';
import { useTranslation } from 'react-i18next';

// Haversine formula to calculate distance between two points
function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export default function Stores() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const { t } = useTranslation();
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);

    const [stores, setStores] = useState([]);
    const [loadingStores, setLoadingStores] = useState(true);
    const [expandedStore, setExpandedStore] = useState(null);

    useEffect(() => {
        const loadStores = async () => {
            try {
                const data = await fetchBranches();
                setStores(data);
            } catch (err) {
                console.error("Mağazalar yüklenemedi", err);
            } finally {
                setLoadingStores(false);
            }
        };
        loadStores();

        if (!navigator.geolocation) {
            setLocationError('Konum desteklenmiyor');
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setLoadingLocation(false);
            },
            (error) => {
                setLocationError('Konum izni reddedildi');
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    const getDistance = (store) => {
        if (loadingLocation) return null;
        if (!userLocation) return locationError || 'Konum kapalı';

        const storeLat = store.coordinates?.lat ?? store.location?.lat ?? null;
        const storeLng = store.coordinates?.lng ?? store.location?.lng ?? null;

        if (storeLat == null || storeLng == null) return 'Uzaklık hesaplanamıyor';

        const dist = getDistanceKm(userLocation.lat, userLocation.lng, storeLat, storeLng);
        if (dist < 1) return `${Math.round(dist * 1000)} m`;
        return `${dist.toFixed(1)} km`;
    };

    // Calculate if store is currently open
    const checkStoreStatus = (workingHours) => {
        if (!workingHours) return { isOpen: false, text: 'Saat bilgisi yok' };

        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const todayHours = isWeekend ? workingHours.weekend : workingHours.weekdays;

        if (!todayHours || !todayHours.open || !todayHours.close) return { isOpen: false, text: t('stores.closed') };

        const openStr = todayHours.open;
        const closeStr = todayHours.close;
        if (!openStr || !closeStr) return { isOpen: false, text: 'Kapalı' };

        const currentHour = now.getHours();
        const currentMin = now.getMinutes();

        const [oH, oM] = openStr.split(':').map(Number);
        const [cH, cM] = closeStr.split(':').map(Number);

        const nowMinutes = currentHour * 60 + currentMin;
        const openMinutes = oH * 60 + oM;
        let closeMinutes = cH * 60 + cM;

        // Handle midnight closing time (e.g. 00:00 or 01:00 logically means next day 24:00 or 25:00)
        if (closeMinutes < openMinutes) {
            closeMinutes += 24 * 60;
        }

        // Handle current time if it's past midnight but still "business day"
        let logicNowMinutes = nowMinutes;
        if (nowMinutes < openMinutes && currentHour < 5) logicNowMinutes += 24 * 60;

        if (logicNowMinutes >= openMinutes && logicNowMinutes < closeMinutes) {
            return { isOpen: true, text: `${t('stores.open')} · ${t('branch_card.closes_at').replace('{{time}}', closeStr)}` };
        } else {
            return { isOpen: false, text: `${t('stores.closed')} · ${t('branch_card.opens_at').replace('{{time}}', openStr)}` };
        }
    };

    if (loadingStores) {
        return (
            <div className={`min-h-screen pt-24 flex items-center justify-center ${isDark ? 'bg-black' : 'bg-zinc-50'}`}>
                <Loader className="animate-spin text-shaco-red" size={40} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <header className="mb-8 pt-4">
                <h1 className="text-3xl font-display font-bold uppercase mb-2">{t('stores.title')}</h1>
                <p className={`text-base ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>{t('stores.subtitle')}</p>
            </header>

            <div className="space-y-6">
                {stores.map((store, index) => {
                    const status = checkStoreStatus(store.workingHours);
                    const isExpanded = expandedStore === store.id;

                    return (
                        <motion.div
                            key={store.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                            className={`rounded-3xl overflow-hidden glass-liquid ${isDark ? 'border-zinc-800' : 'border-zinc-200 shadow-md bg-white/60'}`}
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-bold font-serif text-xl tracking-wide">{store.name}</h3>
                                        <p className="text-sm font-medium text-shaco-red flex items-center gap-1.5 mt-1">
                                            {loadingLocation ? (
                                                <><Loader size={12} className="animate-spin" /> Hesaplanıyor</>
                                            ) : (
                                                <><MapPin size={12} /> Uzaklık: {getDistance(store)}</>
                                            )}
                                        </p>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-md text-xs font-bold border ${status.isOpen ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'}`}>
                                        {status.isOpen ? t('stores.open') : t('stores.closed')}
                                    </div>
                                </div>

                                <div className={`flex items-start gap-2.5 mb-5 text-[15px] ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                    <p className="leading-relaxed">{store.address}</p>
                                </div>

                                {/* Working Hours Accordion */}
                                <div className={`mb-5 rounded-2xl overflow-hidden border ${isDark ? 'border-zinc-800 bg-black/20' : 'border-zinc-100 bg-black/5'}`}>
                                    <button
                                        onClick={() => setExpandedStore(isExpanded ? null : store.id)}
                                        className="w-full p-4 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className={status.isOpen ? 'text-emerald-500' : 'text-zinc-500'} />
                                            <span className={`text-[15px] font-bold ${status.isOpen ? 'text-emerald-500' : 'text-zinc-500'}`}>
                                                {status.text}
                                            </span>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && store.workingHours && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                                className={`px-4 pb-4 text-sm space-y-2.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}
                                            >
                                                <div className="flex justify-between items-center">
                                                    <span className={new Date().getDay() !== 0 && new Date().getDay() !== 6 ? (isDark ? 'text-white font-bold' : 'text-black font-bold') : ''}>{t('stores.weekdays')}</span>
                                                    <span className={`font-mono ${new Date().getDay() !== 0 && new Date().getDay() !== 6 ? (isDark ? 'text-white font-bold' : 'text-black font-bold') : ''}`}>{store.workingHours.weekdays?.open} - {store.workingHours.weekdays?.close}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className={new Date().getDay() === 0 || new Date().getDay() === 6 ? (isDark ? 'text-white font-bold' : 'text-black font-bold') : ''}>{t('stores.weekend')}</span>
                                                    <span className={`font-mono ${new Date().getDay() === 0 || new Date().getDay() === 6 ? (isDark ? 'text-white font-bold' : 'text-black font-bold') : ''}`}>{store.workingHours.weekend?.open} - {store.workingHours.weekend?.close}</span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex gap-3">
                                    {store.coordinates?.lat || store.location?.lat ? (
                                        <a href={`https://maps.google.com/?q=${store.coordinates?.lat ?? store.location?.lat},${store.coordinates?.lng ?? store.location?.lng}`} target="_blank" rel="noreferrer"
                                            className={`flex-1 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${isDark ? 'bg-white text-black hover:bg-zinc-200 shadow-white/5' : 'bg-zinc-900 text-white shadow-black/10'}`}
                                        >
                                            <Navigation size={16} /> Yol Tarifi
                                        </a>
                                    ) : (
                                        <div className={`flex-1 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 border opacity-60 cursor-not-allowed ${isDark ? 'border-zinc-800 text-zinc-500 bg-black/20' : 'border-zinc-200 text-zinc-400 bg-zinc-50'}`}>
                                            <Navigation size={16} /> Yol Tarifi Kapalı
                                        </div>
                                    )}
                                    <a href={`tel:${store.phone.replace(/\s+/g, '')}`} className={`w-14 rounded-xl flex items-center justify-center transition active:scale-[0.98] ${isDark ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-white border text-zinc-700 hover:bg-zinc-50'}`}>
                                        <Phone size={18} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
