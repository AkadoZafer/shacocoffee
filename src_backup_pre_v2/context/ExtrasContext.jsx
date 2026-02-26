import { createContext, useContext, useState } from 'react';

const ExtrasContext = createContext();

const defaultExtras = [
    { id: 1, label: 'Ekstra Shot', price: 15 },
    { id: 2, label: 'Karamel Şurubu', price: 10 },
    { id: 3, label: 'Vanilya Şurubu', price: 10 },
    { id: 4, label: 'Yulaf Sütü', price: 8 },
];

export function ExtrasProvider({ children }) {
    const [extras, setExtras] = useState(defaultExtras);

    const addExtra = (label, price) => {
        const newId = extras.length > 0 ? Math.max(...extras.map(e => e.id)) + 1 : 1;
        setExtras(prev => [...prev, { id: newId, label, price: Number(price) }]);
    };

    const removeExtra = (id) => {
        setExtras(prev => prev.filter(e => e.id !== id));
    };

    return (
        <ExtrasContext.Provider value={{ extras, addExtra, removeExtra }}>
            {children}
        </ExtrasContext.Provider>
    );
}

export function useExtras() {
    return useContext(ExtrasContext);
}
