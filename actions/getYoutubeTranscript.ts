import { api } from "@/convex/_generated/api";
import { FeatureFlag, featureFlagEvents } from "@/features/flags";
import { client } from "@/lib/schematic";
import { TranscriptEntry } from "@/types/types";
import { currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { Innertube } from "youtubei.js";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const youtube = await Innertube.create({
  lang: "en",
  location: "US",
  retrieve_player: false,
});

const formatTimestamp = (start_ms: number): string => {
  const minutes = Math.floor(start_ms / 60000);
  const seconds = Math.floor((start_ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const fetchTranscript = async (videoId: string): Promise<TranscriptEntry[]> => {
  try {
    const info = await youtube.getInfo(videoId);
    const transcriptData = await info.getTranscript();
    const transcript: TranscriptEntry[] =
      transcriptData.transcript.content?.body?.initial_segments.map(
        (segment) => ({
          text: segment.snippet.text ?? "N/A",
          timestamp: formatTimestamp(Number(segment.start_ms)),
        })
      ) ?? [];

    return transcript;
  } catch (error) {
    throw error;
  }
};

export async function getYoutubeTranscript(videoId: string) {
  const user = await currentUser();

  if (!user?.id) {
    console.error("[Auth] User authentication failed - no user ID found");
    throw new Error("User not found");
  }

  const existingTranscript = await convex.query(
    api.transcript.getTranscriptByVideoId,
    { videoId, userId: user.id }
  );

  if (existingTranscript) {
    return {
      cache:
        "This video has already been transcribed, Accessing cached transcript instrad of using tokens",
      transcript: existingTranscript.transcript,
    };
  }

  try {
    const transcript = await fetchTranscript(videoId);

    //Store the transcript in the database
    await convex.mutation(api.transcript.storeTranscript, {
      videoId,
      userId: user.id,
      transcript,
    });

    await client.track({
      event: featureFlagEvents[FeatureFlag.TRANSCRIPTION].event,
      company: {
        id: user.id,
      },
      user: {
        id: user.id,
      },
    });
    return {
      transcript,
      cache:
        "This video was transcribed using tokens, the transcript is now saved in the database",
    };
  } catch (error) {
    console.error("[Error] Failed to process transcript request:", error);
    return {
      transcript: [],
      cache: "Error fetching transcript, please try again later",
    };
  }
}
