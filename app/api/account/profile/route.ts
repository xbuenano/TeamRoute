import { readProfile, updateProfile, type ProfileInput } from "@/db/profiles";

function errorMessage(error: unknown) {
  if (!(error instanceof Error)) return "No fue posible procesar la configuraci\u00f3n.";
  const cause = error.cause instanceof Error ? error.cause.message : "";
  return cause ? `${error.message}: ${cause}` : error.message;
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
