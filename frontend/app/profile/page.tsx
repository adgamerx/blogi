'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Container,
  Avatar,
  Divider,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import MainLayout from '../components/MainLayout';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <MainLayout>
        <Alert severity="warning" sx={{ mt: 4 }}>
          Please log in to view your profile.
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Avatar 
              sx={{ 
                width: 100, 
                height: 100, 
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
                mb: 2
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h4" gutterBottom>
              {user.username}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              User ID: {user.id}
            </Typography>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body1">
                  <strong>Username:</strong> {user.username}
                </Typography>
                <Typography variant="body1">
                  <strong>Account Status:</strong> Active
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => router.push('/create-post')}
              sx={{ mr: 2 }}
            >
              Create New Post
            </Button>
            <Button 
              variant="outlined" 
              color="error"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
}
