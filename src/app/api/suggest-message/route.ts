// import { streamText, APICallError } from 'ai';
// import { gateway } from 'ai';
// import { NextResponse } from 'next/server';

// export async function POST() {
//   try {
//     const prompt =
//       "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

//     // ✅ New AI SDK equivalent of `openai.completions.create({ stream: true, prompt })`
//     const result = streamText({
//       model: gateway('openai/gpt-5.1'),
//       prompt,           // same prompt as the old code
//       maxOutputTokens: 400,  // old `max_tokens: 2000`
//       // streaming is automatic because we're using streamText()
//     });

//     // ✅ New equivalent of `OpenAIStream + StreamingTextResponse`
//     return result.toTextStreamResponse();
    
//   } catch (error) {
//     if (APICallError.isInstance(error)) {
//       const { name, statusCode, responseHeaders, message } = error;

//       return NextResponse.json(
//         {
//           name,
//           message,
//           statusCode,
//           responseHeaders,
//         },
//         { status: statusCode ?? 500 },
//       );
//     } else {
//       console.error('Error in suggesting messages:', error);
//       throw error;
//     }
//   }
// }

// src/app/api/suggest-message/route.ts
import { NextResponse } from "next/server";
import { generateText, APICallError } from "ai";
import { gateway } from "ai";
import messagesData from "@/messages.json";

type MessageItem = {
  title: string;
  content: string;
  received: string;
};

export async function GET() {
  const prompt =
    "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. Avoid personal or sensitive topics.";

  // 1) Try AI first (optional – same as before)
  try {
    const result = await generateText({
      model: gateway("openai/gpt-5.1"),
      prompt,
      maxOutputTokens: 400,
    });

    const raw = result.text;
    const aiMessages = raw
      .split("||")
      .map((m) => m.trim())
      .filter(Boolean);

    if (aiMessages.length) {
      return NextResponse.json(
        { success: true, source: "ai", messages: aiMessages },
        { status: 200 }
      );
    }
  } catch (error) {
    if (APICallError.isInstance(error)) {
      console.warn("AI suggestion failed, falling back to local:", error.message);
    } else {
      console.warn("Unknown AI error, falling back:", error);
    }
  }

  // 2) Fallback: local JSON → messages: string[]
  try {
    const allMessages = messagesData as MessageItem[];

    if (!allMessages.length) {
      return NextResponse.json(
        { success: false, message: "No suggested messages configured" },
        { status: 500 }
      );
    }

    // use only the `content` text as suggestions
    const contents = allMessages.map((m) => m.content).filter(Boolean);

    const shuffled = [...contents].sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 5);

    return NextResponse.json(
      {
        success: true,
        source: "local",
        messages: suggestions, // 👈 string[]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in local fallback for suggest-message:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load suggested messages" },
      { status: 500 }
    );
  }
}
