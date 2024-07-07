import React, { useRef, useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../Auth';
import defaultAvatar from '../assets/defaultAvatar.png';
import './AvatarUpload.css';

function AvatarUpload({ onUpload, currentAvatar }) {
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = async (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.includes('image/')) {
      const fileName = `${currentUser.uid}-${selected.name}`;
      const storageRef = ref(storage, `assets/${currentUser.uid}/${fileName}`);
      try {
        await uploadBytes(storageRef, selected);
        const url = await getDownloadURL(storageRef);
        onUpload(url);
      } catch (error) {
        setError('Upload failed: ' + error.message);
      }
    } else {
      setError('Please select an image file');
    }
  };

  return (
    <div className="avatar-upload">
      <img
        src={currentAvatar || defaultAvatar}
        alt="Avatar"
        className="avatar"
        onClick={() => fileInputRef.current.click()}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default AvatarUpload;
