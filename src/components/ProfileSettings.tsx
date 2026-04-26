"use client";

import { useState, useRef, useTransition } from "react";
import { updateDisplayName, updateAvatar } from "@/actions/updateProfile";
import { useRouter } from "next/navigation";

export function ProfileSettings() {
  const [nameValue, setNameValue] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameDone, setNameDone] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarDone, setAvatarDone] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleNameSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError(null);
    setNameDone(false);
    startTransition(async () => {
      try {
        await updateDisplayName(nameValue);
        setNameValue("");
        setNameDone(true);
        router.refresh();
      } catch (err) {
        setNameError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarDone(false);
    const formData = new FormData();
    formData.append("avatar", file);
    startTransition(async () => {
      try {
        await updateAvatar(formData);
        setAvatarDone(true);
        router.refresh();
      } catch (err) {
        setAvatarError(err instanceof Error ? err.message : "エラーが発生しました");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-zinc-500">
        プロフィール設定
      </p>

      {/* ユーザー名 */}
      <form onSubmit={handleNameSubmit} className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-800">ユーザー名</label>
        <input
          type="text"
          placeholder="新しい名前を入力"
          value={nameValue}
          onChange={(e) => setNameValue(e.target.value)}
          maxLength={30}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none transition bg-zinc-50 border-zinc-200 text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400"
          disabled={isPending}
        />
        {nameError && <p className="text-xs text-red-400">{nameError}</p>}
        {nameDone && <p className="text-xs text-green-400">保存しました</p>}
        <button
          type="submit"
          disabled={isPending || !nameValue.trim()}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-40 bg-zinc-800 text-white hover:bg-zinc-700"
        >
          {isPending ? "保存中..." : "保存"}
        </button>
      </form>

      <div className="border-t border-zinc-100" />

      {/* アイコン */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-800">アイコン</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="rounded-lg px-4 py-2 text-sm font-semibold transition disabled:opacity-40 bg-zinc-800 text-white hover:bg-zinc-700"
        >
          {isPending ? "アップロード中..." : "画像を選択"}
        </button>
        <p className="text-xs text-zinc-500">JPG / PNG / WebP・5MB以下</p>
        {avatarError && <p className="text-xs text-red-400">{avatarError}</p>}
        {avatarDone && <p className="text-xs text-green-400">更新しました</p>}
      </div>
    </div>
  );
}
