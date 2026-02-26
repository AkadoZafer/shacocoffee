import { useTheme } from '../context/ThemeContext';
import { MapPin, Navigation, Phone, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const stores = [
    {
        id: 1,
        name: "Shaco Coffee - Meram",
        address: "Melikşah, Melikşah Cd. NO:121/A, 42090 Meram/Konya",
        distance: "Merkez",
        rating: 5.0,
        image: "/store-meram.jpg",
        status: "Açık",
        closesAt: "00:00",
        mapUrl: "https://www.google.com/maps/search/?api=1&query=Melikşah,+Melikşah+Cd.+NO:121/A,+42090+Meram/Konya"
    }
];

export default function Stores() {
    const { theme } = useTheme();

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            <header className="mb-8">
                <h1 className="text-3xl font-display font-bold uppercase mb-2">Mağazalar</h1>
                <p className={`text-base ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>En yakın kahve noktalarımız</p>
            </header>

            <div className="space-y-6">
                {stores.map((store, index) => (
                    <motion.div
                        key={store.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-3xl overflow-hidden border ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-lg shadow-zinc-200/50'}`}
                    >
                        <div className="h-40 relative">
                            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-zinc-900 text-base font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                4.4 <span className="text-zinc-500 font-normal">(138)</span>
                            </div>
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold font-display text-lg">{store.name}</h3>
                                <span className="text-shaco-red font-bold text-base bg-shaco-red/10 px-2 py-1 rounded-lg">{store.distance}</span>
                            </div>

                            <div className="flex items-start gap-2 mb-6">
                                <MapPin size={16} className="text-zinc-400 mt-1 shrink-0" />
                                <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                    {store.address}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <a
                                    href={store.mapUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`flex-1 py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition ${theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                                >
                                    <Navigation size={16} />
                                    Yol Tarifi
                                </a>
                                <button className={`p-3 rounded-xl border flex items-center justify-center transition ${theme === 'dark' ? 'border-zinc-700 hover:bg-zinc-800' : 'border-zinc-200 hover:bg-zinc-50'}`}>
                                    <Phone size={18} className="text-zinc-500" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
