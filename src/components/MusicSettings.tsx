"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useMusicContext } from "@/contexts/MusicContext";
import type { LibraryPlaylist } from "@/hooks/useAppleMusic";

interface MusicSettingsProps {
  isFlow: boolean;
}

export function MusicSettings({ isFlow }: MusicSettingsProps) {
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

  const baseText = isFlow ? "text-white" : "text-zinc-800";
  const subText = isFlow ? "text-zinc-400" : "text-zinc-500";
  const divider = isFlow ? "border-white/10" : "border-zinc-100";
  const btnPrimary = cn(
    "rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-40",
    isFlow
      ? "bg-orange-500/20 text-orange-300 hover:bg-orange-500/30"
      : "bg-zinc-800 text-white hover:bg-zinc-700"
  );
  const rowBase = cn(
    "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm text-left transition",
    isFlow ? "hover:bg-white/5" : "hover:bg-zinc-50"
  );

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
          active
            ? isFlow
              ? "border-orange-500 bg-orange-500"
              : "border-zinc-800 bg-zinc-800"
            : isFlow
            ? "border-white/30"
            : "border-zinc-300"
        )}
      >
        {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      <p className={cn("text-xs font-semibold tracking-widest uppercase", subText)}>
        音楽設定
      </p>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2 leading-relaxed">
          {error}
        </p>
      )}

      {(status === "idle" || status === "loading") && (
        <p className={cn("text-sm", subText)}>読み込み中...</p>
      )}

      {status === "error" && (
        <div className={cn("text-xs leading-relaxed", subText)}>
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
          <p className={cn("text-sm", baseText)}>
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
            <p className={cn("text-sm font-medium", baseText)}>フロー中に再生</p>

            <button
              onClick={() => handleSetActive(null)}
              className={cn(
                rowBase,
                !settings.enabled &&
                  (isFlow ? "ring-1 ring-orange-500/30" : "ring-1 ring-zinc-300")
              )}
            >
              <RadioDot active={!settings.enabled} />
              <span className={cn("text-sm", subText)}>音楽を再生しない</span>
            </button>

            {settings.savedPlaylists.map((pl) => {
              const isActive =
                settings.enabled && settings.activePlaylistId === pl.id;
              return (
                <div key={pl.id} className="flex items-center gap-1">
                  <button
                    onClick={() => handleSetActive(pl.id)}
                    className={cn(
                      rowBase,
                      "flex-1",
                      isActive &&
                        (isFlow
                          ? "ring-1 ring-orange-500/30"
                          : "ring-1 ring-zinc-300")
                    )}
                  >
                    <RadioDot active={isActive} />
                    <span className={cn("text-sm truncate", baseText)}>
                      {pl.name}
                    </span>
                  </button>
                  <button
                    onClick={() => handleRemovePlaylist(pl.id)}
                    className={cn(
                      "text-xs px-2 py-1.5 rounded",
                      subText,
                      isFlow ? "hover:bg-white/10" : "hover:bg-zinc-100"
                    )}
                    aria-label={`${pl.name}を削除`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          <div className={cn("border-t", divider)} />

          {/* Library playlists */}
          <div className="flex flex-col gap-1.5">
            <p className={cn("text-sm font-medium", baseText)}>
              ライブラリから追加
            </p>
            {libraryPlaylists.length === 0 ? (
              <p className={cn("text-xs", subText)}>プレイリストが見つかりません</p>
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
                      <span className={cn("text-sm truncate flex-1", baseText)}>
                        {pl.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs flex-shrink-0 ml-2",
                          isFlow ? "text-orange-400" : "text-zinc-500"
                        )}
                      >
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
