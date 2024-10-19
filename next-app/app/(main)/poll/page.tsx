'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useSearchParams } from 'next/navigation';

interface IQuestionProps {
  question: string;
  type: string;
  options: { id: number; value: string }[];
}

export default function Page() {
  const [questionType, setQuestionType] = useState('');

  const searchParams = useSearchParams();

  const pollId = searchParams.get('pollId');

  const { startInteraction, ques } = useSocket();

  // console.log('ques is : ', ques);

  const [Questions, setQuestions] = useState<IQuestionProps[]>();
  const [options, setOptions] = useState([{ id: 1, value: '' }]);
  const [question, setQuestion] = useState('');
  const [interaction, setInteraction] = useState<IQuestionProps>();

  const handleAddOption = () => {
    setOptions([...options, { id: options.length + 1, value: '' }]);
  };

  const handleRemoveOption = (id: number) => {
    setOptions(options.filter((option) => option.id !== id));
  };

  const handleOptionChange = (id: number, value: string) => {
    setOptions(options.map((option) => (option.id === id ? { ...option, value } : option)));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = {
      question,
      type: questionType,
      options: questionType === 'MCQ' ? options : [],
    };

    setQuestions((prev = []) => [...prev, formData]);
    console.log('Form Submitted', formData);
  };

  return (
    <div className="flex p-[10vh]">
      <div className="w-1/3">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-semibold">Name</p>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Add +</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[2vw]">
              <DropdownMenuItem onClick={() => setQuestionType('TEXT')}>
                <span>Text</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setQuestionType('MCQ')}>
                <span>MCQ</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setQuestionType('WORDCLOUD')}>
                <span>WORD</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-col gap-4 p-8">
          {Questions &&
            Questions.map((q: IQuestionProps, i) => {
              return (
                <Button
                  className="w-4/3"
                  key={i}
                  onClick={() => {
                    setQuestionType('');
                    setInteraction(q);
                  }}
                >
                  {q.question}
                </Button>
              );
            })}
        </div>
      </div>
      <div className="w-2/3">
        {questionType === 'MCQ' && (
          <form onSubmit={handleSubmit} className="space-y-4 p-[5vh]">
            {/* Question Input */}
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full"
                placeholder="Enter your question here"
              />
            </div>

            {/* Question Type */}

            {/* MCQ Options (shown if MCQ type is selected) */}
            {questionType === 'MCQ' && (
              <div>
                <Label>Options</Label>
                {options.map((option, index) => (
                  <div key={option.id} className="mb-2 flex items-center space-x-2">
                    <Input
                      className="w-full"
                      value={option.value}
                      onChange={(e) => handleOptionChange(option.id, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      type="button"
                      onClick={() => handleRemoveOption(option.id)}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={handleAddOption}>
                  Add Option
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit">Add Ques</Button>
          </form>
        )}
        {questionType === 'TEXT' && <div>Text</div>}
        {questionType === 'WORDCLOUD' && <div>Word CLoud</div>}

        {interaction && (
          <div className="flex flex-col gap-8 p-16">
            <h1 className="mx-auto text-2xl font-semibold">{interaction.question}</h1>

            <div className="flex flex-col gap-4">
              {interaction.options &&
                interaction.options.map((opt) => {
                  return <Button variant={'outline'}>{opt.value}</Button>;
                })}
            </div>

            <Button
              onClick={() => {
                console.log('hi');
                const ques = { ...interaction, pollId };
                console.log(ques);

                startInteraction(ques);
              }}
            >
              Start Interaction
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
