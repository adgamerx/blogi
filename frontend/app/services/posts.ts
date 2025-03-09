import api from '../lib/axios';

export interface Post {
  id: number;
  title: string;
  content: string;
  image_data?: string;
  created_at: string;
  updated_at: string;
  author_id: number;
  author: {
    id: number;
    username: string;
  };
}

export interface PostCreateData {
  title: string;
  content: string;
  image?: File;
}

export interface PostUpdateData {
  title?: string;
  content?: string;
  image?: File;
}

export const postsService = {
  getAllPosts: async (skip = 0, limit = 10): Promise<Post[]> => {
    const response = await api.get(`/posts?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data: PostCreateData): Promise<Post> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  updatePost: async (id: number, data: PostUpdateData): Promise<Post> => {
    const formData = new FormData();
    
    if (data.title) {
      formData.append('title', data.title);
    }
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.put(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  deletePost: async (id: number): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  searchPosts: async (query: string, skip = 0, limit = 10): Promise<Post[]> => {
    const response = await api.get(`/posts/search?query=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`);
    return response.data;
  },
}; 