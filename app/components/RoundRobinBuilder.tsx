"use client";

import { useState } from "react";

const tabs = [
  ["basic", "Información básica", "Identidad, duración y enlace"],
  ["team", "Equipo y rotación", "Anfitriones y prioridades"],
  ["availability", "Disponibilidad", "Horarios, buffers y límites"],
  ["form", "Formulario", "Preguntas para el cliente"],
  ["notifications", "Notificaciones", "Correos, SMS y seguimiento"],
  ["advanced", "Reglas avanzadas", "Invitados, redirección y pagos"],
] as const;

const audit: Record<string, string> = {
  basic: "Define lo que verá el cliente y el evento que recibirá el agente asignado. La URL separa esta agenda del resto del sistema.",
  team: "Determina quién participa. Primero se filtra por disponibilidad y prioridad; después se asigna al agente menos recientemente reservado.",
  availability: "Los slots resultan de cruzar horario laboral, excepciones, calendarios ocupados, buffers, aviso mínimo y capacidad.",
  form: "Recopila la información necesaria antes de confirmar. Las respuestas acompañan la reserva y preparan al agente.",
  notifications: "Automatiza confirmaciones, recordatorios y seguimiento sin alterar la asignación Round Robin.",
  advanced: "Aplica políticas a asistentes y define qué ocurre después de confirmar, cancelar o reprogramar.",
};

export function RoundRobinBuilder({ onClose, onPreview }: { onClose: () => void; onPreview: () => void }) {
  const [tab, setTab] = useState("basic");
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved(true); window.setTimeout(() => setSaved(false), 1600); };
  return <div className="builder-shell">
    <header className="builder-top"><button className="back-link" onClick={onClose}>← Agendas Round Robin</button><span><i />Configurando una agenda de equipo</span><div><button className="secondary-button" onClick={onPreview}>Vista previa ↗</button><button className="primary-button" onClick={save}>{saved ? "✓ Guardado" : "Guardar cambios"}</button></div></header>
    <div className="builder-layout">
      <nav className="builder-nav"><p>CONSTRUCTOR DE AGENDA</p>{tabs.map(([id, title, subtitle], i) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><span>{i + 1}</span><div><strong>{title}</strong><small>{subtitle}</small></div></button>)}<div className="builder-progress"><strong>Configuración completa <b>92%</b></strong><i><span /></i><small>Falta verificar un calendario.</small></div></nav>
      <main className="builder-content">
        {tab === "basic" && <Basic />}
        {tab === "team" && <Team />}
        {tab === "availability" && <Availability />}
        {tab === "form" && <ClientForm />}
        {tab === "notifications" && <Notifications />}
        {tab === "advanced" && <Advanced />}
        <footer><button className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" onClick={save}>{saved ? "✓ Cambios guardados" : "Guardar cambios"}</button></footer>
      </main>
      <aside className="builder-audit"><span>◎</span><h3>Utilidad en la agenda</h3><p>{audit[tab]}</p><div><small>MOTOR ROUND ROBIN</small><strong>Disponible</strong><i>↓</i><strong>Mayor prioridad</strong><i>↓</i><strong>Menos reciente</strong><b>1 agente asignado</b></div></aside>
    </div>
  </div>;
}

function Basic() {
  return <Section title="Información básica" subtitle="Identidad y presentación de la agenda pública.">
    <Field label="Nombre" hint="Se muestra en la agenda, invitaciones y reportes."><input defaultValue="Sesión Estratégica: Tu Empresa en EE. UU." /></Field>
    <div className="form-cols"><Field label="Duración del evento" hint="Tiempo bloqueado al agente."><select defaultValue="60"><option value="30">30 minutos</option><option value="45">45 minutos</option><option value="60">60 minutos</option><option value="90">90 minutos</option></select></Field><ToggleRow title="Múltiples duraciones" hint="Deja que el cliente elija entre varias opciones." /></div>
    <Field label="Ubicación" hint="Se agrega al evento del cliente y del agente."><div className="location-option"><span>▣</span><div><strong>Google Meet automático</strong><small>Un enlace único por reserva.</small></div><button>Editar</button></div><button className="add-action">＋ Añadir opción de ubicación</button></Field>
    <Field label="Descripción" hint="Prepara al cliente antes de seleccionar una fecha."><textarea rows={4} defaultValue="El respaldo que necesitas para crecer con seguridad." /></Field>
    <Field label="URL personalizada" hint="Enlace independiente para compartir esta agenda."><div className="url-field"><span>teamroute-app.xbuenano.chatgpt.site/book/</span><input defaultValue="sesion-estrategica-equipo" /></div></Field>
    <div className="form-cols"><Field label="Diseño de escritorio" hint="Distribución del flujo público."><div className="layout-picks"><button>▤</button><button className="active">▥</button><button>▧</button></div></Field><Field label="Tema" hint="Color aplicado a botones y acentos."><div className="theme-box"><strong>Texto</strong><span>Acento</span><button>Botón</button><div><i /><i /><i /></div></div></Field></div>
  </Section>;
}

function Team() {
  const hosts = [["AT","Ana Torres","ana@sotoconsulting.com","Alta","#7c3aed"],["CM","Carlos Mendoza","carlos@sotoconsulting.com","Media","#0f766e"],["MP","María Paz","maria@sotoconsulting.com","Media","#c2410c"]];
  return <Section title="Equipo y rotación" subtitle="Agentes elegibles y orden de asignación.">
    <Field label="Seleccionar anfitriones" hint="Solo estos agentes pueden recibir reservas."><div className="member-search">⌕ <input placeholder="Seleccionar miembro del equipo" /></div><div className="host-config">{hosts.map(h => <div key={h[1]}><span className="avatar" style={{background:h[4]}}>{h[0]}</span><div><strong>{h[1]}</strong><small>{h[2]}</small></div><label>Prioridad<select defaultValue={h[3]}><option>Alta</option><option>Media</option><option>Baja</option></select></label><Toggle on /><button>×</button></div>)}</div></Field>
    <div className="form-cols"><Field label="Incremento de horarios" hint="Separación entre slots visibles."><select defaultValue="60"><option>15 minutos</option><option>30 minutos</option><option value="60">1 hora</option></select></Field><ToggleRow title="Maximizar espacios disponibles" hint="Agrupa citas y reduce huecos." on /></div>
    <Field label="Rango de fechas" hint="Hasta cuándo puede buscar el cliente."><div className="compound"><input type="number" defaultValue="30" /><select><option>días en el futuro</option><option>semanas en el futuro</option><option>meses en el futuro</option></select></div></Field>
    <div className="choice-cards"><label><input type="radio" name="schedule-mode" defaultChecked /><span>Combinar disponibilidad guardada<small>Usa la configuración personal de cada anfitrión.</small></span></label><label><input type="radio" name="schedule-mode" /><span>Horarios personalizados<small>Una disponibilidad común solo para esta agenda.</small></span></label></div>
  </Section>;
}

function Availability() {
  const days = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];
  return <Section title="Disponibilidad" subtitle="Ventanas reservables y protección del calendario.">
    <div className="form-cols"><Field label="Zona horaria" hint="Base de las reglas semanales."><select><option>America/Guayaquil (UTC−5)</option><option>America/Bogota</option><option>America/New_York</option></select></Field><ToggleRow title="Bloquear eventos externos" hint="Los eventos ocupados eliminan el slot." on /></div>
    <Field label="Horas semanales" hint="Horario regular usado para generar disponibilidad."><div className="week-list">{days.map((d,i)=><div key={d}><Toggle on={i<5}/><strong>{d}</strong><input type="time" defaultValue="09:00" disabled={i>4}/><span>—</span><input type="time" defaultValue="17:00" disabled={i>4}/><button>▣</button></div>)}</div></Field>
    <Field label="Horas específicas por fecha" hint="Sobrescriben la semana para festivos o jornadas especiales."><button className="add-action">＋ Añadir fecha especial</button></Field>
    <div className="form-cols three"><Field label="Aviso mínimo" hint="Evita reservas inmediatas."><select><option>15 minutos</option><option>1 hora</option><option>24 horas</option></select></Field><Field label="Buffer anterior" hint="Tiempo libre previo."><select><option>0 minutos</option><option>15 minutos</option><option>30 minutos</option></select></Field><Field label="Buffer posterior" hint="Tiempo libre posterior."><select><option>0 minutos</option><option>15 minutos</option><option>30 minutos</option></select></Field></div>
    <ToggleRow title="Limitar frecuencia de reservas" hint="Controla la capacidad por agente."><div className="inline-settings"><input type="number" defaultValue="6"/><select><option>reservas por día</option><option>reservas por semana</option><option>reservas por mes</option></select></div></ToggleRow>
  </Section>;
}

function ClientForm() {
  return <Section title="Formulario y visualización" subtitle="Información solicitada antes de confirmar.">
    <Field label="Preguntas personalizadas" hint="Las respuestas se guardan con la reserva."><div className="questions"><Question icon="☎" title="Teléfono (WhatsApp)" type="Teléfono · Obligatoria"/><Question icon="⌄" title="Rango aproximado de facturación" type="Selección · Obligatoria"/><Question icon="≡" title="Tema principal para conversar" type="Texto largo · Obligatoria"/></div><button className="add-action">＋ Añadir pregunta</button></Field>
    <Field label="Zona horaria mostrada" hint="Evita errores al convertir los horarios."><select><option>Zona horaria local del invitado</option><option>Zona horaria de la agenda</option><option>Permitir selección</option></select></Field>
    <ToggleRow title="Mostrar en página de perfil" hint="Incluye la agenda en el perfil público del equipo." />
  </Section>;
}

function Notifications() {
  return <Section title="Notificaciones" subtitle="Mensajes automáticos del ciclo de la reunión.">
    <ToggleRow title="Recordatorio por correo electrónico" hint="Reduce ausencias con un aviso previo." on><Settings value="24" suffix="horas antes"/></ToggleRow>
    <ToggleRow title="Correo de confirmación personalizado" hint="Reemplaza el mensaje estándar por uno de la organización." />
    <ToggleRow title="Correo electrónico de seguimiento" hint="Envía recursos o próximos pasos tras la reunión." on><Settings value="1" suffix="horas después" edit/></ToggleRow>
    <ToggleRow title="Recordatorio por SMS" hint="Canal adicional para reservas importantes." />
  </Section>;
}

function Advanced() {
  return <Section title="Reglas avanzadas" subtitle="Políticas y acciones posteriores a reservar.">
    <Field label="Formato del nombre del evento" hint="Título usado en Google Calendar."><input defaultValue="{{INVITEE_NAME}} y {{HOST_NAME}}: Sesión Estratégica" /></Field>
    <ToggleRow title="Permitir invitados" hint="El cliente puede añadir asistentes." on />
    <ToggleRow title="Solo correos electrónicos de trabajo" hint="Bloquea dominios personales." />
    <ToggleRow title="Ocultar reprogramación y cancelación" hint="Retira esos enlaces de los correos." />
    <ToggleRow title="Redirigir al reservar" hint="Envía a una página propia después de confirmar." on><div className="redirect"><input defaultValue="https://sotomayorconsulting.com/schedule-confirmed/"/><select><option>0 segundos</option><option>3 segundos</option><option>5 segundos</option></select></div></ToggleRow>
    <ToggleRow title="Aceptar pagos" hint="Exige pago antes de confirmar la reserva." />
  </Section>;
}

function Section({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <section className="builder-section"><header><p>AGENDA ROUND ROBIN</p><h2>{title}</h2><span>{subtitle}</span></header>{children}</section>}
function Field({label,hint,children}:{label:string;hint:string;children:React.ReactNode}){return <div className="builder-field"><label>{label}</label><p>{hint}</p>{children}</div>}
function Toggle({on=false}:{on?:boolean}){const [v,setV]=useState(on);return <button type="button" role="switch" aria-checked={v} className={`switch ${v?"on":""}`} onClick={()=>setV(!v)}><i/></button>}
function ToggleRow({title,hint,on=false,children}:{title:string;hint:string;on?:boolean;children?:React.ReactNode}){return <div className="toggle-setting"><Toggle on={on}/><div><strong>{title}</strong><small>{hint}</small>{children}</div></div>}
function Question({icon,title,type}:{icon:string;title:string;type:string}){return <div><span>{icon}</span><strong>{title}</strong><small>{type}</small><button>Editar</button><button>⋮⋮</button></div>}
function Settings({value,suffix,edit=false}:{value:string;suffix:string;edit?:boolean}){return <div className="inline-settings"><input type="number" defaultValue={value}/><select><option>{suffix}</option></select>{edit&&<button>Editar correo</button>}</div>}
