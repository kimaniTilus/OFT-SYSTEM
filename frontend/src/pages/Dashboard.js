import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Avatar,
  ListItemAvatar,
  Box,
  CircularProgress,
  Alert,
  Container,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    recentActivities: [],
  });

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tasks = await response.json();

      if (!response.ok) {
        throw new Error(tasks.message || 'Failed to fetch tasks');
      }

      // Calculate statistics
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const pendingTasks = tasks.filter(task => task.status !== 'completed');

      // Sort tasks by updatedAt date for recent activities
      const recentActivities = tasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(task => ({
          id: task._id,
          text: `${task.assignedTo.firstName} ${task.assignedTo.lastName} - ${task.title}`,
          status: task.status,
          time: task.updatedAt,
          priority: task.priority
        }));

      setDashboardData({
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        recentActivities,
      });
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CompletedIcon sx={{ color: 'success.main' }} />;
      default:
        return <PendingIcon sx={{ color: 'warning.main' }} />;
    }
  };

  const getCompletionRate = () => {
    if (dashboardData.totalTasks === 0) return 0;
    return Math.round((dashboardData.completedTasks / dashboardData.totalTasks) * 100);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 4, 
          background: 'linear-gradient(120deg, #2196f3 0%, #1976d2 100%)',
          color: 'white',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            bgcolor: 'white',
            color: '#1976d2',
          }}
        >
          <PersonIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Welcome back, {user.firstName}!
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            {user.role === 'admin' ? 'Administrator' : 'Team Member'} • {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {/* Task Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                <TaskIcon />
              </Avatar>
              <Typography variant="h6">Total Tasks</Typography>
            </Box>
            <Typography variant="h3" sx={{ mb: 1 }}>
              {dashboardData.totalTasks}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={100} 
              sx={{ height: 6, borderRadius: 3 }} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                <CompletedIcon />
              </Avatar>
              <Typography variant="h6">Completed</Typography>
            </Box>
            <Typography variant="h3" color="success.main" sx={{ mb: 1 }}>
              {dashboardData.completedTasks}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(dashboardData.completedTasks / Math.max(dashboardData.totalTasks, 1)) * 100} 
              color="success"
              sx={{ height: 6, borderRadius: 3 }} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                <PendingIcon />
              </Avatar>
              <Typography variant="h6">Pending</Typography>
            </Box>
            <Typography variant="h3" color="warning.main" sx={{ mb: 1 }}>
              {dashboardData.pendingTasks}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(dashboardData.pendingTasks / Math.max(dashboardData.totalTasks, 1)) * 100} 
              color="warning"
              sx={{ height: 6, borderRadius: 3 }} 
            />
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                <TrendingUpIcon />
              </Avatar>
              <Typography variant="h6">Completion Rate</Typography>
            </Box>
            <Typography variant="h3" color="info.main" sx={{ mb: 1 }}>
              {getCompletionRate()}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={getCompletionRate()} 
              color="info"
              sx={{ height: 6, borderRadius: 3 }} 
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TimeIcon sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6">Recent Activities</Typography>
        </Box>
        <List>
          {dashboardData.recentActivities.map((activity) => (
            <ListItem 
              key={activity.id}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: activity.status === 'completed' ? 'success.light' : 'warning.light' }}>
                  {getStatusIcon(activity.status)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{activity.text}</Typography>
                    {activity.priority === 'high' && (
                      <Chip 
                        size="small" 
                        color="error" 
                        label="High Priority"
                        icon={<StarIcon sx={{ fontSize: 16 }} />}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    {format(parseISO(activity.time), 'MMM dd, yyyy HH:mm')} • {activity.status.replace('_', ' ')}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default Dashboard; 