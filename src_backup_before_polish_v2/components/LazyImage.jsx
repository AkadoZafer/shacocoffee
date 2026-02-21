import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function LazyImage({ src, alt, className }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setIsLoaded(true);
            setCurrentSrc(src);
        };
    }, [src]);

    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-zinc-800 ${className}`}>
            <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                src={currentSrc}
                alt={alt}
                loading="lazy"
                className={`w-full h-full object-cover transition-transform duration-700 ${isLoaded ? 'scale-100' : 'scale-110 blur-sm'}`}
            />
            {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
            )}
        </div>
    );
}
