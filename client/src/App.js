import React from 'react';
import './App.css'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AuthForm from './components/auth/AuthForm';
import Profile from './components/auth/Profile';
import ChatRooms from './components/ChatRooms';
import ChatRoom from './components/ChatRoom';
import { AuthProvider, useAuth } from './Auth';

function PrivateRoute({ element: Element, ...rest }) {
  const { currentUser } = useAuth();
  return currentUser ? <Element {...rest} /> : <Navigate to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/profile" element={<PrivateRoute element={Profile} />} />
          <Route path="/chatrooms" element={<PrivateRoute element={ChatRooms} />} />
          <Route path="/chatroom/:id" element={<PrivateRoute element={ChatRoom} />} />
          <Route path="*" element={<AuthCheck />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function AuthCheck() {
  const { currentUser } = useAuth();
  return currentUser ? <Navigate to="/chatrooms" /> : <Navigate to="/auth" />;
}

export default App;
