import { NextResponse } from "next/server"
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { currentUser } from "@clerk/nextjs/server";
import { getVideoDetails } from "@/actions/getVideoDetails";
import fetchTranscript from "@/tools/fetchTranscript";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    headers: {
        "X-Goog-Api-Client": "gemini-1.5-pro-latest"
    }
})

const model = google("gemini-2.0-flash-001")

export async function POST(req: Request) {
  const { messages, videoId } = await req.json();
  const user = await currentUser();

  if (!user){
    return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
  }

  const videoDetails = await getVideoDetails(videoId);

  // Modificado para evitar respuestas duplicadas
  const systemMessage = `Please be more conversational. Dont send just a single line of text. You are an AI agent ready to accept questions from the user about ONE specific video. The video ID in question is ${videoId} but you will refer to this as ${videoDetails?.title || "Selected Video"}. Never use the ID. 

IMPORTANT FORMATTING RULES:
1. Give a resume of the video ONLY at the start of the conversation.
2. Use emojis to make the conversation more engaging.
3. Format for notion.
4. NEVER repeat yourself or duplicate content in your response.
5. NEVER provide the same information twice.
6. If you use the fetchTranscript tool, use it ONLY ONCE per conversation.
7. After using fetchTranscript, do not request the transcript again.
8. If the user asks you to transcribe the video, do it directly without asking for a second confirmation.

If an error occurs, explain it to the user and ask them to try again later. If the error suggests the user upgrade, explain that they must upgrade to use this feature, tell them gently to go to "Manage Plan" in the header and upgrade. 

If any tool is used, analyse the response and if it contains a cache, explain at the end - use words like database instead of cache to make it more easy to understand. 

IMPORTANT: Never start conversations about anything else than the video. If the user writes in spanish or another language, respond in the language they write in.`;

  // Verificar si la herramienta fetchTranscript ya fue usada en mensajes anteriores
  const transcriptAlreadyFetched = messages.some((msg: { role: string; content: string | string[]; }) => 
    msg.role === "assistant" && msg.content.includes("Tool Used: fetchTranscript")
  );

  const result = streamText({
    model,
    messages: [{
        role: "system",
        content: systemMessage,
    },
    // Si la transcripción ya fue obtenida, añadir un mensaje adicional para reforzar
    ...(transcriptAlreadyFetched ? [{
      role: "system",
      content: "IMPORTANT: The transcript has already been fetched. DO NOT use the fetchTranscript tool again. DO NOT repeat the transcript in your response."
    }] : []),
    ...messages],
    tools: {
      fetchTranscript: fetchTranscript,
    }
  })

  return result.toDataStreamResponse();
}