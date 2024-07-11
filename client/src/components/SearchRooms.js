import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './SearchRooms.css';

function SearchRooms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const { currentUser } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm) {
      const fetchRooms = async () => {
        const q = query(collection(db, 'chatrooms'), where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const fetchedRooms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRooms(fetchedRooms);
      };
      fetchRooms();
    } else {
      setRooms([]);
    }
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');

    if (roomName.trim() === '') {
      setError('Room name is required');
      return;
    }

    const q = query(collection(db, 'chatrooms'), where('name', '==', roomName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setError('Room name already exists');
      return;
    }

    try {
      await addDoc(collection(db, 'chatrooms'), {
        name: roomName,
        owner: currentUser.uid,
        members: [currentUser.uid],
        createdAt: serverTimestamp(),
      });
      setRoomName('');
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room: ', err);
    }
  };

  return (
    <div className="search-rooms">
      <Link to="/" className="back-button">←</Link>
      <h2>Chat Rooms</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for rooms"
        />
        <button type="submit">Search</button>
      </form>
      <form onSubmit={handleCreateRoom}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Create a new room"
        />
        <button type="submit">Create</button>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="room-results">
        {rooms.map((room) => (
          <div key={room.id} className="room-item">
            <p>{room.name}</p>
            <Link to={`/chatroom/${room.id}`}>Join</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchRooms;
