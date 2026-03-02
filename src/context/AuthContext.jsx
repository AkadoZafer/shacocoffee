import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();



export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user data from Firestore
                try {
                    const docRef = doc(db, 'users', firebaseUser.uid);
                    const docSnap = await getDoc(docRef);
                    let userData = {};
                    if (docSnap.exists()) {
                        userData = docSnap.data();
                    } else {
                        // Profil bulunamazsa en düşük yetkiyle (customer) state başlatılır.
                        userData = { email: firebaseUser.email, role: 'customer', name: 'Kullanıcı' };
                    }

                    setUser({ uid: firebaseUser.uid, ...userData });
                } catch (error) {
                    console.error("Kullanıcı verisi çekilemedi:", error);
                    setUser({ name: 'Misafir', role: 'guest', avatar: null });
                }
            } else {
                setUser({ name: 'Misafir', role: 'guest', avatar: null });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Login with email + password
    const login = async (emailOrName, password) => {
        try {
            // First check if the user is trying to login as staff with short emails
            let loginEmail = emailOrName;

            // Allow phone number or short name logins if needed by finding email? 
            // Firebase Auth requires email. For now, assume email is provided.

            await signInWithEmailAndPassword(auth, loginEmail, password);
            return { success: true };
        } catch (error) {
            let errorMsg = 'E-posta veya şifre hatalı';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMsg = 'E-posta veya şifre hatalı';
            } else if (error.code === 'auth/invalid-email') {
                errorMsg = 'Geçersiz e-posta adresi';
            }
            return { success: false, error: errorMsg };
        }
    };

    // Register new customer
    const register = async ({ firstName, lastName, phone, email, password }) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const newUser = userCredential.user;

            const userData = {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                phone,
                email,
                role: 'member',
                avatar: null,
                joined: new Date().toISOString()
            };

            // Save extra data to Firestore
            await setDoc(doc(db, 'users', newUser.uid), userData);

            return { success: true };
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            let errorMsg = 'Kayıt olurken bir hata oluştu';
            if (error.code === 'auth/email-already-in-use') {
                errorMsg = 'Bu e-posta adresi zaten kullanımda';
            } else if (error.code === 'auth/weak-password') {
                errorMsg = 'Şifre çok zayıf, en az 6 karakter olmalı';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMsg = 'E-posta/Şifre girişi Firebase panosunda yetkisiz.';
            } else {
                errorMsg = `Hata: ${error.message}`;
            }
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser({ name: 'Misafir', role: 'guest', avatar: null });
        } catch (error) {
            console.error("Çıkış yapılırken hata:", error);
        }
    };

    const updateProfile = async (updates) => {
        if (!user || user.role === 'guest' || !user.uid) return;

        try {
            const userRef = doc(db, 'users', user.uid);

            let finalUpdates = { ...updates };
            if (updates.name) {
                const parts = updates.name.split(' ');
                finalUpdates.firstName = parts[0];
                finalUpdates.lastName = parts.slice(1).join(' ');
            }

            await updateDoc(userRef, finalUpdates);
            setUser(prev => ({ ...prev, ...finalUpdates }));
        } catch (error) {
            console.error("Profil güncellenemedi:", error);
        }
    };

    const updateAvatar = (avatarDataUrl) => {
        updateProfile({ avatar: avatarDataUrl });
    };

    const updateRole = (role) => {
        updateProfile({ role });
    };

    const isGuest = user?.role === 'guest';
    const isCustomer = user?.role === 'customer';
    const isBarista = user?.role === 'barista';
    const isStaff = isBarista;

    return (
        <AuthContext.Provider value={{
            user, login, logout, register, updateProfile, updateAvatar, updateRole, loading,
            isGuest, isCustomer, isBarista, isStaff,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
