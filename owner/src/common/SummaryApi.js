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
    ownerPasswordLogin: {
        url: `${BASE_URL}/api/auth/resort-owner/password-login`,
        method: "POST",
    },
    updateOwnerMobile: {
        url: `${BASE_URL}/api/auth/owner/mobile`,
        method: "PUT",
    },
    checkMobileAvailability: {
        url: `${BASE_URL}/api/auth/mobile/check`,
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
        url: (id) => `${BASE_URL}/api/owner/property/${id}/booked-dates`,
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
    ownerCreateOrder: {
        url: `${BASE_URL}/api/owner/offline-booking/create-order`,
        method: "POST",
    },
    ownerVerifyPayment: {
        url: `${BASE_URL}/api/owner/offline-booking/verify`,
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
    checkOwnerByMobile: {
        url: `${BASE_URL}/api/owner/check-owner-mobile`,
        method: "POST",
    },
    createManager: {
        url: `${BASE_URL}/api/owner/manager/create`,
        method: "POST",
    },
    managerPrecheck: {
        url: `${BASE_URL}/api/auth/manager/precheck`,
        method: "POST",
    },
    managerLogin: {
        url: `${BASE_URL}/api/auth/manager/login`,
        method: "POST",
    },
    getOwnerBookedUsers: {
        url: `${BASE_URL}/api/owner/booked-users`,
        method: "GET",
    },
    updateOwnerProfile: {
        url: `${BASE_URL}/api/auth/owner/profile`,
        method: "PUT",
    },
    updateOwnerPassword: {
        url: `${BASE_URL}/api/auth/owner/password`,
        method: "PUT",
    },
    uploadOwnerAvatar: {
        url: `${BASE_URL}/api/auth/owner/avatar`,
        method: "POST",
    },
    removeOwnerAvatar: {
        url: `${BASE_URL}/api/auth/owner/avatar`,
        method: "DELETE",
    },
    publicOwnerPropertyCover: {
        url: `${BASE_URL}/api/public/property-cover`,
        method: "GET",
    },
    ownerCancelBooking: {
        url: (id) => `${BASE_URL}/api/owner/bookings/cancel/${id}`,
        method: "POST",
    },

};

export default SummaryApi;
