"use client";

import { FormEvent, useState } from "react";

const weekDays = ["D", "L", "M", "M", "J", "V", "S"];
const monthDays = Array.from({ length: 35 }, (_, index) => {
  const day = index - 5;
  return day > 0 && day <= 31 ? day : null;
});
const availableDates = [3, 4, 5, 6, 7, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 24, 25, 26, 27, 28, 31];
const slots = ["09:00 am", "10:00 am", "11:00 am", "12:00 pm", "02:00 pm", "03:30 pm", "04:00 pm"];

type Phase = "date" | "contact" | "confirmed";

export function BookingFlow({ embedded = false, onBack }: { embedded?: boolean; onBack?: () => void }) {
  const [date, setDate] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("date");
  const [submittedName, setSubmittedName] = useState("");

  function chooseTime(slot: string) {
    setTime(slot);
    setPhase("contact");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmittedName(String(data.get("name") || ""));
    setPhase("confirmed");
  }

  if (phase === "confirmed") {
    return (
      <div className={embedded ? "booking-page" : "booking-page standalone"}>
        {onBack && <button className="back-link" onClick={onBack}>← Volver al panel</button>}
        <section className="booking-confirmed">
          <span className="success-mark">✓</span>
          <p className="phase-kicker">RESERVA CONFIRMADA</p>
          <h1>¡Listo, {submittedName || "tu reunión está agendada"}!</h1>
          <p>Enviamos la invitación y el enlace único de Google Meet a tu correo.</p>
          <div className="confirmation-details">
            <span><small>FECHA</small><b>Viernes, {date} de agosto de 2026</b></span>
            <span><small>HORA</small><b>{time} · America/Guayaquil</b></span>
            <span><small>DURACIÓN</small><b>30 minutos</b></span>
          </div>
          <button className="booking-primary" onClick={() => { setDate(null); setTime(null); setPhase("date"); }}>Agendar otra reunión</button>
        </section>
      </div>
    );
  }

  return (
    <div className={embedded ? "booking-page" : "booking-page standalone"}>
      {onBack && <button className="back-link" onClick={onBack}>← Volver al panel</button>}
      <header className="public-booking-header">
        <div className="booking-brand"><span className="brand-mark"><i /><i /><i /></span><b>TeamRoute</b></div>
        <span>Agenda segura · America/Guayaquil</span>
      </header>

      <section className={`booking-flow ${phase === "contact" ? "contact-phase" : ""}`}>
        <BookingSummary date={date} time={time} />

        {phase === "date" ? (
          <>
            <div className="calendar-stage">
              <div className="phase-heading"><span>1</span><div><small>PRIMER PASO</small><h2>Selecciona una fecha</h2></div></div>
              <div className="calendar-month">
                <button aria-label="Mes anterior">‹</button>
                <strong>Agosto 2026</strong>
                <button aria-label="Mes siguiente">›</button>
              </div>
              <div className="calendar-grid" role="grid" aria-label="Agosto 2026">
                {weekDays.map((day, index) => <span className="weekday" key={`${day}-${index}`}>{day}</span>)}
                {monthDays.map((day, index) => day ? (
                  <button
                    key={day}
                    disabled={!availableDates.includes(day)}
                    className={date === day ? "selected" : ""}
                    onClick={() => setDate(day)}
                    aria-label={`${day} de agosto`}
                  >{day}</button>
                ) : <span key={`blank-${index}`} />)}
              </div>
              <footer className="timezone-row"><span>◉</span><strong>America/Guayaquil</strong><small>Hora local</small><button>24h⌄</button></footer>
            </div>

            <aside className={`time-stage ${date ? "visible" : ""}`} aria-live="polite">
              {date ? (
                <>
                  <div className="phase-heading compact"><span>2</span><div><small>SEGUNDO PASO</small><h2>Elige una hora</h2></div></div>
                  <p className="selected-date">Viernes, {date} de agosto</p>
                  <div className="time-list">
                    {slots.map((slot, index) => (
                      <button key={slot} onClick={() => chooseTime(slot)}>
                        {slot}
                        {index === 2 && <small>MEDIODÍA</small>}
                      </button>
                    ))}
                  </div>
                  <p className="time-note">Los horarios se muestran en tu zona horaria.</p>
                </>
              ) : (
                <div className="time-placeholder">
                  <span>◷</span><h3>Horarios disponibles</h3><p>Selecciona una fecha para consultar la disponibilidad del equipo.</p>
                </div>
              )}
            </aside>
          </>
        ) : (
          <form className="contact-stage" onSubmit={submit}>
            <div className="phase-heading"><span>3</span><div><small>TERCER PASO</small><h2>Completa tus datos</h2></div></div>
            <p className="form-intro">Usaremos esta información únicamente para coordinar tu reunión.</p>
            <div className="form-grid">
              <label className="full">Nombre completo <b>*</b><input name="name" required placeholder="Tu nombre y apellido" autoComplete="name" /></label>
              <label className="full">Correo electrónico <b>*</b><input name="email" type="email" required placeholder="nombre@empresa.com" autoComplete="email" /></label>
              <label className="full">Teléfono (WhatsApp) <b>*</b><div className="phone-field"><span>🇪🇨 +593</span><input name="phone" type="tel" required placeholder="99 999 9999" autoComplete="tel" /></div></label>
              <label className="full">Rango aproximado de facturación <b>*</b>
                <select name="revenue" required defaultValue=""><option value="" disabled>Seleccionar...</option><option>Menos de $5.000 / mes</option><option>$5.000 – $20.000 / mes</option><option>$20.000 – $50.000 / mes</option><option>Más de $50.000 / mes</option></select>
              </label>
              <label className="full">¿Qué tema principal te gustaría conversar? <b>*</b><textarea name="topic" required rows={4} placeholder="Cuéntanos brevemente cómo podemos ayudarte" /></label>
            </div>
            <button type="button" className="guest-button">＋ Añadir invitados</button>
            <div className="form-actions">
              <button type="button" className="booking-secondary" onClick={() => setPhase("date")}>← Cambiar horario</button>
              <button className="booking-primary" type="submit">Programar reunión →</button>
            </div>
          </form>
        )}
      </section>
      <p className="booking-footer">Agenda creada con TeamRoute · Intelligent meeting routing</p>
    </div>
  );
}

function BookingSummary({ date, time }: { date: number | null; time: string | null }) {
  return (
    <aside className="booking-summary light">
      <span className="company-logo">SC</span>
      <p className="summary-org">EQUIPO SOTOMAYOR CONSULTING</p>
      <h1>Sesión Estratégica: Tu Empresa en EE. UU.</h1>
      <p>El respaldo que necesitas para crecer con seguridad.</p>
      <ul>
        <li><span>◷</span> 30 minutos</li>
        <li><span className="meet-dot">●</span> Google Meet</li>
        {date && time && <li className="chosen-slot"><span>▣</span> Vie. {date} ago, {time} −05</li>}
      </ul>
      <div className="round-robin-note"><span className="avatar" style={{ background: "#7c3aed" }}>AT</span><div><strong>Asignación inteligente</strong><small>El especialista disponible será asignado al confirmar.</small></div></div>
    </aside>
  );
}
