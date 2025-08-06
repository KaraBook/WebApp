export const baseURL = 'http://localhost:5000'; 

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
  addProperty: {
    url: '/api/properties',
    method: 'post',
  },
   getProperties: {
    url: '/api/properties',
    method: 'get',
  },
  getSingleProperty: (id) => ({
    url: `/api/properties/${id}`,
    method: 'get',
  }),
  editProperty: (id) => ({
  url: `/api/properties/${id}`,
  method: 'put',
}),


};

export default SummaryApi;
