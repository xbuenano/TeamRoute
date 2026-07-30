import { readProfile, updateProfile, type ProfileInput } from "@/db/profiles";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No fue posible procesar la configuraci\u00f3n.";
}

export async function GET() {
  try {
    return Response.json(await readProfile());
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json() as ProfileInput;
    const profile = await updateProfile(payload);
    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}
