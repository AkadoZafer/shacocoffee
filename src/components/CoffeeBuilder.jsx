import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function CoffeeBuilder({ ingredients, onComplete }) {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (step < ingredients.length) {
            const timer = setTimeout(() => {
                setStep(prev => prev + 1);
            }, 600);
            return () => clearTimeout(timer);
        } else {
            const endTimer = setTimeout(() => {
                onComplete();
            }, 1000);
            return () => clearTimeout(endTimer);
        }
    }, [step, ingredients.length, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-[50vh] relative">
            <h3 className="text-shaco-red font-display uppercase tracking-widest mb-12 animate-pulse text-xl">
                {step < ingredients.length ? `Adding ${ingredients[step]}...` : "Brewing Complete"}
            </h3>

            {/* 2D Cup Container */}
            <div className="relative w-40 h-56 border-4 border-white/20 rounded-b-[2.5rem] bg-white/5 backdrop-blur-sm overflow-hidden shadow-2xl">

                {/* Ingredients Stacking */}
                {ingredients.map((ing, index) => (
                    <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        animate={{
                            height: step > index ? `${100 / ingredients.length}%` : 0,
                        }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="w-full absolute bottom-0 left-0 right-0"
                        style={{
                            bottom: `${index * (100 / ingredients.length)}%`,
                            backgroundColor: getColorForIngredient(ing),
                        }}
                    >
                        {/* Surface Ripple */}
                        <motion.div
                            animate={{ top: [0, -3, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: index * 0.2 }}
                            className="absolute top-0 left-0 right-0 h-1 bg-white/20"
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                        />
                    </motion.div>
                ))}
            </div>

            {/* Steam Animation */}
            {step >= ingredients.length && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full flex gap-2">
                    {[1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 0 }}
                            animate={{ opacity: [0, 0.4, 0], y: -40 }}
                            transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                            className="w-2 h-8 bg-white/30 blur-md rounded-full"
                        />
                    ))}
                </div>
            )}

            <div className="mt-8 text-zinc-500 font-mono text-xs">
                {Math.round((Math.min(step, ingredients.length) / ingredients.length) * 100)}%
            </div>
        </div>
    );
}

function getColorForIngredient(name) {
    const n = name.toLowerCase();
    if (n.includes("milk") || n.includes("cream")) return "#F5F5DC"; // Beige
    if (n.includes("espresso") || n.includes("coffee")) return "#3b2f2f"; // Dark Brown
    if (n.includes("chocolate") || n.includes("cocoa")) return "#5D4037"; // Brown
    if (n.includes("water") || n.includes("hot")) return "#E0F7FA"; // Light Blue
    if (n.includes("foam")) return "#FFFFFF";
    if (n.includes("syrup") || n.includes("sugar")) return "#FFB74D"; // Orange-ish
    if (n.includes("tea")) return "#4CAF50"; // Green
    if (n.includes("ice")) return "#B3E5FC"; // Ice Blue
    if (n.includes("red")) return "#ef4444"; // Shaco Red
    return "#8D6E63"; // Default Brown
}
