// src/utils/Axios.js
import axios from "axios";
import SummaryApi, { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
  baseURL,
  withCredentials: false, // not using cookies; tokens are in headers
});

// ---- helpers ----------------------------------------------------
const REFRESH_URL = SummaryApi.refreshToken.url; // '/api/auth/refresh-token'

const setDefaultAuthHeader = (token) => {
  if (token) {
    Axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete Axios.defaults.headers.common.Authorization;
  }
};

// set current access token on boot
setDefaultAuthHeader(localStorage.getItem("accessToken") || null);

// ---- request interceptor ----------------------------------------
Axios.interceptors.request.use(
  (config) => {
    // If this call IS the refresh endpoint, do NOT attach the access token.
    // (We’ll attach the refresh token in the response-interceptor’s refresh function.)
    const isRefreshCall = config.url?.includes(REFRESH_URL);

    if (!isRefreshCall) {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      } else {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ---- refresh logic (single-flight + queue) ----------------------
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

  // Use PLAIN axios to avoid our own interceptors.
  try {
    const res = await axios.post(`${baseURL}${REFRESH_URL}`, null, {
      headers: { Authorization: `Bearer ${refreshToken}` },
    });

    // Your controller returns either { accessToken } or { data: { accessToken } }
    const newAccess =
      res.data?.data?.accessToken || res.data?.accessToken || null;

    return newAccess;
  } catch (err) {
    return null;
  }
};

// ---- response interceptor ---------------------------------------
Axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;
    const status = response?.status;

    // Only handle 401; never try to refresh the refresh call itself
    const isRefreshCall = config?.url?.includes(REFRESH_URL);
    if (status !== 401 || isRefreshCall) {
      return Promise.reject(error);
    }

    // Prevent multiple refresh requests
    if (isRefreshing) {
      // queue and retry when refresh finishes
      return new Promise((resolve, reject) => {
        enqueue((token) => {
          if (!token) return reject(error); // refresh failed
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
        // cleanup on total auth failure
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setDefaultAuthHeader(null);
        return Promise.reject(error);
      }

      // store & apply
      localStorage.setItem("accessToken", newAccess);
      setDefaultAuthHeader(newAccess);
      flushQueue(newAccess);

      // retry the original request
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
