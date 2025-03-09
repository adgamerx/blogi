import api from '@/app/lib/axios';

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
    try {
      const response = await api.post('/register', data);
      return response.data;
    } catch (error: any) {
      // Enhance error message for registration failures
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.detail || 'Registration failed. Username may already exist.');
      }
      throw error;
    }
  },
  
  login: async (data: LoginData): Promise<LoginResponse> => {
    try {
      const response = await api.post('/token', data);
      return response.data;
    } catch (error: any) {
      // Enhance error message for login failures
      if (error.response?.status === 400) {
        // If we have a structured error from the API, use it
        if (error.response.data?.detail) {
          throw error;
        }
        // Otherwise provide a more specific error
        error.response.data = { detail: 'Invalid username or password' };
      }
      throw error;
    }
  },
  
  getUserDetails: async (username: string): Promise<UserResponse> => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  }
}; 