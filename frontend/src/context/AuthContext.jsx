import React, { createContext, useEffect, useMemo, useState } from "react";
import api, { setAccessToken } from "../services/api";

export const AuthContext = createContext({
user: null,
token: null,
login: async () => {},
logout: async () => {},
ready: false,
});

export function AuthProvider({ children }) {
const [user, setUser] = useState(() => {
const saved = localStorage.getItem("user");
return saved ? JSON.parse(saved) : null;
});

const [token, setToken] = useState(() => localStorage.getItem("token") || null);
const [ready, setReady] = useState(false);

// Save user in localStorage
useEffect(() => {
if (user) {
localStorage.setItem("user", JSON.stringify(user));
} else {
localStorage.removeItem("user");
}
}, [user]);

// Save token and attach to axios
useEffect(() => {
if (token) {
localStorage.setItem("token", token);
setAccessToken(token);
} else {
localStorage.removeItem("token");
setAccessToken(null);
}
}, [token]);

// Mark app ready immediately (no refresh endpoint)
useEffect(() => {
setReady(true);
}, []);

// LOGIN
const login = async (credentials) => {
const { data } = await api.post("/auth/login", credentials);
setUser(data.user);
setToken(data.accessToken);
return data.user;
};

// LOGOUT
const logout = async () => {
try {
await api.post("/auth/logout");
} catch (err) {
// ignore if endpoint doesn't exist
}
setUser(null);
setToken(null);
};

const value = useMemo(
() => ({
user,
token,
login,
logout,
setUser,
setToken,
ready,
}),
[user, token, ready]
);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
