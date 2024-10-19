import { NextResponse } from 'next/server';

import prisma from '@/app/libs/prismaDb';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { title, Questions, createdBy } = body;

    const newPoll = prisma.poll.create({
      data: {
        title,
        createdBy,
        questions: {
          create: Questions.map((q: any) => ({
            question: q.question,
            type: q.type,
            options: q.type === 'MCQ' ? q.options : undefined,
            responses: q.type !== 'MCQ' ? [] : undefined,
          })),
        },
      },
      include: { questions: true },
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
    let id;

    if (userId) {
      id = parseInt(userId);
    }

    const polls = await prisma.poll.findMany({
      where: {
        createdBy: id,
      },
      include: {
        questions: true,
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
