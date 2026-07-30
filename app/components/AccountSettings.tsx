"use client";

import { FormEvent, useState } from "react";

type Tab = "general" | "calendars" | "integrations" | "team";
type Member = { name: string; email: string; role: string; status: string; calendar: boolean; initials: string };

const initialMembers: Member[] = [
  { name: "Xavier Soto", email: "xbuenano@sotomayorconsulting.com", role: "Propietario", status: "Activo", calendar: true, initials: "XS" },
  { name: "Ana Torres", email: "ana@sotomayorconsulting.com", role: "Agente", status: "Activo", calendar: true, initials: "AT" },
  { name: "Carlos Mendoza", email: "carlos@sotomayorconsulting.com", role: "Agente", status: "Activo", calendar: true, initials: "CM" },
  { name: "María Paz", email: "maria@sotomayorconsulting.com", role: "Agente", status: "Invitación pendiente", calendar: false, initials: "MP" },
];

export function AccountSettings() {
  const [tab, setTab] = useState<Tab>("general");
  const [members, setMembers] = useState(initialMembers);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 1500); };

  function invite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name"));
    setMembers([...members, { name, email: String(data.get("email")), role: String(data.get("role")), status: "Invitación pendiente", calendar: false, initials: name.split(" ").map(v => v[0]).join("").slice(0,2).toUpperCase() }]);
    setInviteOpen(false);
  }

  return <div className="account-page">
    <header className="account-head"><div><p className="eyebrow">ORGANIZACIÓN</p><h2>Configuración de la cuenta</h2><span>Preferencias, conexiones y usuarios que forman parte del equipo.</span></div><button className="primary-button" onClick={save}>{saved ? "✓ Guardado" : "Guardar cambios"}</button></header>
    <nav className="account-tabs" aria-label="Configuración de cuenta">
      <button className={tab === "general" ? "active" : ""} onClick={() => setTab("general")}>General</button>
      <button className={tab === "calendars" ? "active" : ""} onClick={() => setTab("calendars")}>Calendarios</button>
      <button className={tab === "integrations" ? "active" : ""} onClick={() => setTab("integrations")}>Integraciones</button>
      <button className={tab === "team" ? "active" : ""} onClick={() => setTab("team")}>Usuarios y equipo <span>{members.length}</span></button>
    </nav>
    {tab === "general" && <General />}
    {tab === "calendars" && <Calendars />}
    {tab === "integrations" && <Integrations />}
    {tab === "team" && <Team members={members} onInvite={() => setInviteOpen(true)} />}
    {inviteOpen && <div className="settings-modal" role="dialog" aria-modal="true"><form onSubmit={invite}><header><div><h3>Invitar usuario al equipo</h3><p>La cuenta podrá conectarse y participar en agendas Round Robin.</p></div><button type="button" onClick={() => setInviteOpen(false)}>×</button></header><label>Nombre completo<input name="name" required placeholder="Nombre y apellido" /></label><label>Correo de trabajo<input name="email" type="email" required placeholder="nombre@empresa.com" /></label><label>Rol<select name="role"><option>Agente</option><option>Administrador</option><option>Observador</option></select></label><div className="invite-flow"><span>1</span><p>Recibe invitación</p><i>→</i><span>2</span><p>Conecta Google</p><i>→</i><span>3</span><p>Entra en rotaciones</p></div><footer><button type="button" className="secondary-button" onClick={() => setInviteOpen(false)}>Cancelar</button><button className="primary-button">Enviar invitación</button></footer></form></div>}
  </div>;
}

function General() {
  return <section className="settings-section">
    <SectionTitle icon="▣" title="Información personal" detail="Estas preferencias controlan cómo cada usuario ve fechas y horarios." />
    <div className="profile-settings"><span className="avatar profile-avatar">XS</span><div><strong>Xavier Soto</strong><small>@xaviersoto</small></div><button>✎ Editar perfil</button></div>
    <div className="settings-form">
      <Setting label="Idioma" hint="Idioma de la interfaz y correos del usuario."><select defaultValue="es"><option value="es">Español</option><option value="en">English</option></select></Setting>
      <Setting label="Zona horaria" hint="Base para mostrar disponibilidad y reservas."><select><option>America/Guayaquil (UTC−5)</option><option>America/Bogota</option><option>America/New_York</option></select></Setting>
      <Setting label="Formato de hora" hint="Solo afecta la visualización."><select><option>24 horas</option><option>12 horas (am/pm)</option></select></Setting>
      <Setting label="Formato de fecha" hint="Orden de día, mes y año."><select><option>DD/MM/AAAA</option><option>MM/DD/AAAA</option><option>AAAA-MM-DD</option></select></Setting>
      <Setting label="Inicio de la semana" hint="Primer día en calendarios y reportes."><select><option>Lunes</option><option>Domingo</option></select></Setting>
    </div>
    <SectionTitle icon="◉" title="Apariencia" detail="Tema usado en el panel de esta cuenta." />
    <div className="account-themes"><button className="active"><b>Claro</b><span /><i /></button><button><b>Oscuro</b><span /><i /></button><button><b>Sistema</b><span /><i /></button></div>
  </section>;
}

function Calendars() {
  return <section className="settings-section">
    <SectionTitle icon="↻" title="Sincronización" detail="La lectura evita conflictos; el calendario de escritura recibe las reuniones asignadas." />
    <div className="calendar-rules">
      <article><span>◉</span><div><h3>Calendarios de lectura</h3><p>TeamRoute consulta estos calendarios para bloquear horas ocupadas.</p><strong>servicios@sotomayorconsulting.com</strong><small>● Agenda Sebastián LLC</small></div><button>Editar</button></article>
      <article><span>✎</span><div><h3>Calendario de escritura</h3><p>Las nuevas reuniones se crean únicamente en este calendario.</p><strong>servicios@sotomayorconsulting.com</strong><small>● Agenda Sebastián LLC</small></div><button>Editar</button></article>
    </div>
    <SectionTitle icon="⌁" title="Conexiones" detail="Una cuenta puede leer varios Google Calendar y elegir uno como destino." />
    <div className="connection-list"><Connection email="servicios@sotomayorconsulting.com" status="Conectado" /><Connection email="xbuenano@sotomayorconsulting.com" status="Conectado" /></div>
    <button className="outline-action">＋ Añadir conexión de calendario</button>
  </section>;
}

function Integrations() {
  return <section className="settings-section">
    <SectionTitle icon="▣" title="Conferencias" detail="La integración predeterminada genera un enlace único para cada evento." />
    <div className="integration-list"><Integration icon="Z" name="Zoom" detail="Conectado a servicios@sotomayorconsulting.com" state="Predeterminado" color="#4f7cff" /><Integration icon="M" name="Google Meet" detail="Vinculado al calendario de escritura" state="Conectado" color="#18a05e" /><Integration icon="T" name="Microsoft Teams" detail="Requiere una cuenta Microsoft 365 Business" state="Conectar" color="#625bd5" /></div>
    <SectionTitle icon="⌘" title="Automatización" detail="Envía reservas a otras aplicaciones y procesos." />
    <div className="integration-list"><Integration icon="✦" name="Zapier" detail="Conecta TeamRoute con miles de aplicaciones" state="Conectar" color="#ff5a16" /><Integration icon="⌘" name="Webhooks" detail="2 endpoints reciben eventos de reserva" state="Administrar" color="#1677e8" /></div>
    <SectionTitle icon="$" title="Pagos" detail="Cobra antes de confirmar una reserva cuando una agenda lo requiera." />
    <div className="integration-list"><Integration icon="S" name="Stripe" detail="Sin conexión" state="Conectar" color="#635bdf" /></div>
  </section>;
}

function Team({ members, onInvite }: { members: Member[]; onInvite: () => void }) {
  return <section className="settings-section team-settings">
    <div className="team-settings-head"><SectionTitle icon="◎" title="Usuarios de la organización" detail="Las cuentas activas pueden ser añadidas como agentes a las agendas Round Robin." /><button className="primary-button" onClick={onInvite}>＋ Invitar usuario</button></div>
    <div className="role-summary"><span><b>1</b>Propietario</span><span><b>0</b>Administradores</span><span><b>{members.filter(m => m.role === "Agente").length}</b>Agentes</span><span><b>{members.filter(m => m.status.includes("pendiente")).length}</b>Pendientes</span></div>
    <div className="member-table"><div className="member-table-head"><span>USUARIO</span><span>ROL</span><span>CALENDARIO</span><span>ESTADO</span><span /></div>{members.map((member, index) => <div className="member-record" key={`${member.email}-${index}`}><span className="avatar" style={{ background: ["#292141","#7c3aed","#0f766e","#c2410c"][index % 4] }}>{member.initials}</span><div><strong>{member.name}</strong><small>{member.email}</small></div><select defaultValue={member.role} disabled={member.role === "Propietario"}><option>Propietario</option><option>Administrador</option><option>Agente</option><option>Observador</option></select><span className={member.calendar ? "connected-state" : "pending-state"}>{member.calendar ? "G Conectado" : "Sin conectar"}</span><span className={member.status === "Activo" ? "active-state" : "pending-state"}>● {member.status}</span><button>•••</button></div>)}</div>
    <aside className="team-logic-note"><span>⇄</span><div><strong>Relación con Round Robin</strong><p>Invitar una cuenta no la incluye automáticamente en todas las agendas. Cuando acepte y conecte Google Calendar, podrá seleccionarse como anfitrión y recibir una prioridad diferente en cada agenda.</p></div></aside>
  </section>;
}

function Setting({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) { return <label className="account-setting"><span>{label}<small>{hint}</small></span>{children}</label>; }
function SectionTitle({ icon, title, detail }: { icon: string; title: string; detail: string }) { return <header className="settings-title"><span>{icon}</span><div><h3>{title}</h3><p>{detail}</p></div></header>; }
function Connection({ email, status }: { email: string; status: string }) { return <article><span className="calendar-logo">31</span><div><strong>Google Calendar</strong><small>{email}</small></div><b><i />{status}</b><button>•••</button></article>; }
function Integration({ icon, name, detail, state, color }: { icon: string; name: string; detail: string; state: string; color: string }) { return <article><span style={{ background: color }}>{icon}</span><div><strong>{name}</strong><small>{detail}</small></div>{state === "Predeterminado" || state === "Conectado" ? <b>{state}</b> : <button>{state}</button>}</article>; }
