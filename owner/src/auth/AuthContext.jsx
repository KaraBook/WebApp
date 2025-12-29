import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { useLocation } from "react-router-dom";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();

  // ✅ DEFINE STATE (THIS WAS MISSING)
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/manager/login");

  /* -------------------- INIT AUTH -------------------- */
  useEffect(() => {
    // Auth pages don’t need session check
    if (isAuthPage) {
      setReady(true);
      return;
    }

    const access = localStorage.getItem("owner_access");
    const expiry = parseInt(localStorage.getItem("owner_access_expiry"), 10);

    if (!access || !expiry) {
      setReady(true);
      return;
    }

    if (Date.now() > expiry) {
      logout();
      setReady(true);
      return;
    }

    (async () => {
      try {
        const res = await api.get(SummaryApi.getOwnerProfile.url);
        const possibleUser =
          res.data?.user ||
          res.data?.data?.user ||
          res.data?.data ||
          res.data;

        if (possibleUser) setUser(possibleUser);
      } catch (err) {
        logout(false);
      } finally {
        setReady(true);
      }
    })();
  }, [isAuthPage]);

  /* -------------------- LOGIN -------------------- */
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
    setReady(true);
  };

  /* -------------------- LOGOUT -------------------- */
  const logout = (redirect = true) => {
    localStorage.clear();
    setUser(null);
    setReady(true);

    if (
      redirect &&
      !location.pathname.startsWith("/owner/login") &&
      !location.pathname.startsWith("/owner/login")
    ) {
      window.location.href = "/login";
    }
  };

  /* -------------------- CONTEXT VALUE -------------------- */
  const value = useMemo(
    () => ({ user, ready, loginWithTokens, logout }),
    [user, ready]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
