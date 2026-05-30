# RoutePulse AI Agent Guidelines

- Este proyecto es primero un web tester, no un TMS enterprise completo.
- No integrar APIs externas hasta que el flujo mock este completo y validado.
- No reemplazar codigo existente si puede extenderse de forma incremental.
- Priorizar cambios pequenos, testeables y alineados al flujo demo.
- Mantener el flujo admin-driver-customer tracking.
- El diferencial del producto es ETA predictivo + control operativo + KPIs para ultima milla LatAm.
- El posicionamiento es AI-built, human-orchestrated Operational Intelligence Platform; no comunicar que la IA reemplaza humanos.
- Las decisiones criticas deben pasar por Human Approval Layer.
- Toda nueva logica de KPI o ETA debe estar en funciones puras testeables.
- Mantener la UI simple, profesional y demostrable.
- No agregar backend real, app nativa ni IA avanzada en este tester.
- Google Maps puede usarse solo de forma legal y configurable con `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; nunca hardcodear claves ni prometer trafico real si la clave no existe.
- Apple MapKit queda provider-ready hasta tener token, cuenta y terminos aprobados.
- El CMS admin debe crecer de forma incremental y persistir en estado local mientras no exista backend real.
- Mantener version visible en footer y documentar cambios en `SOFTWARE_LOG.md`.
- Las rutas privadas deben seguir protegidas por middleware y sesion HTTP-only.
