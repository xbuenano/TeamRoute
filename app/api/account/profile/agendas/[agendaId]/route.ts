import { setAgendaVisibility } from "@/db/profiles";

export async function PATCH(request: Request, context: { params: Promise<{ agendaId: string }> }) {
  try {
    const { agendaId } = await context.params;
    const payload = await request.json() as { isVisible?: boolean };
    if (typeof payload.isVisible !== "boolean") return Response.json({ error: "isVisible debe ser booleano." }, { status: 400 });
    return Response.json({ agenda: await setAgendaVisibility(agendaId, payload.isVisible) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "No fue posible actualizar la agenda." }, { status: 400 });
  }
}
