'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MainLayout from '../../components/MainLayout';
import { postsService, Post } from '../../services/posts';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Import React 18's Suspense component
import { Suspense } from 'react';

// Main page component - no async here since it's client component
export default function PostDetailPage() {
  // Use the built-in useParams hook to get URL params
  const params = useParams();
  const id = params?.id as string;

  // Render the detail component with the id
  return <PostDetail id={id} />;
}

// Client component that handles the post detail UI and logic
function PostDetail({ id }: { id: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const postId = parseInt(id);

  // Add effect to check auth state when component mounts
  useEffect(() => {
    // Check auth state on mount
    console.log('Auth state check:', { 
      isAuthenticated, 
      hasUser: !!user, 
      userId: user?.id,
      localStorage: typeof window !== 'undefined' ? !!localStorage.getItem('auth_token') : 'N/A' 
    });
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postsService.getPostById(postId);
        setPost(data);
        // Light debugging that won't interfere with functionality
        console.log('Post loaded:', { postId, authorId: data.author_id });
      } catch (err: any) {
        console.error('Failed to fetch post:', err);
        setError(err.response?.data?.detail || 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, user]);

  const handleEdit = () => {
    router.push(`/edit-post/${postId}`);
  };

  const handleDeleteDialogOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await postsService.deletePost(postId);
      toast.success('Post deleted successfully');
      router.push('/');
    } catch (err: any) {
      console.error('Failed to delete post:', err);
      toast.error(err.response?.data?.detail || 'Failed to delete post.');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const isAuthor = post && user && post.author && post.author.username === user.username;

  // Add debug logging
  console.log('Author check:', { 
    currentUser: user?.username, 
    postAuthor: post?.author?.username,
    isAuthor
  });

  console.log('Debug values:', { 
    isAuthenticated, 
    user: user ? { id: user.id, username: user.username } : null,
    post: post ? { id: post.id, author_id: post.author_id, title: post.title } : null,
    isAuthor
  });

  if (loading) {
    return (
      <MainLayout>
        <Typography>Loading post...</Typography>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <Alert severity="error">{error}</Alert>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <Alert severity="info">Post not found</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Card sx={{ mb: 4 }}>
        {post.image_data && (
          <CardMedia
            component="img"
            sx={{ height: 300, objectFit: 'cover' }}
            image={`data:image/jpeg;base64,${post.image_data}`}
            alt={post.title}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h4" component="h1">
            {post.title}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            By {post.author?.username} on {format(new Date(post.created_at), 'MMMM dd, yyyy')}
            {post.updated_at !== post.created_at && 
              ` (Updated: ${format(new Date(post.updated_at), 'MMMM dd, yyyy')})`}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {post.content}
          </Typography>
        </CardContent>
      </Card>

      {isAuthenticated && isAuthor && (
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={handleEdit}
          >
            Edit Post
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />} 
            onClick={handleDeleteDialogOpen}
          >
            Delete Post
          </Button>
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Post</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this post? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
} 