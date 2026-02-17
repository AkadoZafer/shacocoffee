import { products } from '../data/products';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Coffee, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Menu() {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState('drinks'); // 'drinks' | 'food'

    const filteredProducts = products.filter(p => activeTab === 'food' ? p.isFood : !p.isFood);

    return (
        <div className={`min-h-screen p-6 pb-32 transition-colors duration-300 ${theme === 'dark' ? 'bg-black text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className={`p-2 rounded-full transition ${theme === 'dark' ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-white text-zinc-900 hover:bg-zinc-100 shadow-sm'}`}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className={`text-3xl font-display font-bold uppercase ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Menü</h1>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex p-1 bg-zinc-200 dark:bg-zinc-900 rounded-xl mb-6">
                <button
                    onClick={() => setActiveTab('drinks')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'drinks'
                            ? (theme === 'dark' ? 'bg-zinc-800 text-white shadow-lg' : 'bg-white text-black shadow-md')
                            : (theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-700')
                        }`}
                >
                    <Coffee size={16} />
                    İçecekler
                </button>
                <button
                    onClick={() => setActiveTab('food')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'food'
                            ? (theme === 'dark' ? 'bg-zinc-800 text-white shadow-lg' : 'bg-white text-black shadow-md')
                            : (theme === 'dark' ? 'text-zinc-400 hover:text-zinc-200' : 'text-zinc-500 hover:text-zinc-700')
                        }`}
                >
                    <UtensilsCrossed size={16} />
                    Yiyecekler
                </button>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product, index) => (
                    <Link
                        to={`/product/${product.id}`}
                        key={product.id}
                        className={`
                relative group overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-shaco-red/50 transition duration-500 shadow-md
                ${(index === 0 && activeTab === 'drinks') ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-square'}
            `}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                        <img src={product.image} className="absolute inset-0 w-full h-full object-cover opacity-90 dark:opacity-70 group-hover:scale-110 transition duration-700" alt={product.name} />

                        <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                            {(index === 0 && activeTab === 'drinks') && <span className="text-shaco-red text-[10px] font-bold uppercase tracking-wider mb-1 block">İmza Karışım</span>}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className={`font-display font-bold text-white leading-none ${(index === 0 && activeTab === 'drinks') ? 'text-3xl' : 'text-xl'}`}>{product.name}</h4>
                                    <p className="text-zinc-400 text-xs mt-1 line-clamp-1">{product.shortDesc}</p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white">
                                    ₺{product.price}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-zinc-500 font-bold">Burada henüz kaos yok...</p>
                </div>
            )}
        </div>
    );
}
