import { generateAppleMusicToken } from "@/lib/appleMusicToken";

export async function GET() {
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
