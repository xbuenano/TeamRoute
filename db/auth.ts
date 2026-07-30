import { and, eq, gt } from "drizzle-orm";
import { createHash, randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./index";
import { ensureDefaultProfile } from "./profiles";
import { authLoginAttempts, organizations, sessions, userProfiles, users } from "./schema";

const scrypt = promisify(scryptCallback);
const sessionDays = 14;

export type AuthUser = { id: string; email: string; role: string; fullName: string };
type Credentials = { email?: string; password?: string; fullName?: string; organizationName?: string };

function cleanEmail(value: string | undefined) {
  const email = value?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) throw new Error("Ingresa un correo electrónico válido.");
  return email;
}

function checkPassword(value: string | undefined) {
  const password = value ?? "";
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("La contraseña debe tener al menos 12 caracteres, mayúscula, minúscula y un número.");
  }
  return password;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, digest] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !digest) return false;
  const derived = await scrypt(password, salt, 64) as Buffer;
  const expected = Buffer.from(digest, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

function handleFromName(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 65) || "usuario";
}

async function createUniqueHandle(fullName: string) {
  const db = getDb();
  const base = handleFromName(fullName);
  for (let suffix = 0; suffix < 50; suffix += 1) {
    const handle = suffix ? `${base}-${suffix + 1}` : base;
    const [existing] = await db.select({ id: userProfiles.id }).from(userProfiles).where(eq(userProfiles.publicHandle, handle));
    if (!existing) return handle;
  }
  return `${base}-${randomBytes(4).toString("hex")}`;
}

async function recordFailure(email: string) {
  const db = getDb();
  const [attempt] = await db.select().from(authLoginAttempts).where(eq(authLoginAttempts.email, email));
  const failures = (attempt?.failedAttempts ?? 0) + 1;
  const lockedUntil = failures >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
  if (attempt) await db.update(authLoginAttempts).set({ failedAttempts: failures, lockedUntil, updatedAt: new Date() }).where(eq(authLoginAttempts.email, email));
  else await db.insert(authLoginAttempts).values({ email, failedAttempts: failures, lockedUntil });
}

async function canAttempt(email: string) {
  const db = getDb();
  const [attempt] = await db.select().from(authLoginAttempts).where(eq(authLoginAttempts.email, email));
  return !attempt?.lockedUntil || attempt.lockedUntil <= new Date();
}

async function clearFailures(email: string) {
  const db = getDb();
  await db.delete(authLoginAttempts).where(eq(authLoginAttempts.email, email));
}

export async function register(credentials: Credentials): Promise<AuthUser> {
  await ensureDefaultProfile();
  const db = getDb();
  const email = cleanEmail(credentials.email);
  const password = checkPassword(credentials.password);
  const fullName = credentials.fullName?.trim() ?? "";
  if (fullName.length < 2 || fullName.length > 160) throw new Error("Ingresa tu nombre completo.");
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  const passwordHash = await hashPassword(password);
  if (existing) {
    if (!existing.passwordHash && email === "xbuenano@sotomayorconsulting.com") {
      await db.update(users).set({ passwordHash }).where(eq(users.id, existing.id));
      await db.update(userProfiles).set({ fullName: "Xavier Buenano", updatedAt: new Date() }).where(eq(userProfiles.userId, existing.id));
      return { id: existing.id, email, role: existing.role, fullName: "Xavier Buenano" };
    }
    throw new Error("No fue posible crear la cuenta con estos datos.");
  }
  const organizationName = credentials.organizationName?.trim() || `${fullName} · TeamRoute`;
  if (organizationName.length > 160) throw new Error("El nombre de organización es demasiado largo.");
  const organizationId = randomUUID();
  const userId = randomUUID();
  await db.insert(organizations).values({ id: organizationId, name: organizationName });
  await db.insert(users).values({ id: userId, organizationId, email, role: "owner", passwordHash });
  await db.insert(userProfiles).values({ id: randomUUID(), userId, fullName, publicHandle: await createUniqueHandle(fullName) });
  return { id: userId, email, role: "owner", fullName };
}

export async function login(credentials: Credentials): Promise<AuthUser> {
  await ensureDefaultProfile();
  const email = cleanEmail(credentials.email);
  if (!await canAttempt(email)) throw new Error("No fue posible iniciar sesión con estas credenciales.");
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email));
  const passwordIsValid = user?.passwordHash ? await verifyPassword(credentials.password ?? "", user.passwordHash) : false;
  if (!user || !passwordIsValid) {
    await recordFailure(email);
    throw new Error("No fue posible iniciar sesión con estas credenciales.");
  }
  const [profile] = await db.select({ fullName: userProfiles.fullName }).from(userProfiles).where(eq(userProfiles.userId, user.id));
  await clearFailures(email);
  return { id: user.id, email: user.email, role: user.role, fullName: profile?.fullName ?? user.email };
}

export async function createSession(user: AuthUser) {
  const db = getDb();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + sessionDays * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ id: randomUUID(), userId: user.id, tokenHash, expiresAt });
  return { token, expiresAt };
}

export function sessionCookie(token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `teamroute_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor((expiresAt.getTime() - Date.now()) / 1000)}${secure}`;
}

export function expiredSessionCookie() { return "teamroute_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"; }

function tokenFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  return cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith("teamroute_session="))?.slice("teamroute_session=".length);
}

export async function getSessionUser(request: Request): Promise<AuthUser | null> {
  const token = tokenFromRequest(request);
  if (!token) return null;
  const db = getDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const [session] = await db.select({ sessionId: sessions.id, userId: users.id, email: users.email, role: users.role, fullName: userProfiles.fullName }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).innerJoin(userProfiles, eq(userProfiles.userId, users.id)).where(and(eq(sessions.tokenHash, tokenHash), gt(sessions.expiresAt, new Date())));
  if (!session) return null;
  await db.update(sessions).set({ lastSeenAt: new Date() }).where(eq(sessions.id, session.sessionId));
  return { id: session.userId, email: session.email, role: session.role, fullName: session.fullName };
}

export async function requireSession(request: Request) {
  const user = await getSessionUser(request);
  if (!user) throw new Error("No autorizado.");
  return user;
}

export async function destroySession(request: Request) {
  const token = tokenFromRequest(request);
  if (!token) return;
  const db = getDb();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  await db.delete(sessions).where(eq(sessions.tokenHash, tokenHash));
}
