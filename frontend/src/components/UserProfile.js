import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

function UserProfile({ userId, open, onClose }) {
  const { user: currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && userId) {
      fetchUserProfile();
    }
  }, [open, userId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setUser({ ...user, ...formData });
      setEditMode(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate this account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/users/${userId}/deactivate`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message);
        }

        // If deactivating own account, logout
        if (userId === currentUser._id) {
          logout();
        } else {
          onClose();
        }
      } catch (error) {
        setError(error.message);
      }
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Profile' : 'User Profile'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Box sx={{ mt: 2 }}>
            {editMode ? (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            ) : (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={user.role === 'admin' ? 'error' : 'primary'}
                      sx={{ mr: 1 }}
                    />
                  </Box>
                  {user.tasks && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Task Statistics
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Total Tasks
                          </Typography>
                          <Typography variant="h6">
                            {user.tasks.length}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            Completed
                          </Typography>
                          <Typography variant="h6">
                            {user.tasks.filter(task => task.status === 'completed').length}
                          </Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="body2" color="textSecondary">
                            In Progress
                          </Typography>
                          <Typography variant="h6">
                            {user.tasks.filter(task => task.status === 'in_progress').length}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!loading && !error && (
          <>
            <Button onClick={onClose} color="inherit">
              Close
            </Button>
            {(currentUser._id === userId || currentUser.role === 'admin') && (
              <>
                <Button
                  onClick={() => setEditMode(!editMode)}
                  color="primary"
                >
                  {editMode ? 'Cancel' : 'Edit Details'}
                </Button>
                {editMode && (
                  <Button onClick={handleUpdate} color="primary" variant="contained">
                    Save Changes
                  </Button>
                )}
                <Button
                  onClick={handleDeactivate}
                  color="error"
                >
                  Deactivate Account
                </Button>
              </>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default UserProfile; 