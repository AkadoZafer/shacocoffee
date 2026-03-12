import { useState } from 'react';
import { motion } from 'framer-motion';

export default function LazyImage({ src, alt, className }) {
    if (!src) {
        return (
            <div className={`relative overflow-hidden glass-liquid bg-zinc-200/50 dark:bg-zinc-800/50 flex flex-col items-center justify-center ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-warm-amber/10 to-transparent" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-400 dark:text-zinc-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.365 5.25 5.25 0 00-10.233-2.33A4.502 4.502 0 002.25 15z" />
                </svg>
            </div>
        );
    }

    return <ImageWithState key={src} src={src} alt={alt} className={className} />;
}

function ImageWithState({ src, alt, className }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);

    if (isError) {
        return (
            <div className={`relative overflow-hidden glass-liquid bg-zinc-200/50 dark:bg-zinc-800/50 flex flex-col items-center justify-center ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-warm-amber/10 to-transparent" />
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-zinc-400 dark:text-zinc-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.365 5.25 5.25 0 00-10.233-2.33A4.502 4.502 0 002.25 15z" />
                </svg>
            </div>
        );
    }

    return (
        <div className={`relative overflow-hidden bg-gray-200 dark:bg-zinc-800 ${className}`}>
            <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: isLoaded ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                src={src}
                alt={alt}
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsError(true)}
                className={`w-full h-full object-cover transition-transform duration-700 ${isLoaded ? 'scale-100' : 'scale-110 blur-sm'}`}
            />
            {!isLoaded && !isError && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                </div>
            )}
        </div>
    );
}
