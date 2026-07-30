import { destroySession, expiredSessionCookie } from "@/db/auth";

export async function POST(request: Request) {
  await destroySession(request);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": expiredSessionCookie() } });
}
