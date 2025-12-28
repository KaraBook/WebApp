import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { useLocation } from "react-router-dom";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/manager/login");

  if (isAuthPage) {
    return <AuthCtx.Provider value={{ user: null, ready: true }}>{children}</AuthCtx.Provider>;
  }

  useEffect(() => {
    const access = localStorage.getItem("owner_access");
    const expiry = parseInt(localStorage.getItem("owner_access_expiry"), 10);

    if (!access || !expiry) {
      setReady(true);
      return;
    }

    if (Date.now() > expiry) {
      console.log("Session expired — logging out");
      logout();
      setReady(true);
      return;
    }

    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProfile.url);
        const possibleUser =
          res.data?.user || res.data?.data?.user || res.data?.data || res.data;
        if (possibleUser) setUser(possibleUser);
      } catch (err) {
        console.warn("Auto-login failed:", err.response?.status);
        logout(false);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const loginWithTokens = (payload) => {
    const now = Date.now();
    const accessExpiry = now + 30 * 60 * 1000;
    const refreshExpiry = now + 24 * 60 * 60 * 1000;

    localStorage.setItem("owner_access", payload.accessToken);
    localStorage.setItem("owner_refresh", payload.refreshToken);
    localStorage.setItem("owner_user", JSON.stringify(payload.user));
    localStorage.setItem("owner_access_expiry", accessExpiry);
    localStorage.setItem("owner_refresh_expiry", refreshExpiry);

    setUser(payload.user);
  };

  const logout = (redirect = true) => {
    localStorage.removeItem("owner_access");
    localStorage.removeItem("owner_refresh");
    localStorage.removeItem("owner_access_expiry");
    localStorage.removeItem("owner_refresh_expiry");
    localStorage.removeItem("owner_user");
    setUser(null);
    if (redirect && window.location.pathname !== "/login" && window.location.pathname !== "/manager/login") {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const checkExpiry = () => {
      const expiry = parseInt(localStorage.getItem("owner_access_expiry"), 10);
      const refreshExpiry = parseInt(localStorage.getItem("owner_refresh_expiry"), 10);
      if (!expiry || Date.now() > expiry) {
        console.log("⏰ Access token expired — logging out");
        logout();
      } else if (refreshExpiry && Date.now() > refreshExpiry) {
        console.log("🔒 Refresh token expired — logging out");
        logout();
      }
    };

    const interval = setInterval(checkExpiry, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("🕒 Auto-logout due to inactivity");
        logout();
      }, 15 * 60 * 1000);
    };

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const expiry = parseInt(localStorage.getItem("owner_access_expiry"), 10);
      const refreshExpiry = parseInt(localStorage.getItem("owner_refresh_expiry"), 10);
      const refresh = localStorage.getItem("owner_refresh");
      if (!expiry || !refreshExpiry || !refresh) return;

      if (Date.now() > expiry - 2 * 60 * 1000 && Date.now() < refreshExpiry) {
        try {
          console.log("🔁 Refreshing access token silently...");
          const r = await api.post(
            SummaryApi.ownerRefreshToken?.url || "/api/auth/refresh-token",
            null,
            { headers: { Authorization: `Bearer ${refresh}` } }
          );
          const newAccess = r.data?.data?.accessToken;
          if (newAccess) {
            const newExpiry = Date.now() + 30 * 60 * 1000;
            localStorage.setItem("owner_access", newAccess);
            localStorage.setItem("owner_access_expiry", newExpiry);
          }
        } catch (err) {
          console.warn("Refresh token failed:", err.message);
          logout();
        }
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const value = useMemo(
    () => ({ user, ready, loginWithTokens, logout }),
    [user, ready]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
