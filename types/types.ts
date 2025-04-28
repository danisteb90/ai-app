export interface ChannelDetails {
    title: string;
    thumbnail: string;
    subscribers: string;
}

export interface VideoDetails {
    title: string;
    views: string;
    likes: string;
    comments: string;
    thumbnail: string;
    channel: ChannelDetails;
    publishedAt: string;
    details: string;
}

//Transcript Interface
export interface TranscriptEntry {
    text: string;
    timestamp: string;
}

// ToolInvocation
export interface ToolInvocation {
    toolCallId: string;
    toolName: string;
    result?: Record<string, unknown>;
}

// ToolPart interface
export interface ToolPart {
    type: "tool-invocation";
    toolInvocation: ToolInvocation;
}