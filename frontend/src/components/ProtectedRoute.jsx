import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles, children }) {
  const token = sessionStorage.getItem('auth_token');
  const userRaw = sessionStorage.getItem('user');

  // Not logged in → redirect to login
  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    // Corrupted data → clear and redirect
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to the user's own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}
