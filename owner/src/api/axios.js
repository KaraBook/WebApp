import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: false,
});

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("owner_access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// simple refresh on 401
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
      if (!refresh) throw error;

      if (!refreshing) {
        refreshing = true;
        try {
          const r = await axios.post(
            `${import.meta.env.VITE_API_BASE}/api/auth/refresh-token`,
            null,
            { headers: { Authorization: `Bearer ${refresh}` } }
          );
          const newAccess = r.data?.data?.accessToken;
          localStorage.setItem("owner_access", newAccess);
          refreshing = false;
          onRefreshed(newAccess);
        } catch (e) {
          refreshing = false;
          localStorage.removeItem("owner_access");
          localStorage.removeItem("owner_refresh");
          window.location.href = "/login";
          throw e;
        }
      }

      return new Promise((resolve) => {
        queue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }
    throw error;
  }
);

export default api;
