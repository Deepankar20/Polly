'use client';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [pollName, setPollName] = useState<string>();
  const [polls, setPolls] = useState([]);
  const { data, status } = useSession();

  const router = useRouter();
  

  useEffect(() => {
    async function fetchPolls() {
      try {
        if (!data) {
          return;
        }

        const res = await fetch(`http://localhost:3000/api/auth/poll?userId=${data.user.id}`);
        const polls = await res.json();


        setPolls(polls.data);
      } catch (error) {}
    }

    fetchPolls();
  }, [data]);

  async function createPoll() {
    try {
      if (!data) {
        return;
      }
      const poll = await fetch('http://localhost:3000/api/auth/poll', {
        method: 'POST',
        body: JSON.stringify({ createdBy: data.user.id as string, pollName }),
      });

    } catch (error) {}
  }

  return (
    <div className="mx-auto my-[25vh] md:w-1/2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="mb-[2vh]">
            Create New Poll
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Poll</DialogTitle>
            <DialogDescription>What should your poll would be called ?</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input
                id="name"
                onChange={(e) => setPollName(e.target.value)}
                placeholder="enter name here"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={createPoll}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableCaption>A list of your created Polls.</TableCaption>

        <TableBody>
          {polls.map((poll: { title: string; id: number }, i) => {
            return (
              <div
                onClick={() => {
                  router.push(`/poll?pollId=${poll.id}`);
                }}
                key={i}
              >
                <TableRow>
                  <TableCell className="font-medium">{i + 1}</TableCell>
                  <TableCell>{poll.title}</TableCell>
                </TableRow>
              </div>
            );
          }, [])}
          <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
