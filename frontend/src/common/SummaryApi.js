export const baseURL = import.meta.env.VITE_BASE_URL;

const SummaryApi = {
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
};

export default SummaryApi;
