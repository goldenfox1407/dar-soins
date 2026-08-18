import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const raw = sessionStorage.getItem('user');
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    });
    const [token, setToken] = useState(() => sessionStorage.getItem('auth_token'));

    const login = (userData, authToken) => {
        sessionStorage.setItem('auth_token', authToken);
        sessionStorage.setItem('user', JSON.stringify(userData));
        setToken(authToken);
        setUser(userData);
    };

    const logout = () => {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const updateUser = (updatedData) => {
        const newUser = { ...(user || {}), ...updatedData };
        sessionStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
