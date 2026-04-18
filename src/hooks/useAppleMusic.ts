"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedPlaylist {
  id: string;
  name: string;
  artworkUrl?: string;
}

export interface MusicAppSettings {
  enabled: boolean;
  activePlaylistId: string | null;
  savedPlaylists: SavedPlaylist[];
}

export interface LibraryPlaylist {
  id: string;
  name: string;
  artworkUrl?: string;
}

export type MusicStatus = "idle" | "loading" | "authorized" | "unauthorized" | "error";

const STORAGE_KEY = "flow-app:music-settings";

const defaultSettings: MusicAppSettings = {
  enabled: false,
  activePlaylistId: null,
  savedPlaylists: [],
};

function loadSettings(): MusicAppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

function persistSettings(settings: MusicAppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export interface UseAppleMusicReturn {
  status: MusicStatus;
  settings: MusicAppSettings;
  libraryPlaylists: LibraryPlaylist[];
  isPlaying: boolean;
  error: string | null;
  init: () => Promise<void>;
  authorize: () => Promise<void>;
  fetchLibraryPlaylists: () => Promise<void>;
  updateSettings: (updates: Partial<MusicAppSettings>) => void;
  startFlowMusic: () => Promise<void>;
  stopFlowMusic: () => Promise<void>;
}

export function useAppleMusic(): UseAppleMusicReturn {
  const [status, setStatus] = useState<MusicStatus>("idle");
  const [settings, setSettings] = useState<MusicAppSettings>(defaultSettings);
  const [libraryPlaylists, setLibraryPlaylists] = useState<LibraryPlaylist[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const waitForMusicKit = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("Server environment"));
        return;
      }
      if (window.MusicKit) {
        resolve();
        return;
      }
      const timer = setTimeout(() => reject(new Error("MusicKit JS の読み込みがタイムアウトしました")), 10_000);
      window.addEventListener(
        "musickitloaded",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    });

  const init = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("loading");
    setError(null);
    try {
      await waitForMusicKit();
      const res = await fetch("/api/apple-music/token");
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Developer token の取得に失敗しました");
      }
      const { token } = await res.json();

      await window.MusicKit.configure({
        developerToken: token,
        app: { name: "Flow State", build: "1.0" },
      });

      const music = window.MusicKit.getInstance();
      setStatus(music.isAuthorized ? "authorized" : "unauthorized");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      setError(msg);
      setStatus("error");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const authorize = useCallback(async () => {
    if (typeof window === "undefined" || !window.MusicKit) return;
    setStatus("loading");
    try {
      await window.MusicKit.getInstance().authorize();
      setStatus("authorized");
    } catch {
      setStatus("unauthorized");
    }
  }, []);

  const fetchLibraryPlaylists = useCallback(async () => {
    if (typeof window === "undefined" || !window.MusicKit) return;
    try {
      const music = window.MusicKit.getInstance();
      const response = await music.api.music("/v1/me/library/playlists", {
        limit: 100,
      });
      const items = (response.data?.data ?? []) as {
        id: string;
        attributes?: {
          name?: string;
          artwork?: { url?: string };
        };
      }[];
      setLibraryPlaylists(
        items.map((item) => ({
          id: item.id,
          name: item.attributes?.name ?? item.id,
          artworkUrl: item.attributes?.artwork?.url
            ?.replace("{w}", "60")
            ?.replace("{h}", "60"),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch library playlists", err);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<MusicAppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      persistSettings(next);
      return next;
    });
  }, []);

  const startFlowMusic = useCallback(async () => {
    if (!settings.enabled || !settings.activePlaylistId) return;
    if (typeof window === "undefined" || !window.MusicKit) return;
    try {
      const music = window.MusicKit.getInstance();
      if (!music.isAuthorized) return;
      await music.setQueue({ playlist: settings.activePlaylistId });
      await music.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("Failed to start music", err);
    }
  }, [settings.enabled, settings.activePlaylistId]);

  const stopFlowMusic = useCallback(async () => {
    if (!isPlaying) return;
    if (typeof window === "undefined" || !window.MusicKit) return;
    try {
      window.MusicKit.getInstance().pause();
      setIsPlaying(false);
    } catch (err) {
      console.error("Failed to stop music", err);
    }
  }, [isPlaying]);

  return {
    status,
    settings,
    libraryPlaylists,
    isPlaying,
    error,
    init,
    authorize,
    fetchLibraryPlaylists,
    updateSettings,
    startFlowMusic,
    stopFlowMusic,
  };
}
