import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchMenuCategories = async () => {
    try {
        const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
        const snapshot = await getDocs(q);
        const list = [];
        snapshot.forEach(d => list.push({ id: d.data().value, name: d.data().label }));
        return list;
    } catch (error) {
        console.error("Kategori çekme hatası:", error);
        return [];
    }
};

export const fetchProducts = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'menu'));
        const list = [];
        snapshot.forEach(d => {
            const data = d.data();
            list.push({ id: d.id, ...data });
        });
        // Sadece satışta olan (isAvailable === true) ürünleri mobil uygulamaya gönder
        return list.filter(p => p.isAvailable !== false);
    } catch (error) {
        console.error("Ürün çekme hatası:", error);
        return [];
    }
};

export const fetchBranches = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'branches'));
        const list = [];
        snapshot.forEach(d => list.push({ id: d.id, ...d.data() }));
        return list;
    } catch (error) {
        console.error("Şube çekme hatası:", error);
        return [];
    }
};
