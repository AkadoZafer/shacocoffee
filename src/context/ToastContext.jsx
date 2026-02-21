import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

export const useToast = () => useContext(ToastContext);

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
            <AnimatePresence>
                {toasts.map(toast => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
                        layout
                        className="pointer-events-auto bg-zinc-900 border border-zinc-800 text-white shadow-2xl rounded-2xl p-4 flex items-center gap-3 w-full"
                    >
                        {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-500 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle size={20} className="text-red-500 shrink-0" />}
                        {toast.type === 'info' && <Info size={20} className="text-blue-500 shrink-0" />}

                        <p className="text-base font-medium flex-1">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-zinc-800 rounded-lg shrink-0 text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
