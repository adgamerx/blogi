import api from '../lib/axios';

interface RegisterData {
  username: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface UserResponse {
  id: number;
  username: string;
}

export const authService = {
  register: async (data: RegisterData): Promise<UserResponse> => {
    const response = await api.post('/register', data);
    return response.data;
  },
  
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post('/token', data);
    return response.data;
  },
  
  getUserDetails: async (username: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  }
}; 