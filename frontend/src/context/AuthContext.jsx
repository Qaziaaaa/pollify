// WHY: This Context provides login/logout state to EVERY component
// Instead of passing token as props through 10 levels, any component
// can call useAuth() and get the user/token/logout function immediately

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On app start, check if token already exists in localStorage
    useEffect(() => {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (token && savedUser) {
            // FIX: validate token against backend instead of blindly trusting localStorage
            fetch("http://localhost:5000/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (!res.ok) throw new Error();
                    return res.json();
                })
                .then((data) => setUser(data.user))
                // FIX: clear stale token if backend rejects it
                .catch(() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
