'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import MainLayout from '../components/MainLayout';
import { postsService, PostCreateData } from '../services/posts';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

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

export default function CreatePostPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PostFormInputs>();

  // Check auth status inside useEffect instead of during render
  useEffect(() => {
    // Only run on client side
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

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
      const postData: PostCreateData = {
        title: data.title,
        content: data.content,
        image: selectedImage || undefined,
      };

      await postsService.createPost(postData);
      toast.success('Post created successfully!');
      router.push('/');
    } catch (err: any) {
      console.error('Failed to create post:', err);
      setError(err.response?.data?.detail || 'Failed to create post. Please try again.');
      toast.error(err.response?.data?.detail || 'Failed to create post.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Create New Post
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
              autoFocus
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
                Upload Image
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
              {isLoading ? 'Creating Post...' : 'Create Post'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
} 