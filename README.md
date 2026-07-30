# TeamRoute

**Intelligent meeting routing.**

TeamRoute es una aplicación de agendamiento Round Robin para equipos. Reúne la
disponibilidad de los agentes y asigna cada reserva a una sola persona según
disponibilidad, prioridad y antigüedad de la última asignación.

## Primera versión

- Dashboard con agendas Round Robin activas.
- Constructor completo de agendas y enlace público configurable.
- Selección de anfitriones, prioridad y horarios.
- Configuración de disponibilidad, buffers, límites y notificaciones.
- Configuración de cuenta, usuarios, equipos, calendarios e integraciones.
- Flujo público en tres fases: fecha, hora y datos de contacto.
- Vista adaptable para escritorio y móvil.

## Rutas principales

- `/`: panel administrativo y configuración.
- `/book/[slug]`: agenda pública compartible con clientes.
- `/book/consulta-inicial-llc`: ejemplo incluido.

## Desarrollo local

Requiere Node.js 22.13 o superior.

```bash
npm install
npm run dev
```

La aplicación estará disponible en la dirección que indique el servidor local.

## Validación

```bash
npm test
npm run build
```

## Arquitectura actual

- React y Next.js sobre vinext.
- TypeScript.
- Despliegue mediante OpenAI Sites.
- Estado demostrativo en el cliente para esta primera versión visual.

La conexión persistente con PostgreSQL, autenticación de usuarios, OAuth de
Google Calendar, FreeBusy, creación de eventos, Google Meet y bloqueos de
concurrencia corresponden a la siguiente etapa del backend.

## Seguridad

Los archivos `.env*`, credenciales, tokens y artefactos de compilación están
excluidos del repositorio. No se deben guardar secretos de Google ni claves de
producción dentro del código fuente.
