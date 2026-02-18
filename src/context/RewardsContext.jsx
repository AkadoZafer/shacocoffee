import { createContext, useContext, useState, useEffect } from 'react';

const RewardsContext = createContext();

function generateOrderCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SHC-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

export function RewardsProvider({ children }) {
    const [stars, setStars] = useState(12);
    const [balance, setBalance] = useState(150);
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);

    // Stamp card: 0-8, at 8 = free drink
    const [stampCount, setStampCount] = useState(() => {
        const saved = localStorage.getItem('shaco_stamps');
        return saved ? parseInt(saved) : 0;
    });
    const [stampJustEarned, setStampJustEarned] = useState(false);
    const [freeRewardAvailable, setFreeRewardAvailable] = useState(() => {
        return localStorage.getItem('shaco_free_reward') === 'true';
    });

    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('shaco_cart');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('shaco_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('shaco_stamps', String(stampCount));
    }, [stampCount]);

    useEffect(() => {
        localStorage.setItem('shaco_free_reward', String(freeRewardAvailable));
    }, [freeRewardAvailable]);

    const addStar = (amount) => {
        setStars(prev => prev + amount);
    };

    const deductBalance = (amount) => {
        if (balance >= amount) {
            setBalance(prev => prev - amount);
            const newTransaction = {
                id: Date.now(),
                amount,
                type: 'purchase',
                date: new Date().toLocaleDateString(),
            };
            setTransactions(prev => [newTransaction, ...prev]);
            return true;
        }
        return false;
    };

    const topUpBalance = (amount) => {
        setBalance(prev => prev + amount);
        const newTransaction = {
            id: Date.now(),
            amount: amount,
            type: 'topup',
            date: new Date().toLocaleDateString(),
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const addToCart = (product, customizations, totalPrice) => {
        const newItem = {
            id: Date.now() + Math.random(),
            product,
            customizations,
            totalPrice
        };
        setCart(prev => [...prev, newItem]);
        return true;
    };

    const removeFromCart = (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
    };

    const clearCart = () => setCart([]);

    const checkoutCart = () => {
        const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);
        if (deductBalance(total)) {
            const orderCode = generateOrderCode();
            const newOrder = {
                id: Date.now(),
                code: orderCode,
                items: cart.map(item => ({
                    name: item.product.name,
                    customizations: item.customizations,
                    price: item.totalPrice,
                    quantity: 1,
                })),
                total,
                status: 'Bekliyor',
                timestamp: new Date(),
            };

            setOrders(prev => [newOrder, ...prev]);
            setActiveOrder(newOrder);
            addStar(cart.length * 5);

            // Stamp card: add 1 stamp per checkout
            setStampCount(prev => {
                const next = prev + 1;
                if (next >= 8) {
                    setFreeRewardAvailable(true);
                    return 0; // Reset card
                }
                setStampJustEarned(true);
                setTimeout(() => setStampJustEarned(false), 2000);
                return next;
            });

            clearCart();

            return newOrder;
        }
        return null;
    };

    const dismissActiveOrder = () => setActiveOrder(null);

    const confirmOrder = (orderCode) => {
        setOrders(prev => prev.map(o =>
            o.code === orderCode ? { ...o, status: 'Onaylandı' } : o
        ));
        if (activeOrder?.code === orderCode) {
            setActiveOrder(prev => prev ? { ...prev, status: 'Onaylandı' } : null);
        }
    };

    const cancelOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order && order.status === 'Bekliyor') {
            setBalance(prev => prev + order.total);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            if (activeOrder?.id === orderId) setActiveOrder(null);
            return true;
        }
        return false;
    };

    return (
        <RewardsContext.Provider value={{
            stars,
            balance,
            transactions,
            orders,
            activeOrder,
            addStar,
            deductBalance,
            topUpBalance,
            addBalance: topUpBalance,
            addToCart,
            removeFromCart,
            clearCart,
            checkoutCart,
            dismissActiveOrder,
            confirmOrder,
            cancelOrder,
            cart,
            stampCount,
            stampJustEarned,
            freeRewardAvailable,
            setFreeRewardAvailable,
        }}>
            {children}
        </RewardsContext.Provider>
    );
}

export function useRewards() {
    return useContext(RewardsContext);
}
