import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { setErrorTrackingUser } from '../services/errorTrackingService';
import {
    signInWithPhoneNumber,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [needsRegistration, setNeedsRegistration] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.warn("Auth State Değişti:", firebaseUser?.uid);
            if (firebaseUser) {
                setErrorTrackingUser(firebaseUser.uid);
                try {
                    const docRef = doc(db, 'users', firebaseUser.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        console.warn("Kullanıcı Firestore'da bulundu, eksik alanlar tamamlanıyor...");

                        const userData = docSnap.data();

                        const mergedData = {
                            ...userData,
                            role: userData.role || 'member',
                            balance: userData.balance ?? 0,
                            stars: userData.stars ?? 0,
                            tier: userData.tier || 'bronze',
                            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
                        };

                        // Eski kullanıcılar için eksik alanları doldur (Geriye dönük uyumluluk)
                        await setDoc(docRef, mergedData, { merge: true });

                        setUser({ uid: firebaseUser.uid, ...mergedData });
                        setNeedsRegistration(false);
                    } else {
                        console.warn("Kullanıcı Firestore'da YOK -> Kayıt gerekli.");
                        setNeedsRegistration(true);
                        setUser({
                            uid: firebaseUser.uid,
                            phone: firebaseUser.phoneNumber,
                            role: 'pending'
                        });
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Kullanıcı verisi çekilemedi (AuthContext):", error);
                    // Hata varsa (örn: permission-denied), hemen 'Misafir' yapma veya Registration'a zorlama, işlemi askıya al.
                    setNeedsRegistration(false);
                }
            } else {
                setErrorTrackingUser(null);
                console.warn("Kullanıcı oturumu yok -> Guest.");
                setUser({ name: 'Misafir', role: 'guest', avatar: null });
                setNeedsRegistration(false);
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

            // Render işlemi Login.jsx tarafında (sayfa yüklendiğinde) yapılıyor.
            // Kullanıcı kutucuğu işaretledikten sonra bu fonksiyon tetiklenecek.
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
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMsg = 'Telefon ile giriş devre dışı görünüyor. Yöneticiye haber verin.';
            } else if (error.code === 'auth/app-not-authorized') {
                errorMsg = 'Bu uygulama doğrulanamadı. Uygulama ayarları kontrol edilmeli.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg = 'Ağ bağlantısı hatası. İnternetinizi kontrol edip tekrar deneyin.';
            } else if (error.code === 'auth/internal-error') {
                errorMsg = 'Bu numaraya SMS gönderilemiyor. Lütfen biraz sonra tekrar deneyin.';
            }

            const codeSuffix = error?.code ? ` [${error.code}]` : '';
            if (!errorMsg.includes('[') && codeSuffix) {
                errorMsg += codeSuffix;
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
            } else if (error.code === 'auth/session-expired') {
                errorMsg = 'Doğrulama oturumu zaman aşımına uğradı. Yeni kod gönderin.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMsg = 'Ağ bağlantısı hatası. İnternetinizi kontrol edin.';
            }
            const codeSuffix = error?.code ? ` [${error.code}]` : '';
            return { success: false, error: `${errorMsg}${codeSuffix}` };
        }
    };

    // Yeni kullanıcı profilini Firestore'a kaydet
    const completeRegistration = async ({ firstName, lastName }) => {
        console.warn('--- completeRegistration Başladı ---');
        try {
            const firebaseUser = auth.currentUser;
            if (!firebaseUser) {
                console.error('completeRegistration: Oturum bulunamadı!');
                return { success: false, error: 'Oturum bulunamadı. Lütfen tekrar giriş yapın.' };
            }

            console.warn('Kullanıcı UID:', firebaseUser.uid);
            const userRef = doc(db, 'users', firebaseUser.uid);

            // Yazma öncesi döküman kontrolü
            let existingDoc = null;
            try {
                existingDoc = await getDoc(userRef);
            } catch (e) {
                console.warn('Mevcut döküman kontrol edilemedi, devam ediliyor...', e);
            }

            const profileData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                name: `${firstName.trim()} ${lastName.trim()}`,
                phone: firebaseUser.phoneNumber,
                role: 'member',
                avatar: null,
                joined: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            if (existingDoc && existingDoc.exists()) {
                console.warn('Döküman mevcut, güncelleniyor (updateDoc)...');
                await updateDoc(userRef, profileData);
            } else {
                console.warn('Yeni döküman oluşturuluyor (setDoc)...');
                await setDoc(userRef, {
                    ...profileData,
                    balance: 0,
                    stars: 0,
                    tier: 'bronze',
                    createdAt: new Date().toISOString()
                });
            }

            console.warn('Firestore yazma başarılı.');

            setNeedsRegistration(false);

            // Local state'i zorla güncelle
            setUser(prev => ({
                ...prev,
                ...profileData,
                uid: firebaseUser.uid,
                balance: prev?.balance || 0,
                stars: prev?.stars || 0,
                tier: prev?.tier || 'bronze',
            }));

            return { success: true };
        } catch (error) {
            console.error('completeRegistration Kritik Hata:', error);
            let errorMsg = 'Profil kaydedilemedi.';
            if (error.code === 'permission-denied') {
                errorMsg = 'Yetki hatası: Firestore kurallarını kontrol edin.';
            }
            return { success: false, error: errorMsg + ' (' + error.message + ')' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setErrorTrackingUser(null);
            setNeedsRegistration(false);
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
            isGuest, isCustomer, isMember, isBarista, isStaff, needsRegistration, setNeedsRegistration
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
