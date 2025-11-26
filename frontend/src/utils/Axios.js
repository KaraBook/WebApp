import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";
import { useAuthStore } from "../store/auth";

const Axios = axios.create({
  baseURL,
  withCredentials: true,
});

// 🔹 Attach Access Token Automatically
Axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 🔹 Refresh Token Handler
Axios.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;

    // Only retry once
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const store = useAuthStore.getState();
        const refreshToken = store.refreshToken;
        const setTokens = store.setTokens;
        const clearAuth = store.clearAuth;

        if (!refreshToken) throw new Error("No refreshToken");

        // Request new access token
        const resp = await axios({
          baseURL,
          url: SummaryApi.refreshToken.url,
          method: SummaryApi.refreshToken.method,
          headers: { Authorization: `Bearer ${refreshToken}` },
        });

        const newAccess = resp.data?.data?.accessToken;
        if (!newAccess) throw new Error("No new access token received");

        // Safe-update (supports older store missing setTokens)
        if (typeof setTokens === "function") {
          setTokens({ accessToken: newAccess, refreshToken });
        } else {
          // Fallback (never breaks)
          store.accessToken = newAccess;
        }

        // Retry original request with new access token
        original.headers.Authorization = `Bearer ${newAccess}`;
        return Axios(original);
      } catch (err) {
        // Clear auth & force logout
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  }
);

export default Axios;
