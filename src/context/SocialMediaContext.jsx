import { createContext, useContext, useState, useEffect } from 'react';

const SocialMediaContext = createContext();

const PLATFORM_OPTIONS = [
    { key: 'instagram', label: 'Instagram', color: '#E4405F', urlPrefix: 'https://instagram.com/' },
    { key: 'tiktok', label: 'TikTok', color: '#000000', urlPrefix: 'https://tiktok.com/@' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', urlPrefix: 'https://facebook.com/' },
    { key: 'youtube', label: 'YouTube', color: '#FF0000', urlPrefix: 'https://youtube.com/@' },
    { key: 'x', label: 'X (Twitter)', color: '#000000', urlPrefix: 'https://x.com/' },
];

const defaultAccounts = [
    { id: 1, platform: 'instagram', username: '@shacocoffee', url: 'https://instagram.com/shacocoffee' },
    { id: 2, platform: 'tiktok', username: '@shacocoffee', url: 'https://tiktok.com/@shacocoffee' },
    { id: 3, platform: 'facebook', username: 'Shaco Coffee Co.', url: 'https://facebook.com/shacocoffee' },
];

export function SocialMediaProvider({ children }) {
    const [accounts, setAccounts] = useState(() => {
        const saved = localStorage.getItem('shaco_social_media');
        return saved ? JSON.parse(saved) : defaultAccounts;
    });

    useEffect(() => {
        localStorage.setItem('shaco_social_media', JSON.stringify(accounts));
    }, [accounts]);

    const addAccount = (platform, username, url) => {
        const newId = accounts.length > 0 ? Math.max(...accounts.map(a => a.id)) + 1 : 1;
        setAccounts(prev => [...prev, { id: newId, platform, username, url }]);
    };

    const removeAccount = (id) => {
        setAccounts(prev => prev.filter(a => a.id !== id));
    };

    const updateAccount = (id, updates) => {
        setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    return (
        <SocialMediaContext.Provider value={{ accounts, addAccount, removeAccount, updateAccount, PLATFORM_OPTIONS }}>
            {children}
        </SocialMediaContext.Provider>
    );
}

export function useSocialMedia() {
    return useContext(SocialMediaContext);
}
