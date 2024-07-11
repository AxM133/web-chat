import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AvatarUpload from '../AvatarUpload';
import './Profile.css';

function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAvatarUrl(data.avatarUrl || '');
            setNickname(data.nickname || 'User');
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
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

  const handleNicknameChange = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { nickname });
      setEditingNickname(false);
    } catch (error) {
      console.error('Error updating nickname:', error);
    }
  };

  return (
    <div className="profile-container">
      <AvatarUpload onUpload={handleUpload} currentAvatar={avatarUrl} />
      <h1>Profile</h1>
      {currentUser && (
        <div>
          <div className="nickname-container">
            {editingNickname ? (
              <>
                <input
                  className='input-nickname'
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <button onClick={handleNicknameChange} className="small-save-button">✓</button>
              </>
            ) : (
              <div className="nickname-display">
                <span className="nickname-label">Nickname:</span>
                <span className="nickname-value">{nickname}</span>
                <button onClick={() => setEditingNickname(true)} className="edit-button">✏️</button>
              </div>
            )}
          </div>
          <div className="email-container">
            <span>Email: {currentUser.email}</span>
          </div>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => navigate('/chatrooms')}>Go to Chat Rooms</button>
        </div>
      )}
    </div>
  );
}

export default Profile;
