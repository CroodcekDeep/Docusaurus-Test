# ⚛️ React

## Descripción

**React** es una librería de JavaScript creada por Meta (Facebook) para construir **interfaces de usuario basadas en componentes reutilizables**.
Se centra en la creación de vistas interactivas, eficientes y fáciles de mantener mediante un enfoque **declarativo**.

React no es un framework completo, sino una **librería de UI**, lo que significa que suele combinarse con otras herramientas (React Router, Redux, Vite, etc.) para crear aplicaciones completas.

---

## ¿Para qué se usa React?

React se utiliza principalmente para:

* Aplicaciones web de **una sola página (SPA)**
* Dashboards y paneles administrativos
* Interfaces complejas con alto nivel de interacción
* Aplicaciones escalables y mantenibles

Ejemplos de uso común:

* Formularios dinámicos
* Listas filtrables en tiempo real
* Aplicaciones con autenticación y estados complejos

---

## Características principales

### 🔹 Arquitectura basada en componentes

La interfaz se divide en **componentes independientes**, cada uno con su propia lógica y presentación.

Ventajas:

* Reutilización de código
* Mejor mantenimiento
* Separación clara de responsabilidades

---

### 🔹 JSX

JSX es una extensión de JavaScript que permite escribir HTML dentro del código JS.

```jsx
const element = <h1>Hola, React</h1>;
```

Esto mejora la legibilidad y la relación directa entre lógica y vista.

---

### 🔹 Estado y Hooks

React maneja el estado mediante **Hooks**, introducidos a partir de React 16.8.

Hooks más comunes:

* `useState` → estado local
* `useEffect` → efectos secundarios
* `useContext` → contexto global
* `useRef` → referencias directas al DOM

---

### 🔹 Virtual DOM

React usa un **DOM virtual**, que:

* Detecta cambios
* Actualiza solo lo necesario
* Mejora el rendimiento frente a manipulaciones directas del DOM

---

## Ejemplo básico: Contador

```js
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Contador: {count}
    </button>
  );
}

export default Counter;
```

**Qué hace este ejemplo:**

* Declara un estado `count`
* Inicializa el valor en `0`
* Actualiza el estado al hacer clic
* React re-renderiza automáticamente el componente

---

## Ciclo de vida (con Hooks)

En React moderno, el ciclo de vida se maneja con `useEffect`.

```js
useEffect(() => {
  console.log("Componente montado");

  return () => {
    console.log("Componente desmontado");
  };
}, []);
```

Equivalente a:

* `componentDidMount`
* `componentWillUnmount`

---

## Ventajas de React

* Gran comunidad y ecosistema
* Alto rendimiento
* Curva de aprendizaje progresiva
* Compatible con TypeScript
* Ideal para aplicaciones grandes

---

## Desventajas

* No incluye routing ni manejo global por defecto
* Cambios frecuentes en el ecosistema
* Requiere decisiones arquitectónicas adicionales

---

## Casos donde React es una buena elección

✅ Aplicaciones medianas y grandes
✅ Proyectos con crecimiento a largo plazo
✅ Interfaces altamente interactivas

❌ Sitios estáticos simples
❌ Proyectos muy pequeños sin interacción

---

## Relación con otras herramientas

React suele usarse junto con:

* **React Router** → navegación
* **Redux / Zustand** → estado global
* **Vite / Webpack** → bundling
* **Next.js** → SSR y SEO

---

## Estructura típica de proyecto

```text
src/
├── components/
├── pages/
├── hooks/
├── services/
├── styles/
└── App.jsx
```
