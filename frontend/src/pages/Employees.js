import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Star as StarIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Employees() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);
  const [employeeStats, setEmployeeStats] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees...'); // Debug log
      const token = localStorage.getItem('token');
      console.log('Using token:', token); // Debug log
      
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Fetched data:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch employees');
      }

      setEmployees(data);
      await fetchEmployeeStats(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeStats = async (employeeList) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tasks = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const stats = {};
      employeeList.forEach(employee => {
        const employeeTasks = tasks.filter(task => task.assignedTo._id === employee._id);
        const completedTasks = employeeTasks.filter(task => task.status === 'completed');
        const ongoingTasks = employeeTasks.filter(task => task.status !== 'completed');
        
        // Calculate completion rate
        const completionRate = employeeTasks.length > 0
          ? (completedTasks.length / employeeTasks.length) * 100
          : 0;

        // Calculate average completion time (in days)
        const avgCompletionTime = completedTasks.length > 0
          ? completedTasks.reduce((acc, task) => {
              const start = new Date(task.startDate);
              const end = new Date(task.completedAt);
              return acc + (end - start) / (1000 * 60 * 60 * 24);
            }, 0) / completedTasks.length
          : 0;

        stats[employee._id] = {
          totalTasks: employeeTasks.length,
          completedTasks: completedTasks.length,
          ongoingTasks: ongoingTasks.length,
          completionRate,
          avgCompletionTime,
          recentTasks: employeeTasks
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3),
        };
      });

      setEmployeeStats(stats);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching employees...'); // Debug log
    fetchEmployees();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleMenuClick = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleViewProfile = () => {
    if (selectedEmployee) {
      navigate(`/profile/${selectedEmployee._id}`);
      handleMenuClose();
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'manager':
        return '#2196f3';
      default:
        return '#4caf50';
    }
  };

  const getPerformanceLevel = (completionRate) => {
    if (completionRate >= 90) return { text: 'Excellent', color: '#4caf50' };
    if (completionRate >= 75) return { text: 'Good', color: '#2196f3' };
    if (completionRate >= 60) return { text: 'Average', color: '#ff9800' };
    return { text: 'Needs Improvement', color: '#f44336' };
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
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Employees
      </Typography>

      <Grid container spacing={3}>
        {employees.map((employee) => {
          const stats = employeeStats[employee._id] || {
            totalTasks: 0,
            completedTasks: 0,
            ongoingTasks: 0,
            completionRate: 0,
            avgCompletionTime: 0,
            recentTasks: [],
          };
          const performance = getPerformanceLevel(stats.completionRate);

          return (
            <Grid item xs={12} sm={6} lg={4} key={employee._id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getRoleColor(employee.role),
                        width: 56,
                        height: 56,
                        mr: 2,
                      }}
                    >
                      {getInitials(employee.firstName, employee.lastName)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {employee.firstName} {employee.lastName}
                      </Typography>
                      <Typography color="textSecondary" variant="body2">
                        {employee.email}
                      </Typography>
                    </Box>
                    {currentUser?.role === 'admin' && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, employee)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: getRoleColor(employee.role),
                        color: 'white',
                        mr: 1,
                      }}
                    />
                    {employee.department && (
                      <Chip
                        label={employee.department}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tasks Progress
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stats.completionRate || 0}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        Active Tasks: {stats.ongoingTasks || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Completed: {stats.completedTasks || 0}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary" align="right" sx={{ mt: 0.5 }}>
                      Total Tasks: {stats.totalTasks || 0}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewProfile}>View Profile</MenuItem>
      </Menu>
    </Container>
  );
}

export default Employees; 