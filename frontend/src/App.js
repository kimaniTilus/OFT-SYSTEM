import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Employees from './pages/Employees';
import Reports from './pages/Reports';
import PrivateRoute from './components/PrivateRoute';
import ProfilePage from './pages/ProfilePage';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
              <Route path="employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
              <Route path="reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
              <Route path="profile/:id" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="profilepage" element={<Navigate to={`/profile/${localStorage.getItem('userId')}`} replace />} />
              <Route path="*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
