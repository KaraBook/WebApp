import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("owner_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue = [];
function onRefreshed(newToken) {
  queue.forEach((cb) => cb(newToken));
  queue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("owner_refresh");
      if (!refresh) return Promise.reject(error);

      try {
        const r = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/auth/refresh-token`,
          null,
          { headers: { Authorization: `Bearer ${refresh}` } }
        );

        const newAccess = r.data?.data?.accessToken;
        if (!newAccess) throw new Error("No access token returned");

        localStorage.setItem("owner_access", newAccess);
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);

      } catch (err) {
        console.warn("Refresh token failed:", err);
        localStorage.removeItem("owner_access");
        localStorage.removeItem("owner_refresh");
        window.location.href = "/owner/login";
      }
    }

    return Promise.reject(error);
  }
);


export default api;
