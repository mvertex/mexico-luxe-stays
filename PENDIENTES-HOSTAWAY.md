# Pendientes — integración con Hostaway

Documento interno (excluido del deploy por `.vercelignore`, no se publica en el sitio).

## Pendiente

- **Pago.** Las solicitudes llegan como consulta (`inquiry`), sin precio ni cobro. Opciones: Booking Engine de Hostaway con Stripe (cobra al reservar), o el equipo aprueba la consulta y envía cotización y enlace de pago desde Hostaway. Falta definir depósito y política de cancelación en Hostaway.
- **Automatizaciones de Hostaway.** Revisar si la cuenta envía mensajes automáticos al huésped cuando entra una consulta nueva desde el sitio (canal Direct, origen "Website").
- **Límites del formulario.** El límite de envíos por IP y el control de duplicados en memoria son por instancia de Vercel; el control de duplicados en Hostaway solo cubre envíos con fechas.
- **Validación de teléfono.** Hostaway no documenta su regla; el sitio usa la de libphonenumber (Google). Confirmar con la próxima consulta real que Hostaway acepta los números que el sitio da por buenos.

## Resuelto

- **2026-10-08 — Consulta de prueba 67311572** (Kasa Kefi, 6–11 sep 2027, "TEST - NO RESPONDER"): cancelada a mano por Diego en Hostaway; fechas libres.
- **2026-10-08 — Nombre y apellido.** Llegan separados a Hostaway (`guestFirstName` / `guestLastName`) tal como los escribe el huésped. "Prueba web" era el apellido escrito a propósito en la prueba, no un valor del sistema; el origen va en el campo `source` ("Website"), nunca en el nombre. Cubierto por una prueba automática.
- **2026-10-08 — Teléfono rechazado por Hostaway** (+52 000 000 0000, "Please provide a valid phone number"). El formulario pide el número con código de país; el servidor lo valida con libphonenumber (reglas de cada país), acepta "00" y el antiguo "+52 1", y lo envía en formato E.164 (+529848079475). Si no es válido, el huésped ve un aviso y no se crea nada en Hostaway.
