"use client";

import { useEffect, useState } from "react";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((response) => {
      if (!response.ok) window.location.replace("/login");
      else setReady(true);
    }).catch(() => window.location.replace("/login"));
  }, []);

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); window.location.assign("/login"); }
  if (!ready) return <main className="auth-loading"><span className="brand-mark"><i /><i /><i /></span><p>Verificando acceso seguro…</p></main>;
  return <><button className="session-logout" onClick={logout}>Cerrar sesión</button>{children}</>;
}
