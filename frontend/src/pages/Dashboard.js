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
} from '@mui/material';
import {
  Assignment as TaskIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Person as PersonIcon,
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

  return (
    <Grid container spacing={3}>
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="h3">
              {dashboardData.totalTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Completed Tasks
            </Typography>
            <Typography variant="h3" sx={{ color: 'success.main' }}>
              {dashboardData.completedTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Pending Tasks
            </Typography>
            <Typography variant="h3" sx={{ color: 'warning.main' }}>
              {dashboardData.pendingTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activities */}
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activities
          </Typography>
          <List>
            {dashboardData.recentActivities.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemAvatar>
                  <Avatar>
                    {getStatusIcon(activity.status)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={activity.text}
                  secondary={`${format(parseISO(activity.time), 'MMM dd, yyyy HH:mm')} - ${activity.status.replace('_', ' ')}`}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: activity.priority === 'high' ? 'bold' : 'normal',
                      color: activity.priority === 'high' ? 'error.main' : 'text.primary',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default Dashboard; 