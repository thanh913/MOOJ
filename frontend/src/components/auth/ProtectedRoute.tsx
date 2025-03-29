import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Assuming RootState includes auth state
import { UserRole } from '../../types/user';
import { selectIsAuthenticated, selectCurrentUser } from '../../store/slices/authSlice';
import { CircularProgress, Box } from '@mui/material'; // For loading state

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirect to home or an unauthorized page if role is not allowed
    // For now, redirect to problem list
    return <Navigate to="/problems" replace />;
  }

  // If authenticated and role is allowed, render the child route component
  return <Outlet />;
};

export default ProtectedRoute; 