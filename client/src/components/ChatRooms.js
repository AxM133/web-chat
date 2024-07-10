import React from 'react';
import { Link } from 'react-router-dom';
import './ChatRooms.css';

function ChatRooms() {
  return (
    <div className="chat-rooms">
      <h1>Chat Rooms</h1>
      <Link to="/chatroom/general" className="chat-room-link">General</Link>
      {/* Добавьте другие комнаты чата здесь */}
    </div>
  );
}

export default ChatRooms;
