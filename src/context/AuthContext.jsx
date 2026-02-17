import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Pre-defined staff accounts (barista & admin)
const STAFF_ACCOUNTS = [
    { email: 'admin@shaco.com', password: 'admin123', name: 'Admin', role: 'admin' },
    { email: 'barista@shaco.com', password: 'barista123', name: 'Barista', role: 'barista' },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('shaco_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Default: guest user
            setUser({ name: 'Misafir', role: 'guest', avatar: null });
        }
        setLoading(false);
    }, []);

    // Login with email + password (staff) or name + password (customer)
    const login = (emailOrName, password) => {
        // Check staff accounts first
        const staff = STAFF_ACCOUNTS.find(
            a => a.email.toLowerCase() === emailOrName.toLowerCase() && a.password === password
        );
        if (staff) {
            const newUser = { name: staff.name, role: staff.role, email: staff.email, avatar: null, joined: new Date().toISOString() };
            setUser(newUser);
            localStorage.setItem('shaco_user', JSON.stringify(newUser));
            return { success: true, role: staff.role };
        }

        // Check registered customers from localStorage
        const customers = JSON.parse(localStorage.getItem('shaco_customers') || '[]');
        const customer = customers.find(
            c => (c.email.toLowerCase() === emailOrName.toLowerCase() || c.phone === emailOrName) && c.password === password
        );
        if (customer) {
            const newUser = {
                name: `${customer.firstName} ${customer.lastName}`,
                role: 'customer',
                email: customer.email,
                phone: customer.phone,
                avatar: customer.avatar || null,
                joined: customer.joined,
            };
            setUser(newUser);
            localStorage.setItem('shaco_user', JSON.stringify(newUser));
            return { success: true, role: 'customer' };
        }

        return { success: false, error: 'E-posta veya şifre hatalı' };
    };

    // Register new customer
    const register = ({ firstName, lastName, phone, email, password }) => {
        const customers = JSON.parse(localStorage.getItem('shaco_customers') || '[]');

        // Check if email already exists
        if (customers.find(c => c.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Bu e-posta adresi zaten kayıtlı' };
        }

        const newCustomer = {
            id: Date.now(),
            firstName,
            lastName,
            phone,
            email,
            password,
            avatar: null,
            joined: new Date().toISOString(),
        };
        customers.push(newCustomer);
        localStorage.setItem('shaco_customers', JSON.stringify(customers));

        // Auto-login after registration
        const newUser = {
            name: `${firstName} ${lastName}`,
            role: 'customer',
            email,
            phone,
            avatar: null,
            joined: newCustomer.joined,
        };
        setUser(newUser);
        localStorage.setItem('shaco_user', JSON.stringify(newUser));
        return { success: true };
    };

    const logout = () => {
        localStorage.removeItem('shaco_user');
        // Back to guest
        setUser({ name: 'Misafir', role: 'guest', avatar: null });
    };

    const updateProfile = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('shaco_user', JSON.stringify(updatedUser));
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
    const isAdmin = user?.role === 'admin';
    const isStaff = isBarista || isAdmin;

    return (
        <AuthContext.Provider value={{
            user, login, logout, register, updateProfile, updateAvatar, updateRole, loading,
            isGuest, isCustomer, isBarista, isAdmin, isStaff,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
