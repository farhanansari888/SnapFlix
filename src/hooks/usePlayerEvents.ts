import { syncHistory } from "@/actions/histories";
import { ContentType } from "@/types";
import { diff } from "@/utils/helpers";
import { useDocumentVisibility } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";
import useSupabaseUser from "./useSupabaseUser";

export type PlayerEventType = "play" | "pause" | "seeked" | "ended" | "timeupdate";

export interface BasePlayerEventEnvelope<T> {
  type: "PLAYER_EVENT" | "MEDIA_DATA";
  data: T;
}

export interface VidlinkEventData {
  event: PlayerEventType;
  currentTime: number;
  duration: number;
  mtmdbId: number;
  mediaType: ContentType;
  season?: number;
  episode?: number;
}

export type VidlinkPlayerMessage = BasePlayerEventEnvelope<VidlinkEventData>;

export interface VidkingEventData {
  event: PlayerEventType;
  currentTime: number;
  duration: number;
  id: string | number;
  mediaType: ContentType;
  season?: number;
  episode?: number;
  progress?: number;
}

export type VidkingPlayerMessage = BasePlayerEventEnvelope<VidkingEventData>;

export interface UnifiedPlayerEventData {
  event: PlayerEventType;
  currentTime: number;
  duration: number;
  mediaId: string | number;
  mediaType: ContentType;
  season?: number;
  episode?: number;
  progress?: number;
}

export interface PlayerAdapter<RawMessage extends BasePlayerEventEnvelope<any>> {
  /** Domain origin for identifying source */
  origin: `https://${string}`;
  /** Converts raw → unified structure */
  parse: (raw: RawMessage) => UnifiedPlayerEventData | null;
}

export type AdapterMap = Record<string, PlayerAdapter<any>>;

export const playerAdapters = {
  vidlink: {
    origin: "https://vidlink.pro",
    parse: (raw) => {
      if (raw.type !== "PLAYER_EVENT") return null;
      const d = raw.data;
      return {
        ...d,
        mediaId: d.mtmdbId,
      };
    },
  } satisfies PlayerAdapter<VidlinkPlayerMessage>,

  vidking: {
    origin: "https://www.vidking.net",
    parse: (raw) => {
      if (raw.type !== "PLAYER_EVENT") return null;
      const d = raw.data;
      return {
        ...d,
        mediaId: d.id,
      };
    },
  } satisfies PlayerAdapter<VidkingPlayerMessage>,

  bingr: {
    origin: "https://bingr.one",
    parse: (raw) => {
      if (raw.type !== "PLAYER_EVENT") return null;
      const d = raw.data;
      if (d.event === "playerstatus") {
        return {
          event: d.playing ? "play" : "pause",
          currentTime: d.currentTime || 0,
          duration: d.duration || 0,
          mediaId: "",
          mediaType: "movie",
        };
      }
      return null;
    },
  } satisfies PlayerAdapter<any>,
} as const satisfies AdapterMap;

export interface UsePlayerEventsOptions {
  mediaId?: string | number;
  mediaType?: ContentType;
  metadata?: { season?: number; episode?: number };
  saveHistory?: boolean;
  onPlay?: (data: UnifiedPlayerEventData) => void;
  onPause?: (data: UnifiedPlayerEventData) => void;
  onSeeked?: (data: UnifiedPlayerEventData) => void;
  onEnded?: (data: UnifiedPlayerEventData) => void;
  onTimeUpdate?: (data: UnifiedPlayerEventData) => void;
}

export function usePlayerEvents(options: UsePlayerEventsOptions = {}) {
  const { data: user } = useSupabaseUser();
  const documentState = useDocumentVisibility();

  const { mediaId, mediaType, metadata, saveHistory, onPlay, onPause, onSeeked, onEnded, onTimeUpdate } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lastEvent, setLastEvent] = useState<PlayerEventType | null>(null);
  const [lastCurrentTime, setLastCurrentTime] = useState(0);

  const eventDataRef = useRef<UnifiedPlayerEventData | null>(null);

  const syncToServer = async (data: UnifiedPlayerEventData, completed?: boolean) => {
    if (!saveHistory || !user) return;
    if (diff(data.currentTime, lastCurrentTime) < 3 && !completed) return; // prevent spam

    const payload: UnifiedPlayerEventData = {
      ...data,
      mediaId: data.mediaId || mediaId || "",
      mediaType: data.mediaType || mediaType || "movie",
      season: data.season || metadata?.season || 0,
      episode: data.episode || metadata?.episode || 0,
    };

    if (!payload.mediaId || payload.currentTime <= 0) return;

    const { success, message } = await syncHistory(payload, completed);
    if (success) setLastCurrentTime(data.currentTime);
    else console.error("Save history failed:", message);
  };

  // Sync on document tab change / visibility change
  useEffect(() => {
    if (!saveHistory || !user) return;
    if (documentState === "visible") return;
    if (!eventDataRef.current) return;
    syncToServer(eventDataRef.current);
  }, [documentState, lastCurrentTime]);

  // Periodic poll to query iframe player status
  useEffect(() => {
    const interval = setInterval(() => {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage({ command: "getStatus" }, "*");
        } catch (e) {}
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!saveHistory || !user) return;
      if (!eventDataRef.current) return;

      const payload = {
        ...eventDataRef.current,
        mediaId: eventDataRef.current.mediaId || mediaId || "",
        mediaType: eventDataRef.current.mediaType || mediaType || "movie",
        season: eventDataRef.current.season || metadata?.season || 0,
        episode: eventDataRef.current.episode || metadata?.episode || 0,
        completed: eventDataRef.current.event === "ended",
      };

      if (payload.mediaId && payload.currentTime > 0) {
        navigator.sendBeacon("/api/player/save-history", JSON.stringify(payload));
      }
    };

    const handleMessage = (event: MessageEvent) => {
      let rawData: any;
      try {
        rawData = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      } catch (err) {
        return;
      }

      if (!rawData || typeof rawData !== "object") return;

      let parsed: UnifiedPlayerEventData | null = null;

      // Handle Bingr / direct PLAYER_EVENT envelope
      if (rawData.type === "PLAYER_EVENT" && rawData.data) {
        const d = rawData.data;
        const eventName: PlayerEventType =
          d.event === "playerstatus"
            ? (d.playing ? "timeupdate" : "pause")
            : (d.event || "timeupdate");

        parsed = {
          event: eventName,
          currentTime: Number(d.currentTime || 0),
          duration: Number(d.duration || 0),
          mediaId: d.mediaId || mediaId || "",
          mediaType: d.mediaType || mediaType || "movie",
          season: d.season || metadata?.season || 0,
          episode: d.episode || metadata?.episode || 0,
        };
      } else {
        const adapter = Object.values(playerAdapters).find((a) => a.origin === event.origin);
        if (adapter) {
          parsed = adapter.parse(rawData);
        }
      }

      if (!parsed || !parsed.mediaId) return;

      eventDataRef.current = parsed;
      setLastEvent(parsed.event);

      switch (parsed.event) {
        case "play":
          setIsPlaying(true);
          onPlay?.(parsed);
          break;
        case "pause":
          setIsPlaying(false);
          syncToServer(parsed);
          onPause?.(parsed);
          break;
        case "ended":
          setIsPlaying(false);
          syncToServer(parsed, true);
          onEnded?.(parsed);
          break;
        case "seeked":
          setCurrentTime(parsed.currentTime);
          setDuration(parsed.duration);
          syncToServer(parsed);
          onSeeked?.(parsed);
          break;
        case "timeupdate":
          setCurrentTime(parsed.currentTime);
          setDuration(parsed.duration);
          syncToServer(parsed);
          onTimeUpdate?.(parsed);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (eventDataRef.current) handleBeforeUnload();
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [mediaId, mediaType, metadata?.season, metadata?.episode, user, saveHistory]);

  return { isPlaying, currentTime, duration, lastEvent };
}
