import { createContext, useContext, useMemo, useState, useEffect } from "react";
import api from "../api/axios";
import SummaryApi from "../common/SummaryApi";
import { useLocation } from "react-router-dom";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/manager/login");

  useEffect(() => {
    if (isAuthPage) {
      setReady(true);
      return;
    }

    const access = localStorage.getItem("owner_access");

    if (!access) {
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
        // Only logout if refresh also fails (handled by axios interceptor)
        setUser(null);
      } finally {
        setReady(true);
      }
    })();
  }, [isAuthPage]);

  const loginWithTokens = (payload) => {
    localStorage.setItem("owner_access", payload.accessToken);
    localStorage.setItem("owner_refresh", payload.refreshToken);
    localStorage.setItem("owner_user", JSON.stringify(payload.user));

    setUser(payload.user);
    setReady(true);
  };

  const logout = (redirect = true) => {
    localStorage.clear();
    setUser(null);
    setReady(true);

    if (
      redirect &&
      !location.pathname.startsWith("/owner/login") &&
      !location.pathname.startsWith("/manager/login")
    ) {
      window.location.href = "/owner/login";
    }
  };

  const value = useMemo(
    () => ({ user, ready, loginWithTokens, logout }),
    [user, ready]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
