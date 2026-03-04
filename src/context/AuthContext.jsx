import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
    signInWithPhoneNumber,
    RecaptchaVerifier,
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
                try {
                    const docRef = doc(db, 'users', firebaseUser.uid);
                    const docSnap = await getDoc(docRef);
                    let userData = {};
                    if (docSnap.exists()) {
                        userData = docSnap.data();
                    } else {
                        // Telefon ile giriş yapıldı ama Firestore'da profil yok → Kayıt gerekiyor
                        userData = {
                            phone: firebaseUser.phoneNumber,
                            role: 'member',
                            name: 'Yeni Üye',
                            needsRegistration: true
                        };
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

    // Telefon numarasına SMS kodu gönder
    const sendOTP = async (phoneNumber) => {
        try {
            if (!window.recaptchaVerifier) {
                return { success: false, error: 'reCAPTCHA yüklenemedi, sayfayı yenileyin.' };
            }
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            return { success: true };
        } catch (error) {
            console.error('SMS gönderme hatası:', error);

            // reCAPTCHA'yı resetle (tekrar oluşturulsun diye)
            if (window.recaptchaVerifier) {
                try {
                    // reCAPTCHA'yı güvenli bir şekilde temizle
                    if (typeof window.recaptchaVerifier.clear === 'function') {
                        window.recaptchaVerifier.clear();
                    }
                } catch (e) {
                    console.warn('reCAPTCHA temizleme hatası:', e);
                }
                window.recaptchaVerifier = null;
            }

            let errorMsg = 'SMS gönderilemedi.';
            if (error.code === 'auth/invalid-phone-number') {
                errorMsg = 'Geçersiz telefon numarası. +90 ile başlayın.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMsg = 'Çok fazla deneme yapıldı. Lütfen biraz bekleyin (reCAPTCHA limitine takılmış olabilirsiniz).';
            } else if (error.code === 'auth/quota-exceeded') {
                errorMsg = 'SMS kotası aşıldı.';
            } else if (error.code === 'auth/captcha-check-failed') {
                errorMsg = 'reCAPTCHA doğrulaması başarısız oldu.';
            }
            return { success: false, error: errorMsg };
        }
    };

    // SMS kodunu doğrula ve giriş yap
    const verifyOTP = async (otpCode) => {
        try {
            if (!window.confirmationResult) {
                return { success: false, error: 'Önce SMS kodu gönderilmelidir.' };
            }
            const result = await window.confirmationResult.confirm(otpCode);
            const firebaseUser = result.user;

            // Firestore'da profili kontrol et
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Kayıtlı kullanıcı → doğrudan giriş
                return { success: true, isNewUser: false };
            } else {
                // Yeni kullanıcı → Kayıt formuna yönlendir
                return { success: true, isNewUser: true };
            }
        } catch (error) {
            console.error('OTP doğrulama hatası:', error);
            let errorMsg = 'Kod doğrulanamadı.';
            if (error.code === 'auth/invalid-verification-code') {
                errorMsg = 'Girdiğiniz kod hatalı. Lütfen tekrar deneyin.';
            } else if (error.code === 'auth/code-expired') {
                errorMsg = 'Kodun süresi doldu. Yeni kod gönderin.';
            }
            return { success: false, error: errorMsg };
        }
    };

    // Yeni kullanıcı profilini Firestore'a kaydet
    const completeRegistration = async ({ firstName, lastName }) => {
        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) return { success: false, error: 'Oturum bulunamadı.' };

            const userRef = doc(db, 'users', firebaseUser.uid);
            const existingDoc = await getDoc(userRef);

            if (existingDoc.exists()) {
                // Döküman zaten var (önceki deneme/listener), sadece güvenli alanları güncelle
                await updateDoc(userRef, {
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    phone: firebaseUser.phoneNumber,
                    avatar: null,
                    joined: new Date().toISOString(),
                });
            } else {
                // Yeni döküman oluştur (balance/stars/tier dahil)
                await setDoc(userRef, {
                    firstName,
                    lastName,
                    name: `${firstName} ${lastName}`,
                    phone: firebaseUser.phoneNumber,
                    role: 'member',
                    balance: 0,
                    stars: 0,
                    tier: 'bronze',
                    avatar: null,
                    joined: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                });
            }

            const userData = {
                uid: firebaseUser.uid,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                phone: firebaseUser.phoneNumber,
                role: 'member',
                balance: 0,
                stars: 0,
                tier: 'bronze',
                avatar: null,
            };
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('Kayıt hatası:', error);
            return { success: false, error: 'Profil kaydedilemedi: ' + error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            window.recaptchaVerifier = null;
            window.confirmationResult = null;
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
    const isMember = user?.role === 'member';
    const isBarista = user?.role === 'barista';
    const isStaff = isBarista;

    return (
        <AuthContext.Provider value={{
            user, logout, sendOTP, verifyOTP, completeRegistration, updateProfile, updateAvatar, updateRole, loading,
            isGuest, isCustomer, isMember, isBarista, isStaff,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
