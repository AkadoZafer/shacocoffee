import { db } from '../firebase';
import { collection, doc, getDocs, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';

// Zod Data Validation (Phase 8 Hazırlığı)
// export const BranchSchema = z.object({ ... })

export const subscribeToBranches = (callback) => {
    return onSnapshot(collection(db, 'branches'), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    });
};

export const updateBranch = async (id, newData) => {
    const ref = doc(db, 'branches', id);
    await updateDoc(ref, newData);
};

export const createBranch = async (id, data) => {
    const ref = doc(db, 'branches', id);
    await setDoc(ref, data);
};
