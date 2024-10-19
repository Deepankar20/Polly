import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismaDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log(body);

    const { pollName, createdBy } = body;
    console.log(pollName, createdBy);

    const newPoll = await prisma.poll.create({
      data: {
        title: pollName,
        createdBy,
      },
    });

    if (!newPoll) {
      return NextResponse.json(
        { data: newPoll, message: 'Some Error Occured in DB' },
        { status: 501 },
      );
    }

    return NextResponse.json(
      { data: newPoll, message: 'Poll Created Successfully' },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ data: null, message: 'Internal Server Error' }, { status: 501 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    console.log('userid', userId);

    const polls = await prisma.poll.findMany({
      where: {
        createdBy: userId as string,
      },
    });

    if (!polls) {
      return NextResponse.json({ data: null, message: 'Polls not found' }, { status: 404 });
    }

    return NextResponse.json({ data: polls, message: 'Fetched Polls' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ data: null, message: 'Internal Server Error' }, { status: 501 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    const { pollId, questions } = body;

    if (!pollId || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ message: 'Invalid pollId or questions array' }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ message: 'Poll not found' }, { status: 404 });
    }

    await prisma.question.deleteMany({
      where: { pollId: pollId },
    });

    const updatedQuestions = await prisma.question.createMany({
      data: questions.map((q: any) => ({
        pollId: pollId,
        question: q.question,
        type: q.type,
        options: q.options ? JSON.stringify(q.options) : null,
      })),
    });

    const updatedPoll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        questions: true,
      },
    });

    return NextResponse.json(
      { data: updatedPoll, message: 'Poll and questions updated successfully' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
