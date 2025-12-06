// src/app/api/suggest-message/route.ts
import { NextResponse } from "next/server";
import messagesData from "@/messages.json";
import { GoogleGenerativeAI } from "@google/generative-ai";

type MessageItem = {
  title: string;
  content: string;
  received: string;
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
  const prompt =
    "Create a list of three anonymous, friendly, and engaging questions that someone could send as a mystery message. " +
    "Return them as a single string. Prefer separating each question by `||` if possible. " +
    "Avoid personal or sensitive topics.";

  // 1) Try AI (Gemini)
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    console.log("[suggest-message] Gemini raw output:", raw);

    let aiMessages: string[] = [];

    if (raw.length > 0) {
      if (raw.includes("||")) {
        // Preferred: model follows our delimiter
        aiMessages = raw.split("||");
      } else {
        // Fallback: split by newlines or numbered list
        aiMessages = raw
          .split("\n")
          .map((line) =>
            line
              .replace(/^\d+[\).\-\:]\s*/, "") // remove "1. ", "2) ", etc.
              .trim()
          );
      }

      aiMessages = aiMessages.filter(Boolean); // remove empty lines
    }

    console.log("[suggest-message] Parsed AI messages:", aiMessages);

    if (aiMessages.length > 0) {
      return NextResponse.json(
        { success: true, source: "ai", messages: aiMessages },
        { status: 200 }
      );
    }
  } catch (error) {
    console.warn(
      "[suggest-message] Gemini suggestion failed, falling back to local:",
      error
    );
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

    const contents = allMessages.map((m) => m.content).filter(Boolean);

    const shuffled = [...contents].sort(() => 0.5 - Math.random());
    const suggestions = shuffled.slice(0, 5);

    console.log("[suggest-message] Using local fallback suggestions");

    return NextResponse.json(
      {
        success: true,
        source: "local",
        messages: suggestions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "[suggest-message] Error in local fallback for suggest-message:",
      error
    );
    return NextResponse.json(
      { success: false, message: "Failed to load suggested messages" },
      { status: 500 }
    );
  }
}
