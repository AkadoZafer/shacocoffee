import { createContext, useContext, useState } from 'react';

const translations = {
    en: {
        welcome: "Welcome Back,",
        balance: "Total Balance",
        topup: "Top Up",
        pay: "Pay",
        scan: "Scan to Pay",
        home: "Home",
        wallet: "Wallet",
        settings: "Settings",
        orders: "Active Orders",
        preparing: "Preparing",
        ready: "Ready",
        cancel: "Cancel & Refund",
        customize: "Customize Order",
        addOrder: "Add to Order",
        ingredients: "Ingredients",
        calories: "Calories",
        size: "Size",
        franchise: "Franchise Application",
        history: "Star History",
        about: "About Us",
        logout: "Log Out",
        theme: "Dark Mode",
        language: "Language",
        extraShot: "Extra Shot",
        syrup: "Syrup/Sugar",
        softBrew: "Soft Brew",
        comingSoon: "Coming Soon",
        simulateScan: "TAP TO SIMULATE SCAN",
        refreshIn: "REFRESH IN",
        insufficient: "Insufficient balance!",
        orderPlaced: "Order placed! Track it in your Active Orders.",
        category: {
            signature: "Signature",
            dessert: "Dessert",
            hot: "Hot Coffee",
            cold: "Cold Coffee"
        }
    },
    tr: {
        welcome: "Tekrar Hoşgeldin,",
        balance: "Toplam Bakiye",
        topup: "Yükle",
        pay: "Öde",
        scan: "Ödemek için Okut",
        home: "Anasayfa",
        wallet: "Cüzdan",
        settings: "Ayarlar",
        orders: "Aktif Siparişler",
        preparing: "Hazırlanıyor",
        ready: "Hazır",
        cancel: "İptal & İade",
        customize: "Siparişi Özelleştir",
        addOrder: "Siparişe Ekle",
        ingredients: "İçindekiler",
        calories: "Kalori",
        size: "Boyut",
        franchise: "Bayilik Başvurusu",
        history: "Yıldız Geçmişi",
        about: "Hakkımızda",
        logout: "Çıkış Yap",
        theme: "Karanlık Mod",
        language: "Dil",
        extraShot: "Ekstra Shot",
        syrup: "Şurup/Şeker",
        softBrew: "Yumuşak İçim",
        comingSoon: "Yakında",
        simulateScan: "SİMÜLASYON İÇİN DOKUN",
        refreshIn: "YENİLENME",
        insufficient: "Bakiye yetersiz!",
        orderPlaced: "Sipariş alındı! Aktif Siparişlerden takip edebilirsin.",
        category: {
            signature: "İmza",
            dessert: "Tatlı",
            hot: "Sıcak Kahve",
            cold: "Soğuk Kahve"
        }
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('tr'); // Default to Turkish

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[lang];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    const toggleLang = () => {
        setLang(prev => prev === 'tr' ? 'en' : 'tr');
    };

    return (
        <LanguageContext.Provider value={{ lang, toggleLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
