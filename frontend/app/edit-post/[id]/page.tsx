'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import React from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  Alert,
  Card,
  CardMedia,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import MainLayout from '../../components/MainLayout';
import { postsService, Post, PostUpdateData } from '../../services/posts';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { Suspense } from 'react';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

type PostFormInputs = {
  title: string;
  content: string;
};

// Define a type for the params
type PostParams = {
  id: string;
};

// Main component for post editing
export default async function EditPostPage({ params }: { params: PostParams }) {
  // In Next.js 15, we can simply await params
  const { id } = await params;
  
  return <EditPostForm id={id} />;
}

// Client component that handles the post editing UI and logic
function EditPostForm({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const postId = parseInt(id);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormInputs>();

  // Check auth status inside useEffect instead of during render
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsFetching(true);
      try {
        const data = await postsService.getPostById(postId);
        setPost(data);
        
        // Set form default values
        reset({
          title: data.title,
          content: data.content,
        });
        
        // Set image preview if exists
        if (data.image_data) {
          setImagePreview(`data:image/jpeg;base64,${data.image_data}`);
        }
        
        // Check if current user is the author
        if (user && data.author_id !== user.id) {
          setError('You are not authorized to edit this post');
          toast.error('You are not authorized to edit this post');
          router.push(`/posts/${postId}`);
        }
      } catch (err: any) {
        console.error('Failed to fetch post:', err);
        setError(err.response?.data?.detail || 'Failed to load post.');
        toast.error('Failed to load post');
      } finally {
        setIsFetching(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, reset, router, user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<PostFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);

    try {
      const postData: PostUpdateData = {
        title: data.title,
        content: data.content,
        image: selectedImage || undefined,
      };

      await postsService.updatePost(postId, postData);
      toast.success('Post updated successfully!');
      router.push(`/posts/${postId}`);
    } catch (err: any) {
      console.error('Failed to update post:', err);
      setError(err.response?.data?.detail || 'Failed to update post. Please try again.');
      toast.error(err.response?.data?.detail || 'Failed to update post.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error && !post) {
    return (
      <MainLayout>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Edit Post
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Post Title"
              {...register('title', { required: 'Title is required' })}
              error={!!errors.title}
              helperText={errors.title?.message}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="content"
              label="Post Content"
              multiline
              rows={10}
              {...register('content', { required: 'Content is required' })}
              error={!!errors.content}
              helperText={errors.content?.message}
            />
            
            <Box sx={{ mt: 2, mb: 3 }}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Update Image
                <VisuallyHiddenInput 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {imagePreview && (
                <Card sx={{ mt: 2 }}>
                  <CardMedia
                    component="img"
                    sx={{ height: 200, objectFit: 'contain' }}
                    image={imagePreview}
                    alt="Image preview"
                  />
                </Card>
              )}
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Updating Post...' : 'Update Post'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
} 