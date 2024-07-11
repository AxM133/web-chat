import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChatRooms.css';

const ChatRooms = () => {
  const navigate = useNavigate();

  const handleClick = (path) => {
    navigate(path);
  };

  return (
    <div className="chat-rooms">
      <button className="back-button" onClick={() => navigate('/profile')}>
        ←
      </button>
      <h2>Chat Rooms</h2>
      <div className="chat-room-link" onClick={() => handleClick('/chatroom/general')}>
        General
      </div>
    </div>
  );
};

export default ChatRooms;
