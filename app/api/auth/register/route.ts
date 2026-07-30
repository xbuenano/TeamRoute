import { createSession, register, sessionCookie } from "@/db/auth";

export async function POST(request: Request) {
  try {
    const user = await register(await request.json());
    const session = await createSession(user);
    return Response.json({ user }, { status: 201, headers: { "Set-Cookie": sessionCookie(session.token, session.expiresAt) } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible crear la cuenta." }, { status: 400 });
  }
}
