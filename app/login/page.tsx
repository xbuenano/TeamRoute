"use client";

import { FormEvent, useState } from "react";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const response = await fetch(`/api/auth/${mode === "login" ? "login" : "register"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No fue posible continuar.");
      window.location.assign("/");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible continuar."); }
    finally { setLoading(false); }
  }

  return <main className="auth-page"><section className="auth-panel"><div className="auth-brand"><span className="brand-mark"><i /><i /><i /></span><span>TeamRoute</span></div><p className="eyebrow">ACCESO SEGURO</p><h1>{mode === "login" ? "Ingresa a tu equipo" : "Crea tu cuenta"}</h1><p className="auth-copy">{mode === "login" ? "Gestiona tus agendas Round Robin desde un espacio protegido." : "Crea una organización para empezar a gestionar agendas Round Robin."}</p><div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Iniciar sesión</button><button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Registrarme</button></div><form onSubmit={submit} className="auth-form">{mode === "register" && <><label>Nombre completo<input name="fullName" required maxLength={160} placeholder="Xavier Buenano" /></label><label>Organización<input name="organizationName" maxLength={160} placeholder="Sotomayor Consulting" /></label></>}<label>Correo electrónico<input name="email" type="email" required autoComplete="email" placeholder="nombre@empresa.com" /></label><label>Contraseña<input name="password" type="password" required minLength={12} autoComplete={mode === "login" ? "current-password" : "new-password"} placeholder="Mínimo 12 caracteres" /></label>{mode === "register" && <p className="password-rule">Usa 12+ caracteres, mayúscula, minúscula y un número.</p>}{error && <p className="auth-error">{error}</p>}<button className="primary-button auth-submit" disabled={loading}>{loading ? "Procesando…" : mode === "login" ? "Entrar al panel" : "Crear cuenta"}</button></form><p className="auth-foot">{mode === "register" ? "La cuenta de Xavier Buenano puede activarse usando su correo inicial." : "¿Primera vez? Usa “Registrarme” para crear o activar tu cuenta."}</p></section><aside className="auth-art"><span className="route-art"><i /><i /><i /><b>✓</b></span><h2>Las reuniones llegan a la persona correcta.</h2><p>Disponibilidad, prioridad y rotación, en un solo flujo para tu equipo.</p></aside></main>;
}
