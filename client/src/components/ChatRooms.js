import React, { useState, useEffect } from 'react';
import { useAuth } from '../Auth';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, arrayUnion, arrayRemove, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import './ChatRooms.css';

function ChatRooms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [userRooms, setUserRooms] = useState([]);
  const [userRoomDetails, setUserRoomDetails] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const fetchUserRooms = async () => {
        const userDoc = doc(db, 'users', currentUser.uid);
        const unsubscribe = onSnapshot(userDoc, (docSnapshot) => {
          if (docSnapshot.exists()) {
            setUserRooms(docSnapshot.data().rooms || []);
          }
        });
        return () => unsubscribe();
      };

      fetchUserRooms();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchUserRoomDetails = async () => {
      const roomDetails = await Promise.all(userRooms.map(async (roomId) => {
        const roomDoc = await getDoc(doc(db, 'chatrooms', roomId));
        if (roomDoc.exists()) {
          return { id: roomId, ...roomDoc.data() };
        } else {
          return { id: roomId, name: 'Unknown Room' };
        }
      }));
      setUserRoomDetails(roomDetails);
    };

    if (userRooms.length > 0) {
      fetchUserRoomDetails();
    } else {
      setUserRoomDetails([]);
    }
  }, [userRooms]);

  useEffect(() => {
    const fetchRooms = async () => {
      if (searchTerm) {
        const q = query(collection(db, 'chatrooms'), where('name', '>=', searchTerm), where('name', '<=', searchTerm + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const fetchedRooms = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRooms(fetchedRooms);
      } else {
        setRooms([]);
      }
    };

    fetchRooms();
  }, [searchTerm]);

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
      const newRoom = await addDoc(collection(db, 'chatrooms'), {
        name: roomName,
        owner: currentUser.uid,
        members: [currentUser.uid],
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        rooms: arrayUnion(newRoom.id)
      });

      setRoomName('');
    } catch (err) {
      setError('Failed to create room');
      console.error('Error creating room: ', err);
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        rooms: arrayUnion(roomId)
      });
    } catch (err) {
      console.error('Error joining room: ', err);
    }
  };

  const handleLeaveRoom = async (roomId) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        rooms: arrayRemove(roomId)
      });
    } catch (err) {
      console.error('Error leaving room: ', err);
    }
  };

  return (
    <div className="chat-rooms">
      <Link to="/profile" className="back-button">←</Link>
      <h2>Chat Rooms</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search for rooms"
      />
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
            <button onClick={() => handleJoinRoom(room.id)}>Join</button>
          </div>
        ))}
      </div>
      <h3>My Rooms</h3>
      <div className="user-rooms">
        {userRoomDetails.map((room) => (
          <div key={room.id} className="user-room-item">
            <Link to={`/chatroom/${room.id}`}>{room.name}</Link>
            <button onClick={() => handleLeaveRoom(room.id)}>Leave</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatRooms;
