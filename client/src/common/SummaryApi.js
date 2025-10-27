export const baseURL = import.meta.env.VITE_BASE_URL;

const SummaryApi = {
  adminLogin: {
    url: '/api/auth/login',
    method: 'post',
  },
  refreshToken: {
    url: '/api/auth/refresh-token',
    method: 'post',
  },
  getAdminDetails: {
    url: '/api/admin/details',
    method: 'get',
  },

  createPropertyDraft: {
    url: '/api/properties/draft',
    method: 'post'
  },

  finalizeProperty: (id) => ({
    url: `/api/properties/${id}/media`,
    method: 'post',
  }),

  getProperties: {
    url: '/api/properties?isDraft=false',
    method: 'get'
  },

  getDraftProperties: {
    url: '/api/properties?isDraft=true',
    method: 'get'
  },

  getSingleProperty: (id) => ({
    url: `/api/properties/${id}`,
    method: 'get',
  }),

  editProperty: (id) => ({
    url: `/api/properties/${id}`,
    method: 'put',
  }),

  toggleBlock: (id) => ({ 
    url: `/api/properties/${id}/block`, 
    method: "put" 
  }),

  toggleUnblock: (id) => ({ 
    url: `/api/properties/${id}/unblock`, 
    method: "put" 
  }),

  toggleFeatured: (id) => ({ 
    url: `/api/properties/${id}/toggle-featured`, 
    method: "put" 
  }),

  togglePublish: (id) => ({ 
    url: `/api/properties/${id}/toggle-publish`, 
    method: "put" 
  }),

   getAllBookings: {
    url: '/api/admin/bookings',
    method: 'get',
  },

  getBookingInvoice: (id) => ({
    url: `/api/bookings/${id}/invoice`,
    method: 'get',
  }),



};

export default SummaryApi;
