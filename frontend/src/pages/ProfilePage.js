import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Grid,
  Avatar,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (!id) {
      navigate('/employees');
      return;
    }
    fetchUserProfile();
  }, [id, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }

      setUser(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
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
      fetchUserProfile();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeactivate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${id}/deactivate`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setDeactivateDialog(false);
      
      // If deactivating own account, logout
      if (id === currentUser._id) {
        logout();
      } else {
        navigate('/employees');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleBack = () => {
    navigate('/employees');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton onClick={handleBack} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="span">
          User Profile
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={4}>
          {/* User Info Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      bgcolor: user.role === 'admin' ? 'error.main' : 'primary.main',
                      fontSize: '2rem',
                      mb: 2,
                    }}
                  >
                    {user.firstName[0]}{user.lastName[0]}
                  </Avatar>
                  <Typography variant="h5" gutterBottom align="center">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.role.toUpperCase()}
                    color={user.role === 'admin' ? 'error' : 'primary'}
                    sx={{ mt: 1 }}
                  />
                </Box>

                {(currentUser._id === id || currentUser.role === 'admin') && !editMode && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button 
                      fullWidth
                      color="primary" 
                      variant="contained" 
                      onClick={() => setEditMode(true)}
                    >
                      Edit Details
                    </Button>
                    <Button 
                      fullWidth
                      color="error" 
                      variant="outlined"
                      onClick={() => setDeactivateDialog(true)}
                    >
                      Deactivate Account
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Task Statistics */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Task Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {user.tasks?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Tasks
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {user.tasks?.filter(task => task.status === 'completed').length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completed
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {user.tasks?.filter(task => task.status === 'in_progress').length || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        In Progress
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Tasks List */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Assigned Tasks
                </Typography>
                {user.tasks && user.tasks.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Due Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {user.tasks.map((task) => (
                          <TableRow key={task._id}>
                            <TableCell>{task.title}</TableCell>
                            <TableCell>
                              <Chip
                                label={task.status.replace('_', ' ').toUpperCase()}
                                color={
                                  task.status === 'completed'
                                    ? 'success'
                                    : task.status === 'in_progress'
                                    ? 'primary'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={task.priority.toUpperCase()}
                                color={
                                  task.priority === 'high'
                                    ? 'error'
                                    : task.priority === 'medium'
                                    ? 'warning'
                                    : 'success'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                    No tasks assigned
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Edit Profile Dialog */}
      <Dialog
        open={editMode}
        onClose={() => setEditMode(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Account Dialog */}
      <Dialog
        open={deactivateDialog}
        onClose={() => setDeactivateDialog(false)}
      >
        <DialogTitle>Deactivate Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to deactivate this account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeactivate} color="error" variant="contained">
            Deactivate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProfilePage; 