import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL,
  withCredentials: false, 
});

const REFRESH_URL = SummaryApi.refreshToken.url; 

const setDefaultAuthHeader = (token) => {
  if (token) {
    Axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete Axios.defaults.headers.common.Authorization;
  }
};

setDefaultAuthHeader(localStorage.getItem("accessToken") || null);

Axios.interceptors.request.use(
  (config) => {
    const isRefreshCall = config.url?.includes(REFRESH_URL);

    const accessToken = localStorage.getItem("accessToken");

    if (!isRefreshCall && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let waiters = [];

const enqueue = (resolver) => waiters.push(resolver);
const flushQueue = (token) => {
  waiters.forEach((resolve) => resolve(token));
  waiters = [];
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await axios.post(`${baseURL}${REFRESH_URL}`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    const newAccess =
      res.data?.data?.accessToken || res.data?.accessToken || null;

    return newAccess;
  } catch (err) {
    return null;
  }
};

Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const status = response?.status;

    const isRefreshCall = config?.url?.includes(REFRESH_URL);
    if (status !== 401 || isRefreshCall) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueue((token) => {
          if (!token) return reject(error); 
          config._retry = true;
          config.headers.Authorization = `Bearer ${token}`;
          resolve(Axios(config));
        });
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const newAccess = await refreshAccessToken();
      isRefreshing = false;

      if (!newAccess) {
        flushQueue(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setDefaultAuthHeader(null);
        return Promise.reject(error);
      }

      localStorage.setItem("accessToken", newAccess);
      setDefaultAuthHeader(newAccess);
      flushQueue(newAccess);

      config.headers.Authorization = `Bearer ${newAccess}`;
      return Axios(config);
    } catch (e) {
      isRefreshing = false;
      flushQueue(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setDefaultAuthHeader(null);
      return Promise.reject(e);
    }
  }
);

export default Axios;
