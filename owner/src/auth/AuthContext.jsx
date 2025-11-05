import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // ✅ Rehydrate user when app loads (if token exists)
  useEffect(() => {
    const token = localStorage.getItem("owner_access");
    if (!token) {
      setReady(true);
      return;
    }

    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProfile.url);
        const data = res.data?.user || res.data?.data?.user || res.data?.data;
        if (data) setUser(data);
      } catch (err) {
        console.warn("Auto-login failed:", err.response?.status);
        if (err.response?.status === 401) {
          localStorage.removeItem("owner_access");
          localStorage.removeItem("owner_refresh");
        }
      }finally {
        setReady(true);
      }
    })();
  }, []);

  const loginWithTokens = (payload) => {
    localStorage.setItem("owner_access", payload.accessToken);
    localStorage.setItem("owner_refresh", payload.refreshToken);
    setUser(payload.user);
  };

  const logout = () => {
    localStorage.removeItem("owner_access");
    localStorage.removeItem("owner_refresh");
    setUser(null);
    window.location.href = "/owner/login";
  };

  const value = useMemo(() => ({ user, ready, loginWithTokens, logout }), [user, ready]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
