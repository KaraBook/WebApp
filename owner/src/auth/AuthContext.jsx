import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  /* --------------------------- AUTO LOGIN ON LOAD --------------------------- */
  useEffect(() => {
    const access = localStorage.getItem("owner_access");
    const expiry = parseInt(localStorage.getItem("owner_access_expiry"), 10);

    // if token missing or expired → logout
    if (!access || !expiry || Date.now() > expiry) {
      console.log("Session expired or not found — forcing logout");
      logout(false); // silent logout (no redirect loop)
      setReady(true);
      return;
    }

    // auto-login with existing tokens
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

  /* --------------------------- LOGIN HANDLER --------------------------- */
  const loginWithTokens = (payload) => {
    const now = Date.now();
    const accessExpiry = now + 30 * 60 * 1000; // 30 minutes
    const refreshExpiry = now + 24 * 60 * 60 * 1000; // 24 hours

    localStorage.setItem("owner_access", payload.accessToken);
    localStorage.setItem("owner_refresh", payload.refreshToken);
    localStorage.setItem("owner_user", JSON.stringify(payload.user));
    localStorage.setItem("owner_access_expiry", accessExpiry);
    localStorage.setItem("owner_refresh_expiry", refreshExpiry);

    setUser(payload.user);
  };

  /* --------------------------- LOGOUT HANDLER --------------------------- */
  const logout = (redirect = true) => {
    localStorage.removeItem("owner_access");
    localStorage.removeItem("owner_refresh");
    localStorage.removeItem("owner_access_expiry");
    localStorage.removeItem("owner_refresh_expiry");
    localStorage.removeItem("owner_user");
    setUser(null);
    if (redirect) window.location.href = "/owner/login";
  };

  /* --------------------------- AUTO LOGOUT ON EXPIRY --------------------------- */
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

    const interval = setInterval(checkExpiry, 60 * 1000); // check every 1 minute
    return () => clearInterval(interval);
  }, []);

  /* --------------------------- IDLE TIMEOUT (15 min) --------------------------- */
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        console.log("🕒 Auto-logout due to inactivity");
        logout();
      }, 15 * 60 * 1000); // 15 min idle timeout
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

  /* --------------------------- SILENT TOKEN REFRESH --------------------------- */
  useEffect(() => {
    const interval = setInterval(async () => {
      const expiry = parseInt(localStorage.getItem("owner_access_expiry"), 10);
      const refreshExpiry = parseInt(localStorage.getItem("owner_refresh_expiry"), 10);
      const refresh = localStorage.getItem("owner_refresh");
      if (!expiry || !refreshExpiry || !refresh) return;

      // If within 2 min of access expiry and refresh still valid
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
    }, 60 * 1000); // every minute
    return () => clearInterval(interval);
  }, []);

  /* --------------------------- VALUE --------------------------- */
  const value = useMemo(
    () => ({ user, ready, loginWithTokens, logout }),
    [user, ready]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
