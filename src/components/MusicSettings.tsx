"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMusicContext } from "@/contexts/MusicContext";
import type { LibraryPlaylist } from "@/hooks/useAppleMusic";

export function MusicSettings() {
  const {
    status,
    settings,
    libraryPlaylists,
    error,
    init,
    authorize,
    fetchLibraryPlaylists,
    updateSettings,
  } = useMusicContext();

  const btnPrimary = "rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-40 bg-zinc-800 text-white hover:bg-zinc-700";
  const rowBase = "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-left transition hover:bg-zinc-50";

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (status === "authorized") fetchLibraryPlaylists();
  }, [status, fetchLibraryPlaylists]);

  function handleAddPlaylist(pl: LibraryPlaylist) {
    if (settings.savedPlaylists.some((p) => p.id === pl.id)) return;
    updateSettings({ savedPlaylists: [...settings.savedPlaylists, pl] });
  }

  function handleRemovePlaylist(id: string) {
    updateSettings({
      savedPlaylists: settings.savedPlaylists.filter((p) => p.id !== id),
      activePlaylistId:
        settings.activePlaylistId === id ? null : settings.activePlaylistId,
    });
  }

  function handleSetActive(id: string | null) {
    updateSettings({ activePlaylistId: id, enabled: id !== null });
  }

  function RadioDot({ active }: { active: boolean }) {
    return (
      <span
        className={cn(
          "flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center",
          active ? "border-zinc-800 bg-zinc-800" : "border-zinc-300"
        )}
      >
        {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
        音楽設定
      </p>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 leading-relaxed">
          {error}
        </p>
      )}

      {(status === "idle" || status === "loading") && (
        <p className="text-sm text-zinc-500">読み込み中...</p>
      )}

      {status === "error" && (
        <div className="text-xs leading-relaxed text-zinc-500">
          <p className="font-medium mb-1">Apple Music APIの設定が必要です</p>
          <p>以下の環境変数を設定してください：</p>
          <ul className="mt-1 ml-3 space-y-0.5 list-disc">
            <li>APPLE_MUSIC_TEAM_ID</li>
            <li>APPLE_MUSIC_KEY_ID</li>
            <li>APPLE_MUSIC_PRIVATE_KEY</li>
          </ul>
        </div>
      )}

      {status === "unauthorized" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-800">
            Apple Musicと接続してフロー中に再生するプレイリストを選べます
          </p>
          <button onClick={authorize} className={btnPrimary}>
            Apple Musicと接続
          </button>
        </div>
      )}

      {status === "authorized" && (
        <>
          {/* Active playlist selector */}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-zinc-800">フロー中に再生</p>

            <button
              onClick={() => handleSetActive(null)}
              className={cn(rowBase, !settings.enabled && "ring-1 ring-zinc-300")}
            >
              <RadioDot active={!settings.enabled} />
              <span className="text-sm text-zinc-500">音楽を再生しない</span>
            </button>

            {settings.savedPlaylists.map((pl) => {
              const isActive =
                settings.enabled && settings.activePlaylistId === pl.id;
              return (
                <div key={pl.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSetActive(pl.id)}
                    className={cn(rowBase, "flex-1", isActive && "ring-1 ring-zinc-300")}
                  >
                    <RadioDot active={isActive} />
                    <span className="text-sm truncate text-zinc-800">
                      {pl.name}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemovePlaylist(pl.id)}
                    className="text-xs px-2 py-1.5 rounded text-zinc-500 hover:bg-zinc-100"
                    aria-label={`${pl.name}を削除`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className="border-t border-zinc-100" />

          {/* Library playlists */}
          <div className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-zinc-800">
              ライブラリから追加
            </p>
            {libraryPlaylists.length === 0 ? (
              <p className="text-xs text-zinc-500">プレイリストが見つかりません</p>
            ) : (
              <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                {libraryPlaylists
                  .filter(
                    (pl) => !settings.savedPlaylists.some((s) => s.id === pl.id)
                  )
                  .map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => handleAddPlaylist(pl)}
                      className={cn(rowBase, "justify-between")}
                    >
                      <span className="text-sm truncate flex-1 text-zinc-800">
                        {pl.name}
                      </span>
                      <span className="text-xs flex-shrink-0 ml-2 text-zinc-500">
                        + 追加
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
