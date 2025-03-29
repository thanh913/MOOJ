import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store'; // Assuming RootState includes auth state
import { UserRole } from '../../types/user';

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  // TODO: Replace this with actual auth state from Redux when implemented
  // const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = true; // Placeholder: Assume user is logged in
  const user = { role: UserRole.Moderator }; // Placeholder: Assume user is Moderator

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