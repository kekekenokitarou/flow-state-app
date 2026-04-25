"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"
import { MAX_DISPLAY_NAME_LENGTH, MAX_AVATAR_SIZE_BYTES } from "@/constants/app"

const ALLOWED_MIME_MAGIC: number[][] = [
  [0xff, 0xd8, 0xff],
  [0x89, 0x50, 0x4e, 0x47],
  [0x47, 0x49, 0x46],
]

async function assertImageMagicBytes(file: File): Promise<void> {
  const ab = await file.arrayBuffer();
  const buf = new Uint8Array(ab, 0, Math.min(ab.byteLength, 12));
  const isWebp =
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50;
  const isKnown = isWebp || ALLOWED_MIME_MAGIC.some((magic) =>
    magic.every((b, i) => buf[i] === b)
  );
  if (!isKnown) throw new Error("有効な画像ファイルを選択してください");
}

const displayNameSchema = z
  .string()
  .trim()
  .min(1, "名前を入力してください")
  .max(MAX_DISPLAY_NAME_LENGTH, `${MAX_DISPLAY_NAME_LENGTH}文字以内で入力してください`);

export async function updateDisplayName(displayName: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const parsed = displayNameSchema.safeParse(displayName)
  if (!parsed.success) throw new Error(parsed.error.issues[0].message)

  await prisma.user.update({
    where: { email: session.user.email },
    data: { displayName: parsed.data },
  })

  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const file = formData.get("avatar") as File | null
  if (!file) throw new Error("ファイルが選択されていません")
  if (file.size > MAX_AVATAR_SIZE_BYTES) throw new Error("5MB以下の画像を選択してください")

  await assertImageMagicBytes(file)

  const ext = file.name.split(".").pop()
  const filename = `avatars/${session.user.email}-${Date.now()}.${ext}`

  const blob = await put(filename, file, { access: "public" })

  await prisma.user.update({
    where: { email: session.user.email },
    data: { avatarUrl: blob.url },
  })

  return { success: true, url: blob.url }
}
