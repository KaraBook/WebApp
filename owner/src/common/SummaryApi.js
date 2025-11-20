const BASE_URL = import.meta.env.VITE_API_BASE;

const SummaryApi = {
    ownerPrecheck: {
        url: `${BASE_URL}/api/auth/resort-owner/precheck`,
        method: "POST",
    },
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
    updateOwnerProperty: (id) => ({
        url: `${BASE_URL}/api/owner/property/${id}`,
        method: "PUT",
    }),
    getPropertyBlockedDates: {
        url: (id) => `${BASE_URL}/api/owner/property/${id}/blocked-dates`,
        method: "GET",
    },
    getBookedDates: {
        url: (id) => `${BASE_URL}/api/booking/booked-dates/${id}`,
        method: "GET",
    },
    addBlockedDates: {
        url: (id) => `${BASE_URL}/api/owner/property/${id}/block-dates`,
        method: "POST",
    },
    removeBlockedDates: {
        url: (id) => `${BASE_URL}/api/owner/property/${id}/block-dates`,
        method: "DELETE",
    },
    ownerOfflineBooking: {
        url: `${BASE_URL}/api/owner/offline-booking`,
        method: "POST",
    },
    verifyBookingPayment: {
        url: `${BASE_URL}/api/payments/verify`,
        method: "POST",
    },
    checkTravellerByMobile: {
        url: `${BASE_URL}/api/owner/check-traveller`,
        method: "POST",
    },
    confirmOfflinePayment: {
        url: `${BASE_URL}/api/owner/confirm-offline-payment`,
        method: "POST",
    },
    ownerGetInvoice: {
        url: (id) => `${BASE_URL}/api/owner/invoice/${id}`,
        method: "GET",
    },




};

export default SummaryApi;
