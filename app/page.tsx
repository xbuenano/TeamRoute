"use client";

import { useMemo, useState } from "react";

type View = "overview" | "bookings" | "agents" | "services" | "public";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "overview", label: "Resumen", icon: "⌂" },
  { id: "bookings", label: "Reservas", icon: "▣" },
  { id: "agents", label: "Agentes", icon: "◎" },
  { id: "services", label: "Tipos de reunión", icon: "◇" },
];

const agents = [
  { name: "Ana Torres", initials: "AT", role: "Consultora senior", status: "Disponible", meetings: 12, color: "#7c3aed" },
  { name: "Carlos Mendoza", initials: "CM", role: "Consultor", status: "En reunión", meetings: 9, color: "#0f766e" },
  { name: "María Paz", initials: "MP", role: "Especialista fiscal", status: "Disponible", meetings: 8, color: "#c2410c" },
  { name: "Diego Lara", initials: "DL", role: "Consultor", status: "Desconectado", meetings: 5, color: "#475569" },
];

const meetings = [
  { time: "09:00", title: "Consulta inicial LLC", client: "Sofía Andrade", agent: "Ana Torres", tone: "violet" },
  { time: "10:30", title: "Asesoría tributaria", client: "Daniel Romero", agent: "Carlos Mendoza", tone: "teal" },
  { time: "13:00", title: "Apertura bancaria", client: "Lucía Reyes", agent: "María Paz", tone: "orange" },
  { time: "15:30", title: "Consulta inicial LLC", client: "Andrés Vega", agent: "Ana Torres", tone: "violet" },
];

const days = [
  { day: "LUN", date: "3" }, { day: "MAR", date: "4" }, { day: "MIÉ", date: "5" },
  { day: "JUE", date: "6" }, { day: "VIE", date: "7" },
];

const slots = ["09:00", "09:30", "10:30", "11:00", "13:30", "14:00", "15:30", "16:00"];

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [selectedDay, setSelectedDay] = useState(2);
  const [selectedSlot, setSelectedSlot] = useState("10:30");
  const [confirmed, setConfirmed] = useState(false);
  const title = useMemo(() => navItems.find((item) => item.id === view)?.label ?? "Reserva pública", [view]);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => setView("overview")} aria-label="Ir al resumen">
          <span className="brand-mark"><i /><i /><i /></span>
          <span>TeamRoute</span>
        </button>

        <nav aria-label="Navegación principal">
          <p className="nav-label">ESPACIO DE TRABAJO</p>
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "nav-item active" : "nav-item"} onClick={() => setView(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
              {item.id === "bookings" && <span className="nav-count">24</span>}
            </button>
          ))}
          <p className="nav-label second">CONFIGURACIÓN</p>
          <button className="nav-item"><span className="nav-icon">◷</span>Disponibilidad</button>
          <button className="nav-item"><span className="nav-icon">⇄</span>Reglas de rotación</button>
          <button className="nav-item"><span className="nav-icon">⚙</span>Configuración</button>
        </nav>

        <div className="sidebar-footer">
          <div className="sync-card">
            <span className="sync-icon">G</span>
            <div><strong>Google Calendar</strong><small><i /> 3 de 4 conectados</small></div>
          </div>
          <div className="profile">
            <span className="avatar avatar-dark">XS</span>
            <div><strong>Xavier Soto</strong><small>Administrador</small></div>
            <span className="more">•••</span>
          </div>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">SOTO CONSULTING</p>
            <h1>{title}</h1>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="Notificaciones">♢<span className="notification-dot" /></button>
            <button className="secondary-button" onClick={() => setView("public")}>↗ Ver página pública</button>
            <button className="primary-button" onClick={() => setView("services")}>＋ Crear tipo de reunión</button>
          </div>
        </header>

        {view === "overview" && <Overview onPublic={() => setView("public")} />}
        {view === "bookings" && <Bookings />}
        {view === "agents" && <Agents />}
        {view === "services" && <Services onPublic={() => setView("public")} />}
        {view === "public" && (
          <PublicBooking
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            confirmed={confirmed}
            onConfirm={() => setConfirmed(true)}
            onBack={() => { setView("overview"); setConfirmed(false); }}
          />
        )}
      </section>
    </main>
  );
}

function Overview({ onPublic }: { onPublic: () => void }) {
  return (
    <div className="content">
      <section className="welcome">
        <div><h2>Buenos días, Xavier.</h2><p>Así está funcionando tu equipo hoy.</p></div>
        <div className="date-chip">◷ Jueves, 30 de julio</div>
      </section>

      <section className="metrics-grid">
        <Metric label="REUNIONES HOY" value="8" trend="+14%" note="vs. jueves anterior" icon="▣" />
        <Metric label="ESTA SEMANA" value="24" trend="+8%" note="vs. semana anterior" icon="↗" />
        <Metric label="TASA DE OCUPACIÓN" value="76%" trend="+4%" note="promedio del equipo" icon="◎" />
        <Metric label="AGENTES ACTIVOS" value="3/4" note="1 necesita reconectar" icon="◉" warning />
      </section>

      <section className="dashboard-grid">
        <article className="panel schedule-panel">
          <div className="panel-head"><div><h3>Agenda de hoy</h3><p>8 reuniones · 3 agentes</p></div><button className="text-button">Ver todas →</button></div>
          <div className="meeting-list">
            {meetings.map((meeting) => (
              <div className="meeting-row" key={meeting.time}>
                <time>{meeting.time}</time>
                <span className={`meeting-line ${meeting.tone}`} />
                <div className="meeting-info"><strong>{meeting.title}</strong><small>{meeting.client}</small></div>
                <span className="agent-pill"><span>{meeting.agent.split(" ").map((n) => n[0]).join("")}</span>{meeting.agent}</span>
                <span className="meet-pill">Meet</span>
                <button className="row-more" aria-label={`Opciones para ${meeting.title}`}>•••</button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel team-panel">
          <div className="panel-head"><div><h3>Disponibilidad del equipo</h3><p>Estado en tiempo real</p></div><button className="row-more">•••</button></div>
          <div className="team-list">
            {agents.map((agent) => (
              <div className="team-row" key={agent.name}>
                <span className="avatar" style={{ background: agent.color }}>{agent.initials}</span>
                <div><strong>{agent.name}</strong><small>{agent.role}</small></div>
                <span className={`status ${agent.status.toLowerCase().replace(" ", "-")}`}><i />{agent.status}</span>
              </div>
            ))}
          </div>
          <button className="full-button">Gestionar agentes</button>
        </article>
      </section>

      <section className="bottom-grid">
        <article className="panel rotation-panel">
          <div className="panel-head"><div><h3>Distribución de asignaciones</h3><p>Últimos 30 días</p></div><span className="select-chip">Todos los servicios⌄</span></div>
          <div className="bars">
            {agents.slice(0, 3).map((agent, index) => (
              <div className="bar-row" key={agent.name}>
                <span className="avatar mini" style={{ background: agent.color }}>{agent.initials}</span>
                <strong>{agent.name}</strong>
                <div className="bar-track"><i style={{ width: `${[88, 72, 64][index]}%`, background: agent.color }} /></div>
                <b>{[34, 28, 25][index]}</b>
              </div>
            ))}
          </div>
          <p className="fairness"><span>✓</span> La rotación está equilibrada <small>Desviación menor al 12%</small></p>
        </article>
        <article className="public-card">
          <span className="route-art"><i /><i /><i /><b>✓</b></span>
          <div><span className="live-badge"><i /> PUBLICADA</span><h3>Consulta inicial LLC</h3><p>30 min · Google Meet</p><button onClick={onPublic}>Abrir página de reserva ↗</button></div>
        </article>
      </section>
    </div>
  );
}

function Metric({ label, value, trend, note, icon, warning = false }: { label: string; value: string; trend?: string; note: string; icon: string; warning?: boolean }) {
  return (
    <article className="metric-card">
      <div><p>{label}</p><strong>{value}</strong></div><span className="metric-icon">{icon}</span>
      <footer>{trend && <b>{trend}</b>}<span className={warning ? "warning-note" : ""}>{warning && "● "}{note}</span></footer>
    </article>
  );
}

function Bookings() {
  return <div className="content"><section className="section-intro"><div><h2>Próximas reservas</h2><p>Todas las reuniones asignadas por TeamRoute.</p></div><button className="primary-button">＋ Reserva manual</button></section><article className="panel data-panel">{[...meetings, ...meetings.slice(0, 2)].map((m, i) => <div className="booking-row" key={i}><span className="calendar-day"><b>{30 + (i > 3 ? 1 : 0)}</b><small>JUL</small></span><div className="booking-main"><strong>{m.title}</strong><small>{m.client} · {m.time} · 30 min</small></div><span className="agent-pill"><span>{m.agent.split(" ").map(n => n[0]).join("")}</span>{m.agent}</span><span className="confirmed">Confirmada</span><button className="row-more">•••</button></div>)}</article></div>;
}

function Agents() {
  return <div className="content"><section className="section-intro"><div><h2>Tu equipo</h2><p>Gestiona quién participa en las rotaciones.</p></div><button className="primary-button">＋ Invitar agente</button></section><section className="agent-cards">{agents.map(a => <article className="panel agent-card" key={a.name}><div className="agent-card-head"><span className="avatar large" style={{ background: a.color }}>{a.initials}</span><button className="row-more">•••</button></div><h3>{a.name}</h3><p>{a.role}</p><span className={`status ${a.status.toLowerCase().replace(" ", "-")}`}><i />{a.status}</span><div className="agent-stats"><span><b>{a.meetings}</b><small>Esta semana</small></span><span><b>{a.name === "Diego Lara" ? "0" : "2"}</b><small>Rotaciones</small></span></div><footer><span className={a.name === "Diego Lara" ? "calendar-off" : "calendar-on"}>G</span>{a.name === "Diego Lara" ? "Reconectar calendario" : "Calendar conectado"}</footer></article>)}</section></div>;
}

function Services({ onPublic }: { onPublic: () => void }) {
  const services = [{ name: "Consulta inicial LLC", duration: "30 min", agents: 3, color: "violet" }, { name: "Asesoría tributaria", duration: "45 min", agents: 2, color: "teal" }, { name: "Apertura bancaria", duration: "30 min", agents: 3, color: "orange" }];
  return <div className="content"><section className="section-intro"><div><h2>Tipos de reunión</h2><p>Servicios disponibles para reserva pública.</p></div><button className="primary-button">＋ Crear tipo de reunión</button></section><section className="service-list">{services.map((s, i) => <article className="panel service-row" key={s.name}><span className={`service-symbol ${s.color}`}>◇</span><div><span className="live-badge"><i /> PUBLICADA</span><h3>{s.name}</h3><p>{s.duration} · Google Meet · {s.agents} agentes</p></div><div className="service-actions"><button onClick={onPublic}>Abrir página ↗</button><button className="row-more">•••</button></div></article>)}</section></div>;
}

function PublicBooking({ selectedDay, setSelectedDay, selectedSlot, setSelectedSlot, confirmed, onConfirm, onBack }: { selectedDay: number; setSelectedDay: (n: number) => void; selectedSlot: string; setSelectedSlot: (s: string) => void; confirmed: boolean; onConfirm: () => void; onBack: () => void }) {
  if (confirmed) return <div className="booking-page"><button className="back-link" onClick={onBack}>← Volver al panel</button><div className="confirmation-card"><span className="success-mark">✓</span><p className="eyebrow">RESERVA CONFIRMADA</p><h2>Tu reunión está agendada</h2><p>Te enviamos la invitación y el enlace único de Google Meet.</p><div className="confirmation-details"><span><small>FECHA</small><b>Miércoles, 5 de agosto</b></span><span><small>HORA</small><b>{selectedSlot} · America/Guayaquil</b></span><span><small>ASIGNADA A</small><b>Ana Torres</b></span></div><button className="primary-button" onClick={onBack}>Listo, volver al panel</button></div></div>;
  return <div className="booking-page"><button className="back-link" onClick={onBack}>← Volver al panel</button><div className="booking-brand"><span className="brand-mark"><i /><i /><i /></span><b>TeamRoute</b></div><section className="booking-card"><aside className="booking-summary"><span className="company-mark">SC</span><p className="eyebrow">SOTO CONSULTING</p><h2>Consulta inicial LLC</h2><p>Conoce cómo crear y operar tu empresa en Estados Unidos con una asesoría personalizada.</p><ul><li>◷ 30 minutos</li><li>▣ Google Meet</li><li>◎ Zona horaria local</li></ul><div className="host-stack"><span className="avatar" style={{ background: "#7c3aed" }}>AT</span><span className="avatar" style={{ background: "#0f766e" }}>CM</span><span className="avatar" style={{ background: "#c2410c" }}>MP</span><p>Uno de nuestros especialistas te atenderá.</p></div></aside><div className="calendar-picker"><p className="step-label">1 DE 2 · ELIGE UN HORARIO</p><div className="month-head"><button aria-label="Mes anterior">‹</button><h3>Agosto 2026</h3><button aria-label="Mes siguiente">›</button></div><div className="day-strip">{days.map((d, i) => <button key={d.day} onClick={() => setSelectedDay(i)} className={selectedDay === i ? "selected" : ""}><small>{d.day}</small><b>{d.date}</b></button>)}</div><p className="available-label">Horarios disponibles</p><div className="slots">{slots.map(slot => <button className={selectedSlot === slot ? "selected" : ""} onClick={() => setSelectedSlot(slot)} key={slot}>{slot}</button>)}</div><div className="booking-submit"><div><small>TU SELECCIÓN</small><strong>Mié. {days[selectedDay].date} ago · {selectedSlot}</strong></div><button className="primary-button" onClick={onConfirm}>Confirmar horario →</button></div></div></section><p className="booking-footer">Agenda protegida por TeamRoute · Intelligent meeting routing</p></div>;
}
