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
      wishlist: [],   // 👈 store wishlist IDs here

      loginModalOpen: false,
      showAuthModal: () => set({ loginModalOpen: true }),
      hideAuthModal: () => set({ loginModalOpen: false }),

      setAuth: ({ user, accessToken, refreshToken }) => {
        set({ user, accessToken, refreshToken, loginModalOpen: false });
      },

      setWishlist: (ids) => set({ wishlist: ids }),

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null, wishlist: [] });
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

            // 👇 fetch wishlist
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
