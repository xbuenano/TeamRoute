import { readPublicProfile } from "@/db/profiles";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PublicProfile({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await readPublicProfile(handle);
  if (!data) notFound();
  const { profile, agendas } = data;
  return <main className="public-profile-page" style={{ "--profile-accent": profile.accentColor, "--profile-button": profile.buttonColor } as React.CSSProperties}>
    <section className="public-profile-hero">
      {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="public-profile-avatar" /> : <span className="public-profile-avatar initials">{profile.fullName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>}
      <p className="eyebrow">TEAMROUTE</p><h1>{profile.fullName}</h1><p>{profile.welcomeMessage}</p>
      {profile.storyMediaUrl && (profile.storyMediaType === "video" ? <video className="public-profile-media" controls src={profile.storyMediaUrl} /> : <img className="public-profile-media" src={profile.storyMediaUrl} alt="Presentación" />)}
    </section>
    <section className="public-profile-agendas"><h2>Agenda una reunión</h2><p>Selecciona la agenda que mejor se adapte a tu necesidad.</p>{agendas.length ? <div>{agendas.map((agenda) => <a key={agenda.id} href={`/book/${agenda.bookingSlug}`}><span>⇄</span><div><strong>{agenda.title}</strong><small>{agenda.durationMinutes} min · Reunión Round Robin</small></div><b>Elegir horario →</b></a>)}</div> : <p className="public-profile-empty">No hay agendas disponibles en este momento.</p>}</section>
  </main>;
}
