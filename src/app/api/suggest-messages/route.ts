import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Load environment variables
// import dotenv from "dotenv";
// dotenv.config();

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Retrieve the OpenAI API key from environment variables
const openaiApiKey = process.env.OPENAI_API_KEY;

// Check if the API key is not found, throw an error
if (!openaiApiKey) {
  throw new Error(
    "API key not found. Please set the OPENAI_API_KEY environment variable."
  );
}

// Define the POST function to handle incoming requests
export async function POST(req: Request) {
  try {
    // Define the prompt for generating open-ended questions
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Extract messages from the request body
    const { messages } = await req.json();

    // Validate messages input
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid input: 'messages' must be an array", {
        status: 400,
      });
    }

    // Stream the generated text using OpenAI API
    const result = await streamText({
      model: openai("gpt-4o-mini-2024-07-18"),
      experimental_toolCallStreaming: true,
      messages,
      prompt,
      maxTokens: 400,
    });

    // Return the result as a streaming response
    return result.toAIStreamResponse();
  } catch (error) {
    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      const { name, status, headers, message } = error;
      return NextResponse.json(
        {
          name,
          status,
          headers,
          message,
        },
        { status }
      );
    } else {
      // Log and rethrow unexpected errors
      console.log("An unexpected error occured", error);
      throw error;
    }
  }
}

// import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const runtime = "edge";

// export async function POST(req: Request) {
//   const { messages } = await req.json();

// const response = await openai.chat.completions.create({
//   model: "gpt-4o-mini",
//   stream: true,
//   messages,
// });

// const stream = OpenAIStream(response);

// return new StreamingTextResponse(stream);
// }
