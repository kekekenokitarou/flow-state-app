"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { put } from "@vercel/blob"

export async function updateDisplayName(displayName: string) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const trimmed = displayName.trim()
  if (!trimmed) throw new Error("名前を入力してください")
  if (trimmed.length > 30) throw new Error("30文字以内で入力してください")

  await prisma.user.update({
    where: { email: session.user.email },
    data: { displayName: trimmed },
  })

  return { success: true }
}

export async function updateAvatar(formData: FormData) {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthorized")

  const file = formData.get("avatar") as File | null
  if (!file) throw new Error("ファイルが選択されていません")
  if (!file.type.startsWith("image/")) throw new Error("画像ファイルを選択してください")
  if (file.size > 5 * 1024 * 1024) throw new Error("5MB以下の画像を選択してください")

  const ext = file.name.split(".").pop()
  const filename = `avatars/${session.user.email}-${Date.now()}.${ext}`

  const blob = await put(filename, file, { access: "public" })

  await prisma.user.update({
    where: { email: session.user.email },
    data: { avatarUrl: blob.url },
  })

  return { success: true, url: blob.url }
}
