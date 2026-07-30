import { asc, eq } from "drizzle-orm";
import { getDb } from "./index";
import { organizations, profileAgendas, userProfiles, users } from "./schema";

const organizationId = "0bb4c68c-29cc-48f3-941c-871ba019b8e8";
const userId = "c4bc69e9-7775-4ef8-9212-7f39e54e10d7";
const profileId = "b6c10b24-a213-4f7e-b658-1aa863e52008";

export type ProfileInput = {
  fullName?: string;
  publicHandle?: string;
  avatarUrl?: string | null;
  welcomeMessage?: string;
  storyMediaUrl?: string | null;
  storyMediaType?: "image" | "video";
  isPublic?: boolean;
  language?: "es" | "en";
  timezone?: string;
  timeFormat?: "24h" | "12h";
  dateFormat?: "DD/MM/AAAA" | "MM/DD/AAAA" | "AAAA-MM-DD";
  weekStartsOn?: "monday" | "sunday";
  theme?: "light" | "dark" | "system";
  accentColor?: string;
  buttonColor?: string;
};

function cleanUrl(value: string | null | undefined) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  const url = new URL(trimmed);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("La URL debe comenzar con http:// o https://.");
  return url.toString();
}

function cleanHandle(value: string) {
  const handle = value.trim().toLowerCase();
  if (!/^[a-z0-9-]{3,80}$/.test(handle)) {
    throw new Error("El identificador p\u00fablico debe tener entre 3 y 80 caracteres: letras, n\u00fameros o guiones.");
  }
  return handle;
}

export async function ensureDefaultProfile() {
  const db = getDb();
  await db.insert(organizations).values({ id: organizationId, name: "Soto Consulting" }).onConflictDoNothing();
  await db.insert(users).values({ id: userId, organizationId, email: "xbuenano@sotomayorconsulting.com", role: "owner" }).onConflictDoNothing();
  await db.insert(userProfiles).values({
    id: profileId,
    userId,
    fullName: "Xavier Soto",
    publicHandle: "xaviersoto",
    welcomeMessage: "Agenda una reunión con nuestro equipo y descubre la mejor ruta para tu empresa.",
  }).onConflictDoNothing();
  await db.insert(profileAgendas).values([
    { id: "ac44f781-2d70-4b03-af15-9c1f9ce96e6c", profileId, title: "Sesión estratégica del equipo", bookingSlug: "consulta-inicial-llc", durationMinutes: 60, position: 0 },
    { id: "dd4e032b-05b3-47ba-a45b-9ff7cf34f103", profileId, title: "Diagnóstico y ruta de implementación", bookingSlug: "diagnostico-equipo", durationMinutes: 45, position: 1 },
  ]).onConflictDoNothing();
  return db;
}

export async function readProfile() {
  const db = await ensureDefaultProfile();
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, profileId));
  const agendas = await db.select().from(profileAgendas).where(eq(profileAgendas.profileId, profileId)).orderBy(asc(profileAgendas.position));
  if (!profile) throw new Error("No fue posible cargar el perfil.");
  return { profile, email: "xbuenano@sotomayorconsulting.com", agendas };
}

export async function updateProfile(input: ProfileInput) {
  const db = await ensureDefaultProfile();
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (input.fullName !== undefined) {
    const fullName = input.fullName.trim();
    if (fullName.length < 2 || fullName.length > 160) throw new Error("El nombre debe tener entre 2 y 160 caracteres.");
    values.fullName = fullName;
  }
  if (input.publicHandle !== undefined) values.publicHandle = cleanHandle(input.publicHandle);
  if (input.avatarUrl !== undefined) values.avatarUrl = cleanUrl(input.avatarUrl);
  if (input.welcomeMessage !== undefined) {
    const message = input.welcomeMessage.trim();
    if (message.length > 500) throw new Error("El mensaje de bienvenida no puede exceder 500 caracteres.");
    values.welcomeMessage = message;
  }
  if (input.storyMediaUrl !== undefined) values.storyMediaUrl = cleanUrl(input.storyMediaUrl);
  if (input.storyMediaType !== undefined) values.storyMediaType = input.storyMediaType;
  if (input.isPublic !== undefined) values.isPublic = input.isPublic;
  if (input.language !== undefined) values.language = input.language;
  if (input.timezone !== undefined) values.timezone = input.timezone;
  if (input.timeFormat !== undefined) values.timeFormat = input.timeFormat;
  if (input.dateFormat !== undefined) values.dateFormat = input.dateFormat;
  if (input.weekStartsOn !== undefined) values.weekStartsOn = input.weekStartsOn;
  if (input.theme !== undefined) values.theme = input.theme;
  if (input.accentColor !== undefined) values.accentColor = input.accentColor;
  if (input.buttonColor !== undefined) values.buttonColor = input.buttonColor;
  const [profile] = await db.update(userProfiles).set(values).where(eq(userProfiles.id, profileId)).returning();
  return profile;
}

export async function setAgendaVisibility(agendaId: string, isVisible: boolean) {
  const db = await ensureDefaultProfile();
  const [agenda] = await db.update(profileAgendas).set({ isVisible }).where(eq(profileAgendas.id, agendaId)).returning();
  if (!agenda) throw new Error("La agenda indicada no existe.");
  return agenda;
}

export async function readPublicProfile(handle: string) {
  const db = getDb();
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.publicHandle, cleanHandle(handle)));
  if (!profile || !profile.isPublic) return null;
  const agendas = await db.select().from(profileAgendas).where(eq(profileAgendas.profileId, profile.id)).orderBy(asc(profileAgendas.position));
  return { profile, agendas: agendas.filter((agenda) => agenda.isVisible && agenda.isActive) };
}
