"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type Tab = "general" | "calendars" | "integrations" | "team";
type Theme = "light" | "dark" | "system";
type Profile = {
  id: string; fullName: string; publicHandle: string; avatarUrl: string | null;
  welcomeMessage: string; storyMediaUrl: string | null; storyMediaType: "image" | "video";
  isPublic: boolean; language: "es" | "en"; timezone: string; timeFormat: "24h" | "12h";
  dateFormat: "DD/MM/AAAA" | "MM/DD/AAAA" | "AAAA-MM-DD"; weekStartsOn: "monday" | "sunday";
  theme: Theme; accentColor: string; buttonColor: string;
};
type Agenda = { id: string; title: string; bookingSlug: string; durationMinutes: number; isVisible: boolean; isActive: boolean };
type AccountData = { profile: Profile; email: string; agendas: Agenda[] };
type Member = { name: string; email: string; role: string; status: string; calendar: boolean; initials: string };

const initialMembers: Member[] = [
  { name: "Xavier Buenano", email: "xbuenano@sotomayorconsulting.com", role: "Propietario", status: "Activo", calendar: true, initials: "XB" },
  { name: "Ana Torres", email: "ana@sotomayorconsulting.com", role: "Agente", status: "Activo", calendar: true, initials: "AT" },
  { name: "Carlos Mendoza", email: "carlos@sotomayorconsulting.com", role: "Agente", status: "Activo", calendar: true, initials: "CM" },
];

function initials(name: string) { return name.split(" ").filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase(); }

export function AccountSettings() {
  const [tab, setTab] = useState<Tab>("general");
  const [data, setData] = useState<AccountData | null>(null);
  const [members, setMembers] = useState(initialMembers);
  const [profileOpen, setProfileOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/account/profile").then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible cargar la configuración.");
      setData(payload);
    }).catch((cause: Error) => setError(cause.message));
  }, []);

  useEffect(() => {
    if (!data) return;
    const theme = data.profile.theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : data.profile.theme;
    document.documentElement.dataset.theme = theme;
  }, [data?.profile.theme]);

  const profileUrl = useMemo(() => data ? `${typeof window === "undefined" ? "https://teamroute.sotomayorconsulting.com" : window.location.origin}/u/${data.profile.publicHandle}` : "", [data?.profile.publicHandle]);
  const change = <K extends keyof Profile>(key: K, value: Profile[K]) => setData((current) => current ? { ...current, profile: { ...current.profile, [key]: value } } : current);

  async function save() {
    if (!data) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/account/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data.profile) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible guardar.");
      setData((current) => current ? { ...current, profile: payload.profile } : current);
      setNotice("Cambios guardados en PostgreSQL.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar."); }
    finally { setSaving(false); }
  }

  async function setVisibility(agenda: Agenda, isVisible: boolean) {
    setData((current) => current ? { ...current, agendas: current.agendas.map((item) => item.id === agenda.id ? { ...item, isVisible } : item) } : current);
    try {
      const response = await fetch(`/api/account/profile/agendas/${agenda.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isVisible }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "No fue posible actualizar la visibilidad.");
      setNotice("Visibilidad de agenda actualizada.");
    } catch (cause) {
      setData((current) => current ? { ...current, agendas: current.agendas.map((item) => item.id === agenda.id ? { ...item, isVisible: agenda.isVisible } : item) } : current);
      setError(cause instanceof Error ? cause.message : "No fue posible actualizar la visibilidad.");
    }
  }

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name"));
    setMembers((current) => [...current, { name, email: String(form.get("email")), role: String(form.get("role")), status: "Invitación pendiente", calendar: false, initials: initials(name) }]); setInviteOpen(false);
  }

  return <div className="account-page">
    <header className="account-head"><div><p className="eyebrow">ORGANIZACIÓN</p><h2>Configuración de la cuenta</h2><span>Preferencias, conexiones y usuarios que forman parte del equipo.</span></div><button className="primary-button" onClick={save} disabled={!data || saving}>{saving ? "Guardando…" : "Guardar cambios"}</button></header>
    <nav className="account-tabs" aria-label="Configuración de cuenta"><button className={tab === "general" ? "active" : ""} onClick={() => setTab("general")}>General</button><button className={tab === "calendars" ? "active" : ""} onClick={() => setTab("calendars")}>Calendarios</button><button className={tab === "integrations" ? "active" : ""} onClick={() => setTab("integrations")}>Integraciones</button><button className={tab === "team" ? "active" : ""} onClick={() => setTab("team")}>Usuarios y equipo <span>{members.length}</span></button></nav>
    {notice && <p className="settings-feedback success">✓ {notice}</p>}{error && <p className="settings-feedback error">{error}</p>}
    {!data && !error && <section className="settings-section settings-loading">Cargando perfil y preferencias…</section>}
    {tab === "general" && data && <General data={data} profileUrl={profileUrl} onChange={change} onEdit={() => setProfileOpen(true)} onVisibility={setVisibility} />}
    {tab === "calendars" && <Calendars />}{tab === "integrations" && <Integrations />}{tab === "team" && <Team members={members} onInvite={() => setInviteOpen(true)} />}
    {profileOpen && data && <ProfileModal profile={data.profile} onChange={change} onClose={() => setProfileOpen(false)} onSave={async () => { await save(); setProfileOpen(false); }} />}
    {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={invite} />}
  </div>;
}

function General({ data, profileUrl, onChange, onEdit, onVisibility }: { data: AccountData; profileUrl: string; onChange: <K extends keyof Profile>(key: K, value: Profile[K]) => void; onEdit: () => void; onVisibility: (agenda: Agenda, visible: boolean) => void }) {
  const { profile } = data;
  return <section className="settings-section">
    <SectionTitle icon="▣" title="Información personal" detail="Estas preferencias controlan cómo cada usuario ve fechas y horarios." />
    <div className="profile-settings">{profile.avatarUrl ? <img className="avatar profile-avatar-image" src={profile.avatarUrl} alt="" /> : <span className="avatar profile-avatar">{initials(profile.fullName)}</span>}<div><strong>{profile.fullName}</strong><small>@{profile.publicHandle}</small></div><button onClick={onEdit}>✎ Editar perfil</button></div>
    <div className="settings-form">
      <Setting label="Idioma" hint="Idioma de la interfaz y correos del usuario."><select value={profile.language} onChange={(event) => onChange("language", event.target.value as Profile["language"])}><option value="es">Español</option><option value="en">English</option></select></Setting>
      <Setting label="Zona horaria" hint="Base para mostrar disponibilidad y reservas."><select value={profile.timezone} onChange={(event) => onChange("timezone", event.target.value)}><option value="America/Guayaquil">America/Guayaquil (UTC−5)</option><option value="America/Bogota">America/Bogota (UTC−5)</option><option value="America/New_York">America/New_York</option></select></Setting>
      <Setting label="Formato de hora" hint="Solo afecta la visualización."><select value={profile.timeFormat} onChange={(event) => onChange("timeFormat", event.target.value as Profile["timeFormat"])}><option value="24h">24 horas</option><option value="12h">12 horas (am/pm)</option></select></Setting>
      <Setting label="Formato de fecha" hint="Orden de día, mes y año."><select value={profile.dateFormat} onChange={(event) => onChange("dateFormat", event.target.value as Profile["dateFormat"])}><option>DD/MM/AAAA</option><option>MM/DD/AAAA</option><option>AAAA-MM-DD</option></select></Setting>
      <Setting label="Inicio de la semana" hint="Primer día en calendarios y reportes."><select value={profile.weekStartsOn} onChange={(event) => onChange("weekStartsOn", event.target.value as Profile["weekStartsOn"])}><option value="monday">Lunes</option><option value="sunday">Domingo</option></select></Setting>
    </div>
    <SectionTitle icon="◉" title="Apariencia" detail="Tema usado en el panel y en el perfil público de esta cuenta." />
    <div className="account-themes">{([ ["light", "Claro"], ["dark", "Oscuro"], ["system", "Sistema"] ] as const).map(([theme, label]) => <button key={theme} className={profile.theme === theme ? "active" : ""} onClick={() => onChange("theme", theme)}><b>{label}</b><span /><i style={{ background: profile.buttonColor }} /></button>)}</div>
    <section className="profile-public-settings"><SectionTitle icon="↗" title="Página pública del perfil" detail="Elige qué ve un cliente cuando visita tu perfil y qué agendas puede reservar." />
      <label className="profile-url-field"><span>Enlace público<small>Comparte este perfil en vez de una agenda individual.</small></span><div><input value={profileUrl} readOnly /><a href={profile.isPublic ? `/u/${profile.publicHandle}` : undefined} target="_blank" rel="noreferrer" aria-disabled={!profile.isPublic}>Vista previa ↗</a></div></label>
      <label className="switch-setting"><span>Perfil público<small>Permite que los clientes vean las agendas visibles de este perfil.</small></span><input type="checkbox" checked={profile.isPublic} onChange={(event) => onChange("isPublic", event.target.checked)} /></label>
      <label className="media-field"><span>Imagen o video de bienvenida<small>Usa una URL segura para mostrar una imagen o video de presentación.</small></span><div><select value={profile.storyMediaType} onChange={(event) => onChange("storyMediaType", event.target.value as Profile["storyMediaType"])}><option value="image">Imagen</option><option value="video">Video</option></select><input value={profile.storyMediaUrl ?? ""} placeholder="https://…" onChange={(event) => onChange("storyMediaUrl", event.target.value || null)} /></div></label>
      <div className="visibility-list"><strong>Agendas visibles</strong><small>Solo las agendas activas y visibles aparecerán en el perfil.</small>{data.agendas.map((agenda) => <label key={agenda.id}><input type="checkbox" checked={agenda.isVisible} disabled={!agenda.isActive} onChange={(event) => onVisibility(agenda, event.target.checked)} /><span><b>{agenda.title}</b><small>/book/{agenda.bookingSlug} · {agenda.durationMinutes} min</small></span><em>{agenda.isVisible ? "Visible" : "Oculta"}</em></label>)}</div>
    </section>
  </section>;
}

function ProfileModal({ profile, onChange, onClose, onSave }: { profile: Profile; onChange: <K extends keyof Profile>(key: K, value: Profile[K]) => void; onClose: () => void; onSave: () => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setSubmitting(true); await onSave(); setSubmitting(false); }
  return <div className="settings-modal" role="dialog" aria-modal="true"><form onSubmit={submit}><header><div><h3>Editar perfil público</h3><p>Estos datos identifican al usuario y definen su página pública.</p></div><button type="button" onClick={onClose}>×</button></header><label>Nombre completo<input value={profile.fullName} required maxLength={160} onChange={(event) => onChange("fullName", event.target.value)} /></label><label>Identificador público<input value={profile.publicHandle} required pattern="[A-Za-z0-9-]{3,80}" onChange={(event) => onChange("publicHandle", event.target.value.toLowerCase())} /><small>Se usa en el enlace /u/tu-identificador.</small></label><label>URL de avatar<input type="url" value={profile.avatarUrl ?? ""} placeholder="https://…" onChange={(event) => onChange("avatarUrl", event.target.value || null)} /></label><label>Mensaje de bienvenida<textarea value={profile.welcomeMessage} maxLength={500} onChange={(event) => onChange("welcomeMessage", event.target.value)} /></label><label>Color de acento<input type="color" value={profile.accentColor} onChange={(event) => onChange("accentColor", event.target.value)} /></label><label>Color de botones<input type="color" value={profile.buttonColor} onChange={(event) => onChange("buttonColor", event.target.value)} /></label><footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={submitting}>{submitting ? "Guardando…" : "Guardar perfil"}</button></footer></form></div>;
}

function Calendars() { return <section className="settings-section"><SectionTitle icon="↻" title="Sincronización" detail="La lectura evita conflictos; el calendario de escritura recibe las reuniones asignadas." /><div className="calendar-rules"><article><span>◉</span><div><h3>Calendarios de lectura</h3><p>TeamRoute consulta estos calendarios para bloquear horas ocupadas.</p><strong>servicios@sotomayorconsulting.com</strong><small>● Agenda Sebastián LLC</small></div><button>Editar</button></article><article><span>✎</span><div><h3>Calendario de escritura</h3><p>Las nuevas reuniones se crean únicamente en este calendario.</p><strong>servicios@sotomayorconsulting.com</strong><small>● Agenda Sebastián LLC</small></div><button>Editar</button></article></div><SectionTitle icon="⌁" title="Conexiones" detail="Una cuenta puede leer varios Google Calendar y elegir uno como destino." /><div className="connection-list"><Connection email="servicios@sotomayorconsulting.com" status="Conectado" /><Connection email="xbuenano@sotomayorconsulting.com" status="Conectado" /></div><button className="outline-action">＋ Añadir conexión de calendario</button></section>; }
function Integrations() { return <section className="settings-section"><SectionTitle icon="▣" title="Conferencias" detail="La integración predeterminada genera un enlace único para cada evento." /><div className="integration-list"><Integration icon="Z" name="Zoom" detail="Conectado a servicios@sotomayorconsulting.com" state="Predeterminado" color="#4f7cff" /><Integration icon="M" name="Google Meet" detail="Vinculado al calendario de escritura" state="Conectado" color="#18a05e" /><Integration icon="T" name="Microsoft Teams" detail="Requiere una cuenta Microsoft 365 Business" state="Conectar" color="#625bd5" /></div></section>; }
function Team({ members, onInvite }: { members: Member[]; onInvite: () => void }) { return <section className="settings-section team-settings"><div className="team-settings-head"><SectionTitle icon="◎" title="Usuarios de la organización" detail="Las cuentas activas pueden añadirse como agentes a las agendas Round Robin." /><button className="primary-button" onClick={onInvite}>＋ Invitar usuario</button></div><div className="role-summary"><span><b>1</b>Propietario</span><span><b>0</b>Administradores</span><span><b>{members.filter((member) => member.role === "Agente").length}</b>Agentes</span><span><b>{members.filter((member) => member.status.includes("pendiente")).length}</b>Pendientes</span></div><div className="member-table"><div className="member-table-head"><span>USUARIO</span><span>ROL</span><span>CALENDARIO</span><span>ESTADO</span><span /></div>{members.map((member, index) => <div className="member-record" key={member.email}><span className="avatar" style={{ background: ["#292141", "#7c3aed", "#0f766e", "#c2410c"][index % 4] }}>{member.initials}</span><div><strong>{member.name}</strong><small>{member.email}</small></div><span>{member.role}</span><span className={member.calendar ? "connected-state" : "pending-state"}>{member.calendar ? "G Conectado" : "Sin conectar"}</span><span className={member.status === "Activo" ? "active-state" : "pending-state"}>● {member.status}</span><button>•••</button></div>)}</div></section>; }
function InviteModal({ onClose, onInvite }: { onClose: () => void; onInvite: (event: FormEvent<HTMLFormElement>) => void }) { return <div className="settings-modal" role="dialog" aria-modal="true"><form onSubmit={onInvite}><header><div><h3>Invitar usuario al equipo</h3><p>La cuenta podrá conectarse y participar en agendas Round Robin.</p></div><button type="button" onClick={onClose}>×</button></header><label>Nombre completo<input name="name" required placeholder="Nombre y apellido" /></label><label>Correo de trabajo<input name="email" type="email" required placeholder="nombre@empresa.com" /></label><label>Rol<select name="role"><option>Agente</option><option>Administrador</option><option>Observador</option></select></label><footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">Enviar invitación</button></footer></form></div>; }
function Setting({ label, hint, children }: { label: string; hint: string; children: ReactNode }) { return <label className="account-setting"><span>{label}<small>{hint}</small></span>{children}</label>; }
function SectionTitle({ icon, title, detail }: { icon: string; title: string; detail: string }) { return <header className="settings-title"><span>{icon}</span><div><h3>{title}</h3><p>{detail}</p></div></header>; }
function Connection({ email, status }: { email: string; status: string }) { return <article><span className="calendar-logo">31</span><div><strong>Google Calendar</strong><small>{email}</small></div><b><i />{status}</b><button>•••</button></article>; }
function Integration({ icon, name, detail, state, color }: { icon: string; name: string; detail: string; state: string; color: string }) { return <article><span style={{ background: color }}>{icon}</span><div><strong>{name}</strong><small>{detail}</small></div>{state === "Predeterminado" || state === "Conectado" ? <b>{state}</b> : <button>{state}</button>}</article>; }
