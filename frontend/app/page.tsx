'use client';

import { useState, useEffect } from 'react';
import { 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActions, 
  Button, 
  TextField,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MainLayout from './components/MainLayout';
import { postsService, Post } from './services/posts';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const router = useRouter();
  const postsPerPage = 9;

  const fetchPosts = async (searchTerm = '', pageNum = 1) => {
    setLoading(true);
    try {
      const skip = (pageNum - 1) * postsPerPage;
      let data;
      
      if (searchTerm) {
        data = await postsService.searchPosts(searchTerm, skip, postsPerPage);
      } else {
        data = await postsService.getAllPosts(skip, postsPerPage);
      }
      
      setPosts(data);
      // In a real app, we would get the total count from the API
      // For now, we'll assume we have exactly 2 pages if we have a full page of results
      setTotalPosts(data.length === postsPerPage ? postsPerPage * 2 : data.length);
    } catch (err) {
      setError('Failed to fetch posts. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts('', page);
  }, [page]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
    fetchPosts(searchQuery, 1);
  };

  const handleViewPost = (postId: number) => {
    router.push(`/posts/${postId}`);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <MainLayout>
      <Box component="section" sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Blogi
        </Typography>
        <Typography variant="h6" component="h2" color="text.secondary" gutterBottom>
          Discover interesting stories and insights
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4, display: 'flex' }}>
        <TextField
          fullWidth
          label="Search posts"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mr: 2 }}
        />
        <Button
          type="submit"
          variant="contained"
          startIcon={<SearchIcon />}
        >
          Search
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading posts...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : posts.length === 0 ? (
        <Typography>No posts found. Be the first to create one!</Typography>
      ) : (
        <>
          <Grid container spacing={4}>
            {posts.map((post) => (
              <Grid item xs={12} sm={6} md={4} key={post.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {post.image_data && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={`data:image/jpeg;base64,${post.image_data}`}
                      alt={post.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="h2">
                      {post.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      By {post.author?.username} on {format(new Date(post.created_at), 'MMM dd, yyyy')}
                    </Typography>
                    <Typography variant="body2">
                      {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleViewPost(post.id)}>
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={Math.ceil(totalPosts / postsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </MainLayout>
  );
}
