import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import SummaryApi, { baseURL } from "@/common/SummaryApi";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      wishlist: [],

      updateUser: (partial) =>
        set((state) => ({
          user: { ...state.user, ...partial }
        })),

      loginModalOpen: false,
      showAuthModal: () => set({ loginModalOpen: true }),
      hideAuthModal: () => set({ loginModalOpen: false }),

      setAuth: ({ user, accessToken, refreshToken }) => {
        set({ user, accessToken, refreshToken, loginModalOpen: false });
      },

      setTokens: ({ accessToken, refreshToken }) => {
        set((s) => ({
          accessToken: accessToken ?? s.accessToken,
          refreshToken: refreshToken ?? s.refreshToken,
        }));
      },

      setWishlist: (ids) => set({ wishlist: ids }),

      clearAuth: async () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          wishlist: [],
        });
      },
      init: async () => {
        const { accessToken, refreshToken } = get();
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
            set({ user: null, accessToken: null, refreshToken: null, wishlist: [] });
            return;
          }
        }

        if (token) {
          try {
            const me = await axios.get(baseURL + SummaryApi.me.url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            set({ user: me.data.user });

            const wl = await axios.get(baseURL + SummaryApi.getWishlist.url, {
              headers: { Authorization: `Bearer ${token}` },
            });
            set({ wishlist: wl.data.data.map((p) => p._id) });
          } catch {
            set({ user: null, accessToken: null, refreshToken: null, wishlist: [] });
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
        wishlist: s.wishlist,
      }),
    }
  )
);
