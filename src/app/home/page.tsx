import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getHelloMessage } from "@/server/services/hello"
import { FlowScreen } from "@/components/FlowScreen"

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect("/")

  const message = getHelloMessage()
  return <FlowScreen message={message} />
}
