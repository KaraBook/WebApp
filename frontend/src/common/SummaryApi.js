export const baseURL = import.meta.env.VITE_BASE_URL;

const SummaryApi = {
  
  travellerCheck:  { 
    url: "/api/auth/traveller/check",  
    method: "post" 
},
  travellerLogin:  { 
    url: "/api/auth/traveller/login",  
    method: "post" 
},
  travellerSignup: { 
    url: "/api/auth/traveller/signup", 
    method: "post" 
},
  refreshToken: { 
    url: "/api/auth/refresh-token",    
    method: "post" 
},
  me: {
    url: "/api/auth/me",
    method: "get",
  }
};

export default SummaryApi;
