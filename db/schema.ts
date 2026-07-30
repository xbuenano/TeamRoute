import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  role: varchar("role", { length: 32 }).notNull().default("owner"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  publicHandle: varchar("public_handle", { length: 80 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  welcomeMessage: text("welcome_message").notNull().default("Agenda una reunión con nuestro equipo."),
  storyMediaUrl: text("story_media_url"),
  storyMediaType: varchar("story_media_type", { length: 12 }).notNull().default("image"),
  isPublic: boolean("is_public").notNull().default(true),
  language: varchar("language", { length: 10 }).notNull().default("es"),
  timezone: varchar("timezone", { length: 80 }).notNull().default("America/Guayaquil"),
  timeFormat: varchar("time_format", { length: 8 }).notNull().default("24h"),
  dateFormat: varchar("date_format", { length: 16 }).notNull().default("DD/MM/AAAA"),
  weekStartsOn: varchar("week_starts_on", { length: 10 }).notNull().default("monday"),
  theme: varchar("theme", { length: 12 }).notNull().default("light"),
  accentColor: varchar("accent_color", { length: 16 }).notNull().default("#6d43d8"),
  buttonColor: varchar("button_color", { length: 16 }).notNull().default("#6d43d8"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profileAgendas = pgTable("profile_agendas", {
  id: uuid("id").primaryKey(),
  profileId: uuid("profile_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  bookingSlug: varchar("booking_slug", { length: 100 }).notNull().unique(),
  durationMinutes: integer("duration_minutes").notNull().default(60),
  isVisible: boolean("is_visible").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
