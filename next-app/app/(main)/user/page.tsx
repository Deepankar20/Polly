'use client';
import { useSocket } from '@/context/SocketContext';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  const { ques, userJoin } = useSocket();
  const searchParams = useSearchParams();
  const pollId = searchParams.get('pollId');

  useEffect(() => {
    console.log(pollId);
    if (!pollId) {
      return;
    }
    userJoin({ pollId });
  }, []);
  return <div>{ques.question}</div>;
}
