export const baseURL = import.meta.env.VITE_BASE_URL;

const SummaryApi = {
  travellerPrecheck: {
    url: "/api/auth/traveller/precheck",
    method: "post",
  },
  travellerCheck: {
    url: "/api/auth/traveller/check",
    method: "post"
  },
  travellerLogin: {
    url: "/api/auth/traveller/login",
    method: "post"
  },
  travellerSignup: {
    url: "/api/auth/traveller/signup",
    method: "post"
  },
  uploadTravellerAvatar: {
    url: "/api/auth/traveller/upload-avatar",
    method: "post"
  },
  removeTravellerAvatar: {
  url: "/api/auth/traveller/avatar",
  method: "delete"
},
  refreshToken: {
    url: "/api/auth/refresh-token",
    method: "post"
  },
  me: {
    url: "/api/auth/me",
    method: "get",
  },
  getPublishedProperties: {
    url: "/api/properties/published",
    method: "get",
  },
  getWishlist: {
    url: "/api/wishlist",
    method: "get",
  },
  toggleWishlist: {
    url: "/api/wishlist/toggle",
    method: "post",
  },
  getSingleProperty: {
    url: (id) => `/api/properties/${id}`,
    method: "get"
  },
  getBookedDates: {
    url: (propertyId) => `/api/bookings/booked-dates/${propertyId}`,
    method: "get"
  },
  createBookingOrder: {
    url: "/api/bookings/create-order",
    method: "post"
  },
  verifyBookingPayment: {
    url: "/api/bookings/verify-payment",
    method: "post"
  },
  getUserBookings: {
    url: "/api/bookings/user",
    method: "get"
  },
  getUserReviews: {
    url: "/api/reviews/user",
    method: "get"
  },
  getPropertyReviews: {
    url: (id) => `/api/reviews/property/${id}`,
    method: "get"
  },
  addReview: {
    url: "/api/reviews",
    method: "post"
  },
  getInvoice: {
    url: (id) => `/api/bookings/invoice/${id}`,
    method: "get",
  },
  getPropertyBlockedDates: {
  url: (id) => `/api/properties/${id}/blocked-dates`,
  method: "GET",
 },
 deleteReview: {
  url: (id) => `/api/reviews/${id}`,
  method: "delete"
},
getUniqueLocations: {
  url: "/api/location/unique",
  method: "get",
},


};

export default SummaryApi;
