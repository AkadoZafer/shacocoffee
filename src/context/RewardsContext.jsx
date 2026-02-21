import { createContext, useContext, useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, addDoc, query, where, orderBy, serverTimestamp, getDoc } from 'firebase/firestore';

const RewardsContext = createContext();

function generateOrderCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'SHC-';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
}

export function RewardsProvider({ children }) {
    const { user } = useAuth();

    const [stars, setStars] = useState(0);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);

    // Stamp card: 0-8, at 8 = free drink
    const [stampCount, setStampCount] = useState(0);
    const [stampJustEarned, setStampJustEarned] = useState(false);
    const [freeRewardAvailable, setFreeRewardAvailable] = useState(() => {
        return localStorage.getItem('shaco_free_reward') === 'true';
    });

    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('shaco_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    useEffect(() => {
        localStorage.setItem('shaco_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('shaco_free_reward', String(freeRewardAvailable));
    }, [freeRewardAvailable]);

    // Firestore Listener: User Data (Balance, Stars, Stamps, Transactions)
    useEffect(() => {
        if (!user || user.role === 'guest' || !user.uid) {
            // Sadece misafirken 150'ye ayarla
            if (balance === 0) setBalance(150);
            return;
        }

        const userRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBalance(data.balance || 0);
                setStars(data.stars || 0);
                setTransactions(data.transactions || []);
                setStampCount(data.stampCount || 0);

                // Initial setup for new accounts
                if (data.balance === undefined) {
                    updateDoc(userRef, { balance: 150, stars: 12, stampCount: 0, transactions: [] });
                }
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Firestore Listener: Orders
    useEffect(() => {
        if (!user || user.role === 'guest' || !user.uid) {
            setOrders([]);
            return;
        }

        const ordersRef = collection(db, 'orders');
        let q;

        if (user.role === 'admin' || user.role === 'barista') {
            q = query(ordersRef, orderBy('timestamp', 'desc'));
        } else {
            // Composite index error önlemek için sadece where ile çekip, sıralamayı JS ile yapıyoruz.
            q = query(ordersRef, where('userId', '==', user.uid));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let fetchedOrders = [];
            snapshot.forEach(doc => {
                fetchedOrders.push({ id: doc.id, ...doc.data() });
            });

            // If customer, sort manually to avoid requiring composite indexes on Firestore
            if (user.role === 'customer') {
                fetchedOrders.sort((a, b) => {
                    const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : Date.now();
                    const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : Date.now();
                    return timeB - timeA;
                });
            }

            setOrders(fetchedOrders);
            const latestPending = fetchedOrders.find(o => o.status === 'Bekliyor' && o.userId === user.uid);
            setActiveOrder(latestPending ? latestPending : null);
        });

        return () => unsubscribe();
    }, [user]);


    const addStar = async (amount) => {
        if (!user || user.role === 'guest' || !user.uid) return;
        const newStars = stars + amount;
        setStars(newStars);
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { stars: newStars });
    };

    const deductBalance = (amount) => {
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) return false;
        // Check checkoutCart for full logic. This function is mostly unused safely outside.
        return balance >= numAmount;
    };

    const topUpBalance = async (amount) => {
        if (!user || user.role === 'guest' || !user.uid) return;
        const numAmount = Number(amount);
        if (isNaN(numAmount) || numAmount <= 0) return;

        const newBalance = balance + numAmount;
        const newTransaction = {
            id: Date.now(),
            amount: numAmount,
            type: 'topup',
            date: new Date().toLocaleDateString(),
        };
        const newTransactions = [newTransaction, ...transactions];

        setBalance(newBalance);
        setTransactions(newTransactions);

        const userRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userRef, {
                balance: newBalance,
                transactions: newTransactions
            });
        } catch (error) {
            console.error('Bakiye yüklenemedi:', error);
            // Revert state if failed
            setBalance(balance);
            setTransactions(transactions);
            return;
        }

        try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { /* ignore */ }
    };

    const addToCart = async (product, customizations, totalPrice) => {
        const newItem = { id: Date.now() + Math.random(), product, customizations, totalPrice };
        setCart(prev => [...prev, newItem]);
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { /* ignore */ }
        return true;
    };

    const removeFromCart = async (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { /* ignore */ }
    };

    const clearCart = () => setCart([]);

    const checkoutCart = async (directItems = null) => {
        if (!user || user.role === 'guest' || !user.uid) {
            try { await Haptics.notification({ type: 'ERROR' }); } catch (e) { /* ignore */ }
            return null;
        }

        const currentItems = directItems || cart;
        if (currentItems.length === 0) return null;

        const total = currentItems.reduce((sum, item) => sum + item.totalPrice, 0);
        if (balance >= total) {
            const orderCode = generateOrderCode();
            const newOrderData = {
                code: orderCode,
                userId: user.uid,
                customerName: user.name || 'Müşteri',
                items: currentItems.map(item => ({
                    name: item.product.name,
                    customizations: item.customizations,
                    price: item.totalPrice,
                    quantity: 1,
                })),
                total,
                date: new Date().toISOString(),
                status: 'Bekliyor',
                timestamp: serverTimestamp(),
            };

            const newBalance = balance - total;
            const newTransaction = { id: Date.now(), amount: total, type: 'purchase', date: new Date().toLocaleDateString() };
            const newTransactions = [newTransaction, ...transactions];
            const newStars = stars + (currentItems.length * 5);

            let newStampCount = stampCount + 1;
            let earnedFree = false;

            if (newStampCount >= 8) {
                earnedFree = true;
                newStampCount = 0;
            }

            // Write Order to Firestore
            try {
                await addDoc(collection(db, 'orders'), newOrderData);

                // Write User Data to Firestore
                const userRef = doc(db, 'users', user.uid);
                await updateDoc(userRef, {
                    balance: newBalance,
                    transactions: newTransactions,
                    stars: newStars,
                    stampCount: newStampCount
                });

                // Optimizasyon: React statelerini Firestore işlemi başarılı olduktan sonra güncelle
                setBalance(newBalance);
                setStars(newStars);
                setStampCount(newStampCount);
                setTransactions(newTransactions);

            } catch (e) {
                console.error("Sipariş verilirken hata oluştu:", e);
                try { await Haptics.notification({ type: 'ERROR' }); } catch (ignore) { }
                return null;
            }

            if (earnedFree) {
                setFreeRewardAvailable(true);
            } else {
                setStampJustEarned(true);
                setTimeout(() => setStampJustEarned(false), 2000);
            }

            if (!directItems) clearCart();
            try { await Haptics.notification({ type: 'SUCCESS' }); } catch (e) { /* ignore */ }

            return newOrderData;
        }

        try { await Haptics.notification({ type: 'ERROR' }); } catch (e) { /* ignore */ }
        return null;
    };

    const dismissActiveOrder = () => setActiveOrder(null);

    const confirmOrder = async (orderCode) => {
        const order = orders.find(o => o.code === orderCode);
        if (order) {
            try {
                const orderRef = doc(db, 'orders', order.id);
                await updateDoc(orderRef, { status: 'Onaylandı' });
            } catch (e) { console.error('Error confirming order:', e); }
        }
    };

    const cancelOrder = async (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order && order.status === 'Bekliyor') {
            try {
                const orderRef = doc(db, 'orders', orderId);
                await updateDoc(orderRef, { status: 'İptal Edildi' });

                // Refund to User's Balance
                const targetUserRef = doc(db, 'users', order.userId);
                const targetSnap = await getDoc(targetUserRef);

                if (targetSnap.exists()) {
                    const data = targetSnap.data();
                    const newBalance = (data.balance || 0) + order.total;
                    const newTransaction = {
                        id: Date.now(),
                        amount: order.total,
                        type: 'refund',
                        date: new Date().toLocaleDateString(),
                    };
                    await updateDoc(targetUserRef, {
                        balance: newBalance,
                        transactions: [newTransaction, ...(data.transactions || [])]
                    });
                }
                return true;
            } catch (error) {
                console.error('Error canceling order:', error);
                return false;
            }
        }
        return false;
    };

    return (
        <RewardsContext.Provider value={{
            stars, balance, transactions, orders, activeOrder,
            addStar, deductBalance, topUpBalance, addBalance: topUpBalance,
            addToCart, removeFromCart, clearCart, checkoutCart,
            dismissActiveOrder, confirmOrder, cancelOrder, cart,
            stampCount, stampJustEarned, freeRewardAvailable, setFreeRewardAvailable,
        }}>
            {children}
        </RewardsContext.Provider>
    );
}

export function useRewards() {
    return useContext(RewardsContext);
}
