import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ChatRooms.css';

const ChatRooms = () => {
  const navigate = useNavigate();

  return (
    <div className="chat-rooms">
      <div className='display-back-btn'>
        <button className="back-button" onClick={() => navigate('/profile')}>
          ←
        </button>
      </div>
      <h2>Chat Rooms</h2>
      <div className="chat-room-link">
        <Link to={`/chatroom/general`}>General</Link>
      </div>
    </div>
  );
};

export default ChatRooms;
