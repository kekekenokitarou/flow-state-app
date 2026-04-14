import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { FlowScreen } from "@/components/FlowScreen"

export default async function HomePage() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const name = session.user.name ?? "User"
  const initial = name.charAt(0).toUpperCase()

  return <FlowScreen name={name} initial={initial} />
}
