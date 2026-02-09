---
sidebar_position: 2
title: Angular
---

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Ing. María Gonzalez | 2026-02-09 |
| Modificado | Ing. María Gonzalez | 2026-02-09 |

## Descripción

Angular es un framework completo desarrollado por Google para crear aplicaciones web escalables. Usa TypeScript, data binding y una estructura bien definida.

---

## Características principales

- **Framework full-featured**: incluye routing, formularios, HTTP client y más
- **Separación clara entre lógica y vista**: mediante componentes, servicios y módulos
- **TypeScript nativo**: tipado estático desde el inicio
- **Inyección de dependencias**: sistema robusto integrado
- **CLI potente**: generación de código y scaffolding

---

## Ejemplo básico: Contador

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-counter',
  template: `
    <button (click)="count = count + 1">
      Contador: {{ count }}
    </button>
  `
})
export class CounterComponent {
  count = 0;
}
```

---

## Estructura típica de proyecto

```text
src/
├── app/
│   ├── components/
│   ├── services/
│   ├── models/
│   ├── guards/
│   ├── interceptors/
│   ├── app.module.ts
│   ├── app-routing.module.ts
│   └── app.component.ts
├── assets/
├── environments/
└── styles.scss
```

---

## Cuándo usar Angular

| Recomendado | No recomendado |
|-------------|----------------|
| Aplicaciones empresariales grandes | Prototipos rápidos |
| Equipos con experiencia en TypeScript | Proyectos muy pequeños |
| Proyectos que requieren estructura definida | Sitios estáticos simples |

---

## Herramientas complementarias

| Herramienta | Propósito |
|-------------|-----------|
| **Angular CLI** | Scaffolding y builds |
| **RxJS** | Programación reactiva |
| **NgRx** | Estado global |
| **Angular Material** | Componentes UI |
| **Nx** | Monorepos y workspaces |
