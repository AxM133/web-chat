import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '../Auth';
import './ChatRoom.css';

function ChatRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [roomName, setRoomName] = useState('Room not found');
  const [nickname, setNickname] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const clearTypingStatus = useCallback(async () => {
    if (currentUser) {
      await setDoc(doc(db, 'typing-indicators', roomId, 'users', currentUser.uid), { typing: false, lastUpdated: serverTimestamp() }, { merge: true });
    }
  }, [currentUser, roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!roomId) {
      console.error('Room ID is not defined');
      return;
    }

    const fetchRoomName = async () => {
      const roomDoc = await getDoc(doc(db, 'chatrooms', roomId));
      if (roomDoc.exists()) {
        setRoomName(roomDoc.data().name);
      } else {
        console.error('Room does not exist');
      }
    };

    fetchRoomName();

    const fetchUserNickname = async () => {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setNickname(userDoc.data().nickname || 'User');
      }
    };

    fetchUserNickname();

    const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
      scrollToBottom(); // Прокрутка к последнему сообщению при загрузке
    });

    const typingRef = collection(db, 'typing-indicators', roomId, 'users');
    const typingQuery = query(typingRef, orderBy('lastUpdated'));
    const typingUnsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typingUsers = snapshot.docs.map(doc => doc.data());
      setTypingUsers(typingUsers);
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
      clearTypingStatus();
    };
  }, [roomId, currentUser, clearTypingStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: currentUser.uid,
      nickname: nickname,
    });

    setNewMessage('');
    clearTypingTimeout();
    await setDoc(doc(db, 'typing-indicators', roomId, 'users', currentUser.uid), { typing: false, lastUpdated: serverTimestamp() }, { merge: true });
  };

  const handleTyping = async (e) => {
    setNewMessage(e.target.value);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      await setDoc(doc(db, 'typing-indicators', roomId, 'users', currentUser.uid), { typing: false, lastUpdated: serverTimestamp() }, { merge: true });
    }, 3000);

    await setDoc(doc(db, 'typing-indicators', roomId, 'users', currentUser.uid), { typing: true, lastUpdated: serverTimestamp() }, { merge: true });
  };

  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="chat-room">
      <div className='header-chatrooms'>
        <button className="back-button" onClick={() => navigate('/chatrooms')}>
          ←
        </button>
        <h2 className="chat-title">{roomName}</h2>
      </div>
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.uid === currentUser?.uid ? 'sent' : 'received'}`}>
            <p>{message.text}</p>
            <small>{message.nickname}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="typing-indicator">
        {typingUsers.map((user) => (
          user.uid !== currentUser.uid && user.typing && <span key={user.uid}>{user.nickname} is typing...</span>
        ))}
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;
