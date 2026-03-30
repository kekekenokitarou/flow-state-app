import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation"
import { FcGoogle } from "react-icons/fc"

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect("/home")

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold text-zinc-800">Flow State</h1>
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/home" })
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-3 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            <FcGoogle className="h-5 w-5" />
            Googleでログイン
          </button>
        </form>
      </div>
    </div>
  )
}
