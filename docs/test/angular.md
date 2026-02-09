---
title: 🅰️ Angular
---

import AuthorCard from '@site/src/components/AuthorCard';

<AuthorCard
    name="Ing. María Gonzalez"
    title="Líder de Arquitectura"
    url="https://github.com/mariagonzalez"
    image_url="https://avatars.githubusercontent.com/u/1?v=4"
/>

## Descripción

Angular es un framework completo desarrollado para crear aplicaciones web escalables. Usa TypeScript, data binding y una
estructura bien definida.

## Características principales

- Framework full-featured
- Separación clara entre lógica y vista
- Uso de decoradores y módulos

### Ejemplo básico

```ts
import {Component} from '@angular/core';

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