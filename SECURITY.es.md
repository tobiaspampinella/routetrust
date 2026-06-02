# Seguridad

## Estado de Divulgacion

Este proyecto esta en beta. La documentacion publica de seguridad esta redactada a proposito.

## Reporte Privado

No abrir issues publicos para vulnerabilidades que incluyan:

- credenciales
- rutas de explotacion
- datos de clientes o tenants
- detalles de infraestructura
- tokens
- detalles de la maquina local

Usar un canal privado de divulgacion controlado por el owner del repositorio o por el responsable designado de seguridad.

## Reglas del Repositorio

- No commitear archivos `.env` ni secretos.
- No publicar tokens, API keys, chat IDs, passwords ni material de sesion.
- No incluir payloads explotables, guias de ataque ni pruebas de concepto destructivas.
- No exponer datos personales de contacto innecesarios en docs publicos.

## Controles Minimos

- rutas admin y CMS protegidas
- estado de auth explicito
- auditabilidad durable para acciones sensibles
- preservacion del limite entre tenants
- aprobacion humana para acciones operativas criticas

## Alcance de Seguridad

- auth y sesiones
- control de acceso admin y CMS
- almacenamiento de intake de bugs
- supervision de runtime y agentes
- integraciones opcionales de Telegram y mapas

## Claims Fuera de Alcance

Este documento no afirma certificaciones, pentest completo ni readiness de seguridad para produccion.
