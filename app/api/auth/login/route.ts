import { createSession, login, sessionCookie } from "@/db/auth";

export async function POST(request: Request) {
  try {
    const user = await login(await request.json());
    const session = await createSession(user);
    return Response.json({ user }, { headers: { "Set-Cookie": sessionCookie(session.token, session.expiresAt) } });
  } catch {
    return Response.json({ error: "No fue posible iniciar sesión con estas credenciales." }, { status: 401 });
  }
}
