import type { Metadata } from "next";
import { BookingFlow } from "../../components/BookingFlow";

export const metadata: Metadata = {
  title: "Sesión Estratégica | Soto Consulting",
  description: "Reserva una sesión estratégica con el equipo de Soto Consulting.",
};

export default function PublicBookingPage() {
  return <BookingFlow />;
}
