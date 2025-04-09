import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  useTheme,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  Error as HighPriorityIcon,
  Star as StarIcon,
  Assessment as ReportIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

function Reports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'

  const theme = useTheme();

  useEffect(() => {
    // Check if user exists
    if (!user) {
      navigate('/login');
      return;
    }

    // Only fetch data if user is admin
    if (user.role === 'admin') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch tasks
      const tasksResponse = await fetch('http://localhost:5000/api/tasks', {
        headers
      });

      // Fetch users
      const usersResponse = await fetch('http://localhost:5000/api/users', {
        headers
      });

      if (!tasksResponse.ok) {
        throw new Error(`Tasks fetch failed: ${tasksResponse.statusText}`);
      }

      if (!usersResponse.ok) {
        throw new Error(`Users fetch failed: ${usersResponse.statusText}`);
      }

      const tasksData = await tasksResponse.json();
      const usersData = await usersResponse.json();

      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.message.includes('authentication')) {
        navigate('/login');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in_progress').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      highPriority: tasks.filter(task => task.priority === 'high').length,
      overdue: tasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'completed').length,
    };

    return stats;
  };

  // Calculate employee performance
  const calculateEmployeePerformance = () => {
    const performance = users.map(user => {
      const userTasks = tasks.filter(task => task.assignedTo?._id === user._id);
      const completedTasks = userTasks.filter(task => task.status === 'completed');
      const completionRate = userTasks.length > 0 
        ? (completedTasks.length / userTasks.length * 100).toFixed(1)
        : 0;

      return {
        ...user,
        totalTasks: userTasks.length,
        completedTasks: completedTasks.length,
        completionRate,
        onTime: completedTasks.filter(task => 
          new Date(task.completedAt) <= new Date(task.dueDate)
        ).length
      };
    });

    return performance.sort((a, b) => b.completionRate - a.completionRate);
  };

  // Get recent activity
  const getRecentActivity = () => {
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    return sortedTasks.slice(0, 5);
  };

  if (!user || user.role !== 'admin') {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          backgroundColor: 'grey.900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3
        }}
      >
        <Paper
          sx={{
            p: 4,
            backgroundColor: 'grey.800',
            color: 'white',
            textAlign: 'center',
            maxWidth: 400
          }}
        >
          <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>
            Access Denied
          </Typography>
          <Typography sx={{ color: 'grey.400', mb: 3 }}>
            The Reports section is only accessible to administrators. Please contact your administrator for access.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/dashboard')}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

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
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  const stats = calculateStats();
  const employeePerformance = calculateEmployeePerformance();
  const recentActivity = getRecentActivity();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'grey.900',
      pt: 3,
      pb: 6
    }}>
      <Container>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: 'grey.800',
            color: 'white',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <ReportIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" sx={{ color: 'white', mb: 1 }}>
              Reports & Analytics
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'grey.400' }}>
              Comprehensive overview of task management and employee performance
            </Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'grey.400' }}>Timeframe</InputLabel>
              <Select
                value={timeframe}
                label="Timeframe"
                onChange={(e) => setTimeframe(e.target.value)}
                sx={{ 
                  color: 'white',
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'grey.700'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'grey.600'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  }
                }}
              >
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Task Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'grey.800',
              color: 'white',
              borderRadius: 2,
              height: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TimelineIcon sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Task Overview</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>Total Tasks</Typography>
                  <Typography variant="h4" sx={{ color: 'white' }}>{stats.total}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>Completed</Typography>
                  <Typography variant="h4" color="success.main">{stats.completed}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>In Progress</Typography>
                  <Typography variant="h4" color="info.main">{stats.inProgress}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>Pending</Typography>
                  <Typography variant="h4" color="warning.main">{stats.pending}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'grey.800',
              color: 'white',
              borderRadius: 2,
              height: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <HighPriorityIcon sx={{ color: 'error.main' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Priority Distribution</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>High Priority</Typography>
                  <Typography variant="h4" color="error.main">{stats.highPriority}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>Overdue Tasks</Typography>
                  <Typography variant="h4" color="error.main">{stats.overdue}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ color: 'grey.400' }}>Completion Rate</Typography>
                  <Typography variant="h4" sx={{ color: 'white' }}>
                    {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ 
              p: 3, 
              backgroundColor: 'grey.800',
              color: 'white',
              borderRadius: 2,
              height: '100%'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <StarIcon sx={{ color: 'warning.main' }} />
                <Typography variant="h6" sx={{ color: 'white' }}>Recent Activity</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recentActivity.map(task => (
                  <Paper
                    key={task._id}
                    sx={{ 
                      p: 1.5,
                      backgroundColor: 'grey.900',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Chip
                      size="small"
                      label={task.status}
                      color={
                        task.status === 'completed' ? 'success' :
                        task.status === 'in_progress' ? 'primary' : 'default'
                      }
                    />
                    <Typography variant="body2" noWrap sx={{ color: 'grey.300' }}>
                      {task.title}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Employee Performance Table */}
        <Paper sx={{ 
          backgroundColor: 'grey.800',
          borderRadius: 2,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'grey.700' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>Employee Performance</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'grey.400' }}>Employee</TableCell>
                  <TableCell align="right" sx={{ color: 'grey.400' }}>Total Tasks</TableCell>
                  <TableCell align="right" sx={{ color: 'grey.400' }}>Completed</TableCell>
                  <TableCell align="right" sx={{ color: 'grey.400' }}>On Time</TableCell>
                  <TableCell align="right" sx={{ color: 'grey.400' }}>Completion Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employeePerformance.map((employee) => (
                  <TableRow 
                    key={employee._id}
                    sx={{ 
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'grey.900',
                      }
                    }}
                  >
                    <TableCell sx={{ color: 'white' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {employee.firstName} {employee.lastName}
                        <Chip
                          size="small"
                          label={employee.role}
                          color={employee.role === 'admin' ? 'error' : 'primary'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{employee.totalTasks}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{employee.completedTasks}</TableCell>
                    <TableCell align="right" sx={{ color: 'white' }}>{employee.onTime}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        label={`${employee.completionRate}%`}
                        color={
                          employee.completionRate >= 75 ? 'success' :
                          employee.completionRate >= 50 ? 'warning' : 'error'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
}

export default Reports; 