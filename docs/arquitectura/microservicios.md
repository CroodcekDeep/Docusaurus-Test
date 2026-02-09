---
sidebar_position: 1
---

# Microservicios

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |
| Modificado | Equipo de Arquitectura | 2026-02-09 |

Guía de referencia sobre la arquitectura de microservicios adoptada en los proyectos de Banco Pichincha.

## ¿Qué son los microservicios?

Los microservicios son un estilo de arquitectura donde una aplicación se compone de **servicios pequeños e independientes**, cada uno ejecutándose en su propio proceso y comunicándose mediante mecanismos ligeros (generalmente HTTP/REST o mensajería).

---

## Principios de diseño

| Principio | Descripción |
|-----------|-------------|
| **Responsabilidad única** | Cada servicio resuelve un dominio específico del negocio |
| **Independencia de despliegue** | Se puede desplegar sin afectar otros servicios |
| **Descentralización** | Cada servicio gestiona su propia base de datos |
| **Resiliencia** | Fallas en un servicio no deben afectar a todo el sistema |
| **Observabilidad** | Cada servicio debe exponer métricas, logs y trazas |

---

## Patrones comunes

### API Gateway

Punto de entrada único que enruta peticiones a los servicios correspondientes.

```
Cliente → API Gateway → Servicio A
                     → Servicio B
                     → Servicio C
```

**Responsabilidades:**
- Routing
- Autenticación/Autorización
- Rate limiting
- Transformación de requests/responses

### Circuit Breaker

Previene llamadas repetidas a un servicio que está fallando.

| Estado | Comportamiento |
|--------|---------------|
| **Cerrado** | Peticiones pasan normalmente |
| **Abierto** | Peticiones se rechazan inmediatamente |
| **Semi-abierto** | Se permite una petición de prueba |

### Event-Driven (Eventos)

Comunicación asíncrona entre servicios mediante eventos.

```
Servicio A ──publica──► Cola/Topic ──consume──► Servicio B
                                   ──consume──► Servicio C
```

**Herramientas comunes:** Apache Kafka, Azure Service Bus, RabbitMQ

---

## Comunicación entre servicios

| Tipo | Protocolo | Uso |
|------|-----------|-----|
| **Síncrono** | REST / gRPC | Consultas en tiempo real |
| **Asíncrono** | Mensajería (Kafka, Service Bus) | Eventos, procesos en segundo plano |

### Buenas prácticas

- Preferir comunicación **asíncrona** cuando sea posible
- Implementar **reintentos con backoff exponencial**
- Usar **idempotencia** en los endpoints
- Definir **contratos claros** (OpenAPI / Protobuf)
- Implementar **timeouts** en todas las llamadas síncronas

---

## Observabilidad

Cada microservicio debe implementar:

| Pilar | Herramienta sugerida | Propósito |
|-------|---------------------|-----------|
| **Logs** | Application Insights, ELK | Registro de eventos y errores |
| **Métricas** | Prometheus, Azure Monitor | Rendimiento y disponibilidad |
| **Trazas** | OpenTelemetry, Jaeger | Seguimiento de requests distribuidos |

### Health Checks

Cada servicio debe exponer endpoints de salud:

```
GET /health        → Estado general del servicio
GET /health/ready  → Listo para recibir tráfico
GET /health/live   → El proceso está vivo
```

---

## Estructura recomendada por servicio

```text
mi-servicio/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── events/
│   ├── config/
│   └── middleware/
├── tests/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Anti-patrones a evitar

| Anti-patrón | Problema |
|-------------|----------|
| **Monolito distribuido** | Servicios altamente acoplados que deben desplegarse juntos |
| **Base de datos compartida** | Elimina la independencia entre servicios |
| **Comunicación síncrona en cadena** | Un servicio llama a otro que llama a otro (latencia y fragilidad) |
| **Servicios demasiado pequeños** | Complejidad operacional sin beneficio real |
