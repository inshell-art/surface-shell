import type { SurfaceTranscriptEntry } from "./types.js";

export function createSurfaceTranscript(limit: number): SurfaceTranscriptEntry[] {
  return capTranscript([], limit);
}

export function addTranscriptEntry(
  transcript: SurfaceTranscriptEntry[],
  entry: SurfaceTranscriptEntry,
  limit: number
): SurfaceTranscriptEntry[] {
  return capTranscript([...transcript, entry], limit);
}

export function capTranscript(transcript: SurfaceTranscriptEntry[], limit: number): SurfaceTranscriptEntry[] {
  return transcript.slice(Math.max(0, transcript.length - Math.max(0, limit)));
}
