'use client';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { jwtDecode, JwtPayload } from 'jwt-decode';

interface jwtType extends JwtPayload {
  email?: string;
}
interface SocketProviderProps {
  children?: React.ReactNode;
}

interface User {
  username: string;
  email: string;
  createdAt: string;
  id: number;
}

interface Imsg {
  from: User;
  to: User;
  content: string;
  timestamp: string;
}

interface Ityping {
  isTyping: boolean;
  to: User;
}

interface IQues {
  question: string;
  type: string;
  options: { id: number; value: string }[];
}

interface ISocketContext {
  messages: any;
  isTyping: boolean | undefined;
  startInteraction: (question: IQues) => any;
  ques: IQues;
  userJoin: (data: { pollId: string }) => any;
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);
  if (!state) throw new Error('state is undefined');

  return state;
};

const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<Imsg[]>([]);
  const [isTyping, setTyping] = useState<boolean>(false);
  const [ques, setQues] = useState<IQues>({ question: '', type: '', options: [] });

  const startInteraction: ISocketContext['startInteraction'] = useCallback(
    (ques) => {
      if (socket) {
        socket.emit('event:startInteraction', JSON.stringify(ques));
      }
    },
    [socket],
  );

  const userJoin: ISocketContext['userJoin'] = useCallback(
    (data: { pollId: string }) => {
      console.log('outsde socket func', data, socket);

      if (socket) {
        console.log('inside socket func', data);

        socket.emit('event:userJoined', data);
      }
    },
    [socket],
  );

  const onReplyPollStart = useCallback((ques: string) => {
    console.log('server to client', ques);

    setQues(JSON.parse(ques));
  }, []);

  useEffect(() => {
    const _socket = io('http://localhost:8000');

    _socket.on('reply:pollStart', onReplyPollStart);

    setSocket((prev) => _socket);

    return () => {
      _socket.off('reply:pollStart', onReplyPollStart);
      _socket.disconnect();

      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ messages, isTyping, startInteraction, ques, userJoin }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
