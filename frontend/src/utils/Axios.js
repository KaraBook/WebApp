import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";
import { useAuthStore } from "../store/auth";

const Axios = axios.create({
  baseURL,
  withCredentials: true,
});

Axios.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


Axios.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken, setTokens, clearAuth } = useAuthStore.getState();
        if (!refreshToken) throw new Error("no refreshToken");

        const resp = await axios({
          baseURL,
          url: SummaryApi.refreshToken.url,
          method: SummaryApi.refreshToken.method,
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const newAccess = resp.data?.data?.accessToken;
        if (!newAccess) throw new Error("no access token");

        setTokens({ accessToken: newAccess });
        original.headers.Authorization = `Bearer ${newAccess}`;
        return Axios(original);
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }
    return Promise.reject(error);
  }
);

export default Axios;
