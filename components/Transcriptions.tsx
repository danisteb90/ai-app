"use client";

import { FeatureFlag } from "@/features/flags";
import { TranscriptEntry } from "@/types/types";
import { useSchematicEntitlement } from "@schematichq/schematic-react";
import { useState } from "react";
import UsageComponent from "./UsageComponent";

const Transcriptions = ({ videoId }: { videoId: string }) => {
  const [transcript, useTranscript] = useState<{
    transcript: TranscriptEntry[];
    cahce: string;
  } | null>(null);

  const { featureUsageExceeded } = useSchematicEntitlement(
    FeatureFlag.TRANSCRIPTION
  );

  console.log(videoId, useTranscript);

  return (
    <div className="border p-4 pb-0 rounded-xl gap-4 flex flex-col">
      <UsageComponent
        featureFlag={FeatureFlag.TRANSCRIPTION}
        title="Transcription"
      />
      {/* Transcription */}
      {!featureUsageExceeded ? (
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto rounded-md p-4">
          {transcript ? (
            transcript.transcript.map((entry, index) => (
              <div key={index} className="flex gap-2">
                <span className="text-sm text-gray-400 min-w-[50px]">
                  {entry.timestamp}
                </span>
                <p className="text-sm text-gray-700">{entry.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No transcription available</p>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Transcriptions;
