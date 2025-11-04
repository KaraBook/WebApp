const BASE_URL = import.meta.env.VITE_API_URL;

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
        url: `${BASE_URL}/api/auth/resort-owner/profile`,
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

};

export default SummaryApi;
