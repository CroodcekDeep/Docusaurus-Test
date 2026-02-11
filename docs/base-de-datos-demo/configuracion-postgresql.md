---
title: "Configuración de PostgreSQL"
sidebar_position: 1
slug: configuracion-postgresql
tags: [database, demo]
---
# Configuración de PostgreSQL

Esta guía describe los pasos para configurar PostgreSQL en los ambientes del banco.

## Requisitos previos

- PostgreSQL 15 o superior
- Acceso a la red interna del banco
- Credenciales de administrador de base de datos

## Instalación

### 1. Configuración del servidor

Editar el archivo `postgresql.conf` con los siguientes parámetros:

```bash
listen_addresses = 'localhost'
port = 5432
max_connections = 200
shared_buffers = 256MB
```

### 2. Configuración de autenticación

Modificar `pg_hba.conf` para permitir conexiones desde los servicios internos:

```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             app_user        10.0.0.0/8              scram-sha-256
host    all             readonly_user   10.0.0.0/8              scram-sha-256
```

### 3. Creación del esquema

```sql
CREATE SCHEMA IF NOT EXISTS documentacion;

CREATE TABLE documentacion.documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    sidebar_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Monitoreo

Utilizar las siguientes queries para monitorear el estado de la base de datos:

```sql
-- Conexiones activas
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Tamaño de tablas
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;
```

:::tip
Se recomienda configurar alertas automáticas cuando las conexiones activas superen el 80% del máximo configurado.
:::

:::warning
Nunca exponer el puerto de PostgreSQL directamente a internet. Siempre usar túneles SSH o VPN para acceso remoto.
:::