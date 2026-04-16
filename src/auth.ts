import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [Google],
  pages: {
    signIn: "/",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account) return false

      try {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
        })

        if (existing) {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              displayName: existing.displayName ?? user.name ?? null,
              avatarUrl: existing.avatarUrl ?? user.image ?? null,
              updatedAt: new Date(),
            },
          })
        } else {
          const userId = crypto.randomUUID()
          await prisma.user.create({
            data: {
              id: userId,
              email: user.email,
              displayName: user.name ?? null,
              avatarUrl: user.image ?? null,
              updatedAt: new Date(),
            },
          })
          await prisma.account.create({
            data: {
              id: crypto.randomUUID(),
              userId,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          })
        }

        return true
      } catch (err) {
        console.error("[auth] DB error during signIn:", err)
        return false
      }
    },
  },
})
