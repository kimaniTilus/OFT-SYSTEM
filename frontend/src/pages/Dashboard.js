import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
} from '@mui/material';

function Dashboard() {
  // This will be replaced with actual data from the backend
  const summaryData = {
    totalTasks: 15,
    completedTasks: 8,
    totalEmployees: 12,
    activeProjects: 4,
  };

  const recentActivities = [
    { id: 1, text: 'John completed Task A', time: '2 hours ago' },
    { id: 2, text: 'Sarah started Project X', time: '3 hours ago' },
    { id: 3, text: 'New task assigned to Mike', time: '5 hours ago' },
    { id: 4, text: 'Project Y completed', time: '1 day ago' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Summary Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="h3">
              {summaryData.totalTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Completed Tasks
            </Typography>
            <Typography variant="h3">
              {summaryData.completedTasks}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total Employees
            </Typography>
            <Typography variant="h3">
              {summaryData.totalEmployees}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Projects
            </Typography>
            <Typography variant="h3">
              {summaryData.activeProjects}
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
            {recentActivities.map((activity) => (
              <ListItem key={activity.id}>
                <ListItemText
                  primary={activity.text}
                  secondary={activity.time}
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