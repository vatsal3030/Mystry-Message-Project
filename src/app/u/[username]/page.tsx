'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import { MessageSchema } from '@/schemas/messageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

type Suggestion = string;



const PublicProfilePage = () => {
  const params = useParams<{ username: string }>();
  const username = params.username as string;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const form = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      content: '',
    },
  });

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = form;

  // 🔹 Send anonymous message
  const onSubmit = async (data: z.infer<typeof MessageSchema>) => {
    try {
      const response = await axios.post<ApiResponse>('/api/send-messages', {
        username,           // from URL
        content: data.content,
      });

      if (!response.data.success) {
        toast('Error', {
          description: response.data.message || 'Failed to send message',
        });
        return;
      }

      toast('Message sent', {
        description: 'Your anonymous message has been delivered!',
      });

      // clear textarea
      setValue('content', '');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description:
          axiosError.response?.data.message ||
          'Something went wrong while sending the message',
      });
    }
  };

  // 🔹 Load suggested messages from backend
  const handleSuggestMessages = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await axios.get<ApiResponse>('/api/suggest-message');

      // assuming backend returns { messages: string[] }
      const msgs = (response.data as any).messages as string[] | undefined;

      if (!msgs || msgs.length === 0) {
        toast('No suggestions', {
          description: 'Could not load suggested messages',
        });
        setSuggestions([]);
        return;
      }

      setSuggestions(msgs);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description:
          axiosError.response?.data.message ||
          'Failed to load suggested messages',
      });
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // 🔹 When user clicks a suggestion → fill textarea
  const handleSuggestionClick = (text: string) => {
    setValue('content', text, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Public Profile Link
        </h1>

        <p className="font-semibold mb-2">
          Send Anonymous Message to @{username}
        </p>

        {/* Message form */}
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 mb-6"
          >
            <FormField
              control={control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your anonymous message here"
                      className="min-h-[120px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send It'
                )}
              </Button>
            </div>
          </form>
        </Form>

        {/* Suggest messages button */}
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={handleSuggestMessages}
            disabled={loadingSuggestions}
          >
            {loadingSuggestions ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Suggest Messages'
            )}
          </Button>
        </div>

        {/* Suggestions list */}
        <div>
          <p className="mb-2 text-sm text-gray-600">
            Click on any message below to select it.
          </p>

          {suggestions.length > 0 ? (
            <div className="border rounded-md divide-y">
              {suggestions.map((msg, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSuggestionClick(msg)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  {msg}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No suggestions loaded yet. Click "Suggest Messages" to see some ideas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
