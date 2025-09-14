import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: ({ user, accessToken, refreshToken }) => {
        set({ user, accessToken, refreshToken });
      },

      setTokens: ({ accessToken, refreshToken }) => {
        if (accessToken) set({ accessToken });
        if (refreshToken) set({ refreshToken });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      init: async () => {
        const { user, accessToken, refreshToken } = get();

        if (user && accessToken) return;

        let token = accessToken;
        if (!token && refreshToken) {
          try {
            const resp = await axios({
              method: SummaryApi.refreshToken.method,
              url: baseURL + SummaryApi.refreshToken.url,
              headers: { Authorization: `Bearer ${refreshToken}` },
            });
            token = resp.data?.data?.accessToken || null;
            if (token) set({ accessToken: token });
          } catch {
            set({ user: null, accessToken: null, refreshToken: null });
            return;
          }
        }

        if (token) {
          try {
            const me = await axios.get(baseURL + SummaryApi.me.url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            set({ user: me.data.user });
          } catch {
            set({ user: null, accessToken: null, refreshToken: null });
          }
        }
      },
    }),
    {
      name: "auth", 
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
    }
  )
);
