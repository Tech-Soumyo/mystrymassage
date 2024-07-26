// import OpenAI from "openai";
// import { streamText } from "ai";
// import dotenv from "dotenv";

// dotenv.config();

// // Create an instance of OpenAI with the API key from environment variables
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

// export async function POST(req: Request) {
//   const { messages } = await req.json();
//   const result = await streamText({ model :"gpt-4o-mini", messages });
//   return result.toAIStreamResponse();
// }
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Load environment variables
import dotenv from "dotenv";
dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error(
    "API key not found. Please set the OPENAI_API_KEY environment variable."
  );
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages input
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid input: 'messages' must be an array", {
        status: 400,
      });
    }

    const result = await streamText({
      model: openai("gpt-4-turbo"),
      messages,
    });

    return result.toAIStreamResponse();
  } catch (error) {}
}

// import OpenAI from "openai";
// import { OpenAIStream, StreamingTextResponse } from "ai";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const runtime = "edge";

// export async function POST(req: Request) {
//   const { messages } = await req.json();

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     stream: true,
//     messages,
//   });

//   const stream = OpenAIStream(response);

//   return new StreamingTextResponse(stream);
// }
