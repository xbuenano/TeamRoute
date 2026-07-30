import { getSessionUser } from "@/db/auth";
import { readProfile, updateProfile, type ProfileInput } from "@/db/profiles";

function errorMessage(error: unknown) {
  return error instanceof Error ? "No fue posible acceder al perfil guardado." : "No fue posible procesar la configuraci\u00f3n.";
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "No autorizado." }, { status: 401 });
    return Response.json(await readProfile(user.id));
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return Response.json({ error: "No autorizado." }, { status: 401 });
    const payload = await request.json() as ProfileInput;
    const profile = await updateProfile(user.id, payload);
    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
