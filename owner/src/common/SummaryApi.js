const BASE_URL = import.meta.env.VITE_API_BASE;

const SummaryApi = {
    ownerLogin: {
        url: `${BASE_URL}/api/auth/resort-owner/login`,
        method: "POST",
    },
    ownerLogout: {
        url: `${BASE_URL}/api/auth/resort-owner/logout`,
        method: "POST",
    },
    getOwnerProfile: {
        url: `${BASE_URL}/api/auth/me`,
        method: "GET",
    },

    getOwnerDashboard: {
        url: `${BASE_URL}/api/owner/dashboard`,
        method: "GET",
    },
    getOwnerProperties: {
        url: `${BASE_URL}/api/owner/my-properties`,
        method: "GET",
    },
    getOwnerBookings: {
        url: `${BASE_URL}/api/owner/bookings`,
        method: "GET",
    },
    getSingleProperty: (id) => ({
        url: `${BASE_URL}/api/owner/property/${id}`,
        method: "GET",
    }),

};

export default SummaryApi;
