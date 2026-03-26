import { createContext, useContext, useState, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc, collection, query, where, orderBy, getDoc } from 'firebase/firestore';

const RewardsContext = createContext();



export function RewardsProvider({ children }) {
    const { user } = useAuth();
    const { addToast } = useToast();

    const [stars, setStars] = useState(0);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeOrder, setActiveOrder] = useState(null);
    const [favoriteProduct, setFavoriteProduct] = useState(null);

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
        } catch { return []; }
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
            setBalance((prev) => (prev === 0 ? 150 : prev));
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
            }
        }, (error) => {
            console.warn('RewardsContext snapshot hatası:', error.message);
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

            // Favori Ürün Hesaplama
            if (user.role === 'customer') {
                const productCounts = {};
                fetchedOrders.forEach(order => {
                    if (order.status !== 'İptal Edildi' && order.items) {
                        order.items.forEach(item => {
                            productCounts[item.name] = (productCounts[item.name] || 0) + (item.quantity || 1);
                        });
                    }
                });

                let maxCount = 0;
                let favName = null;
                for (const [name, count] of Object.entries(productCounts)) {
                    if (count > maxCount && count >= 2) { // En az 2 kez alınmış olmalı
                        maxCount = count;
                        favName = name;
                    }
                }
                setFavoriteProduct(favName ? { name: favName, count: maxCount } : null);
            } else {
                setFavoriteProduct(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    // Barista için müşterinin müdavimi olduğu (sık aldığı) ürün kontrolü
    const isFrequentItem = (userId, itemName) => {
        if (!orders || orders.length === 0) return false;
        let count = 0;
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            if (order.userId === userId && order.status !== 'İptal Edildi' && order.items) {
                for (let j = 0; j < order.items.length; j++) {
                    if (order.items[j].name === itemName) {
                        count += (order.items[j].quantity || 1);
                    }
                }
            }
        }
        return count >= 2;
    };


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

        try {
            // Firebase kütüphanesinden güncel ID Token'ı al
            const token = await auth.currentUser.getIdToken();

            // Güvenli Backend (FastAPI) Sunucusuna İstek At
            const response = await fetch('/api/topup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount: numAmount })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Bakiye yükleme API hatası');
            }

            addToast('Bakiye başarıyla yüklendi!', 'success');

            // Başarılı olursa Haptic geri bildirim ver, 
            // state güncellemeleri zaten yukarıdaki `onSnapshot` dinleyicisi ile anında yansıtılacak.
            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch { /* ignore */ }

        } catch (error) {
            console.error('Güvenli bakiye yükleme başarısız oldu:', error);
            addToast(error.message || 'Bakiye yükleme başarısız oldu.', 'error');
        }
    };

    const addToCart = async (product, customizations, totalPrice) => {
        const newItem = { id: Date.now() + Math.random(), product, customizations, totalPrice };
        setCart(prev => [...prev, newItem]);
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* ignore */ }
        return true;
    };

    const removeFromCart = async (itemId) => {
        setCart(prev => prev.filter(item => item.id !== itemId));
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* ignore */ }
    };

    const clearCart = () => setCart([]);

    const checkoutCart = async (directItems = null) => {
        if (!user || user.role === 'guest' || !user.uid) {
            try { await Haptics.notification({ type: 'ERROR' }); } catch { /* ignore */ }
            return null;
        }

        const currentItems = directItems || cart;
        if (currentItems.length === 0) return null;

        const total = currentItems.reduce((sum, item) => sum + item.totalPrice, 0);
        if (balance >= total) {
            try {
                const token = await auth.currentUser.getIdToken();
                const itemsPayload = currentItems.map(item => ({
                    name: item.product.name,
                    customizations: item.customizations || null,
                    price: item.totalPrice,
                    quantity: 1,
                }));

                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        items: itemsPayload,
                        total: total,
                        customerName: user.name || 'Müşteri'
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.detail || 'Sipariş API hatası');
                }

                const data = await response.json();

                if (data.earned_free) {
                    setFreeRewardAvailable(true);
                } else {
                    setStampJustEarned(true);
                    setTimeout(() => setStampJustEarned(false), 2000);
                }

                if (!directItems) clearCart();
                try { await Haptics.notification({ type: 'SUCCESS' }); } catch { /* ignore */ }

                return data.order;
            } catch (error) {
                console.error("Sipariş verilirken hata oluştu:", error);
                // API'den dönen HTTP hatasını Toast mesajı (bildirim) olarak göster.
                addToast(error.message || 'Siparişiniz işlenirken bir sorun oluştu.', 'error');

                // Bakiye yetersiz vb. kritik hatalarda uyarı titremesi
                try { await Haptics.notification({ type: 'ERROR' }); } catch { }
                return null;
            }
        }

        try { await Haptics.notification({ type: 'ERROR' }); } catch { /* ignore */ }
        return null;
    };

    const dismissActiveOrder = () => setActiveOrder(null);

    const confirmOrder = async (orderCode) => {
        const order = orders.find(o => o.code === orderCode);
        if (order) {
            try {
                const orderRef = doc(db, 'orders', order.id);
                await updateDoc(orderRef, { status: 'Onaylandı' });
            } catch (error) { console.error('Error confirming order:', error); }
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
            stars, balance, transactions, orders, activeOrder, favoriteProduct,
            addStar, deductBalance, topUpBalance, addBalance: topUpBalance,
            addToCart, removeFromCart, clearCart, checkoutCart,
            dismissActiveOrder, confirmOrder, cancelOrder, isFrequentItem, cart,
            stampCount, stampJustEarned, freeRewardAvailable, setFreeRewardAvailable,
        }}>
            {children}
        </RewardsContext.Provider>
    );
}

export function useRewards() {
    return useContext(RewardsContext);
}
