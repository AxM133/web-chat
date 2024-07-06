import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import './Profile.css';

function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile</h1>
      {currentUser && (
        <div>
          <p>Email: {currentUser.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
