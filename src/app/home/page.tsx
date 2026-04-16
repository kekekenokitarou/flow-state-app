import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { FlowScreen } from "@/components/FlowScreen"
import { prisma } from "@/lib/prisma"

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { displayName: true, avatarUrl: true },
  })

  const name = dbUser?.displayName ?? session.user.name ?? "User"
  const initial = name.charAt(0).toUpperCase()
  const image = dbUser?.avatarUrl ?? session.user.image ?? null

  return <FlowScreen name={name} initial={initial} image={image} />
}
