CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(160) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_agendas" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"booking_slug" varchar(100) NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_agendas_booking_slug_unique" UNIQUE("booking_slug")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"full_name" varchar(160) NOT NULL,
	"public_handle" varchar(80) NOT NULL,
	"avatar_url" text,
	"welcome_message" text DEFAULT 'Agenda una reunión con nuestro equipo.' NOT NULL,
	"story_media_url" text,
	"story_media_type" varchar(12) DEFAULT 'image' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"language" varchar(10) DEFAULT 'es' NOT NULL,
	"timezone" varchar(80) DEFAULT 'America/Guayaquil' NOT NULL,
	"time_format" varchar(8) DEFAULT '24h' NOT NULL,
	"date_format" varchar(16) DEFAULT 'DD/MM/AAAA' NOT NULL,
	"week_starts_on" varchar(10) DEFAULT 'monday' NOT NULL,
	"theme" varchar(12) DEFAULT 'light' NOT NULL,
	"accent_color" varchar(16) DEFAULT '#6d43d8' NOT NULL,
	"button_color" varchar(16) DEFAULT '#6d43d8' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "user_profiles_public_handle_unique" UNIQUE("public_handle")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"organization_id" uuid NOT NULL,
	"email" varchar(320) NOT NULL,
	"role" varchar(32) DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "profile_agendas" ADD CONSTRAINT "profile_agendas_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;