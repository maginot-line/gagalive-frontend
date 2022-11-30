import { useEffect } from 'react';
import io from 'socket.io-client';

export default function Home() {
  const socket = io('http://127.0.0.1:8000');
  useEffect(() => {
    socket.emit('enter_room', { payload: 'Welcome' }, () => {
      console.log('Welcome in my room!');
    });
  }, [socket]);
  return <span>Home</span>;
}
