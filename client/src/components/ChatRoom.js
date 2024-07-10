import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../Auth';
import './ChatRoom.css';

function ChatRoom() {
  const { roomId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    console.log('roomId:', roomId); // Отладка
    if (!roomId) {
      console.error('Room ID is not defined');
      return;
    }
    const fetchNickname = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setNickname(userDoc.data().nickname || '');
          }
        } catch (error) {
          console.error('Error fetching nickname:', error);
        }
      }
    };

    fetchNickname();
  }, [currentUser, roomId]);

  useEffect(() => {
    if (!roomId) return;
    const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
      scrollToBottom();
    });

    return unsubscribe;
  }, [roomId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messagesRef = collection(db, 'chatrooms', roomId, 'messages');
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: currentUser.uid,
      nickname: nickname
    });

    setNewMessage('');
  };

  return (
    <div className="chat-room">
      <div className="messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.uid === currentUser?.uid ? 'sent' : 'received'}`}>
            <p>{message.text}</p>
            <small>{message.nickname}</small>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;
