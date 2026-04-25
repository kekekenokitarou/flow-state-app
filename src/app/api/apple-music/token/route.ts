import { auth } from "@/auth";
import { generateAppleMusicToken } from "@/lib/appleMusicToken";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const token = generateAppleMusicToken();
    return Response.json({ token });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
