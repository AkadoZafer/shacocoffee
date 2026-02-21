import { createContext, useContext, useState } from 'react';

const MembershipContext = createContext();

const defaultTiers = [
    { id: 'bronze', label: 'Bronze', minStars: 0, discount: 0, color: 'orange', emoji: '🥉' },
    { id: 'silver', label: 'Silver', minStars: 15, discount: 5, color: 'zinc', emoji: '🥈' },
    { id: 'gold', label: 'Gold', minStars: 50, discount: 10, color: 'yellow', emoji: '🥇' },
];

export function MembershipProvider({ children }) {
    const [tiers, setTiers] = useState(defaultTiers);

    const updateTier = (tierId, updates) => {
        setTiers(prev => prev.map(t => t.id === tierId ? { ...t, ...updates } : t));
    };

    const getTierForStars = (stars) => {
        const sorted = [...tiers].sort((a, b) => b.minStars - a.minStars);
        return sorted.find(t => stars >= t.minStars) || tiers[0];
    };

    const getDiscountForStars = (stars) => {
        const tier = getTierForStars(stars);
        return tier?.discount || 0;
    };

    return (
        <MembershipContext.Provider value={{ tiers, updateTier, getTierForStars, getDiscountForStars }}>
            {children}
        </MembershipContext.Provider>
    );
}

export function useMembership() {
    return useContext(MembershipContext);
}
