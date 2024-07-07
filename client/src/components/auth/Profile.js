import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import AvatarUpload from '../AvatarUpload';
import './Profile.css';

function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const fetchAvatar = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setAvatarUrl(userDoc.data().avatarUrl || '');
          } else {
            await setDoc(doc(db, 'users', currentUser.uid), { avatarUrl: '', email: currentUser.email });
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      }
    };

    fetchAvatar();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleUpload = async (url) => {
    setAvatarUrl(url);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { avatarUrl: url });
    } catch (error) {
      console.error('Error updating avatar URL:', error);
    }
  };

  return (
    <div className="profile-container">
      <AvatarUpload onUpload={handleUpload} currentAvatar={avatarUrl} />
      <h1>Profile</h1>
      {currentUser && (
        <div>
          <p>Email: {currentUser.email}</p>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => navigate('/chatrooms')}>Go to Chat Rooms</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
