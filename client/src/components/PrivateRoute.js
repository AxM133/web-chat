import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import { useAuth } from '../Auth';

function PrivateRoute({ element: Component, ...rest }) {
  const { currentUser } = useAuth();

  return (
    <Route
      {...rest}
      element={currentUser ? <Component /> : <Navigate to="/login" />}
    />
  );
}

export default PrivateRoute;
