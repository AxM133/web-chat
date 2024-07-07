import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import './ChatRooms.css';

function ChatRooms() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const roomsCollection = collection(db, 'chatrooms');
      const roomSnapshot = await getDocs(roomsCollection);
      const roomList = roomSnapshot.docs.map(doc => doc.data());
      setRooms(roomList);
    };

    fetchRooms();
  }, []);

  return (
    <div className="chat-rooms-container">
      <h2>Chat Rooms</h2>
      {rooms.map((room, index) => (
        <Link key={index} to={`/chatroom/${room.id}`} className="chat-room-link">
          {room.name}
        </Link>
      ))}
    </div>
  );
}

export default ChatRooms;
