---
sidebar_position: 4
---

# Chatbot de Documentación con IA

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |
| Modificado | Equipo de Arquitectura | 2026-02-09 |

Guía técnica del chatbot de IA integrado en el sitio de documentación. Permite a los usuarios hacer preguntas en lenguaje natural y recibir respuestas basadas en el contenido de los documentos.

---

## Arquitectura

```
Usuario escribe pregunta
        │
        ▼
Componente React (ChatBot)
        │
        ▼
Lee docs pre-indexados (docs-index.json)
        │
        ▼
Busca los docs más relevantes por palabras clave
        │
        ▼
Envía pregunta + contexto a OpenAI API
        │
        ▼
Muestra la respuesta en el chat
```

---

## Componentes del sistema

| Componente | Archivo | Propósito |
|------------|---------|-----------|
| Script de indexación | `scripts/index-docs.js` | Genera el índice JSON de documentos |
| Índice de docs | `static/docs-index.json` | JSON con título, ruta y contenido de cada doc |
| Componente ChatBot | `src/components/ChatBot/index.tsx` | UI del chat y lógica de búsqueda + OpenAI |
| Estilos | `src/components/ChatBot/styles.module.css` | Estilos con colores Pichincha y soporte dark/light |
| Root wrapper | `src/theme/Root.tsx` | Renderiza el chatbot en todas las páginas |

---

## Script de indexación

El script `scripts/index-docs.js` se ejecuta automáticamente antes de `npm start` y `npm run build`. Realiza lo siguiente:

1. Recorre recursivamente la carpeta `docs/`
2. Lee cada archivo `.md` y `.mdx`
3. Extrae el título (desde frontmatter o primer heading)
4. Limpia el contenido: elimina frontmatter, imports, HTML, imágenes, links, bloques de código y sintaxis Markdown
5. Genera `static/docs-index.json` con la estructura:

```json
[
  {
    "path": "/docs/guias/git-workflow",
    "title": "Flujo de Trabajo con Git",
    "content": "Texto plano del documento..."
  }
]
```

### Ejecución manual

```bash
npm run index-docs
```

---

## Componente ChatBot

### Funcionalidades

- **Botón flotante** en la esquina inferior derecha (visible en todas las páginas)
- **Ventana de chat** con historial de mensajes
- **Gestión de API key**: se pide al usuario en el primer uso y se guarda en `localStorage`
- **Búsqueda de contexto**: encuentra los documentos más relevantes a la pregunta
- **Integración con OpenAI**: envía la pregunta con contexto documental al modelo `gpt-4o-mini`

### Flujo de la API Key

```
Usuario abre el chat
        │
        ├─ ¿Tiene API key en localStorage?
        │       │
        │    NO ──► Muestra formulario para ingresar key
        │       │
        │    SÍ ──► Muestra el chat directamente
        │
        ▼
Botón ⚙️ permite borrar/cambiar la key
```

La key se almacena en `localStorage` bajo la clave `openai_api_key`. Nunca se envía a ningún servidor propio — solo directamente a la API de OpenAI.

### Búsqueda de documentos relevantes

Para el MVP se usa búsqueda por coincidencia de palabras clave (sin embeddings):

1. Se tokeniza la pregunta del usuario (se eliminan stop words en español e inglés)
2. Se normalizan los tokens (minúsculas, sin acentos)
3. Se cuenta cuántas veces aparece cada token en cada documento
4. Se seleccionan los 3 documentos con mayor puntuación
5. Se envían como contexto al prompt de OpenAI (máx. 2000 caracteres por doc)

### Prompt del sistema

```
Eres un asistente de documentación técnica de Banco Pichincha.
Responde ÚNICAMENTE con información de la documentación proporcionada.
Si no encuentras la respuesta en el contexto, dilo claramente.
Responde en español. Sé conciso y directo.
```

---

## Estilos y diseño

### Colores Pichincha

| Elemento | Color | Uso |
|----------|-------|-----|
| Botón flotante | `#0a3d6b` | Fondo del botón y header |
| Hover | `#0d4f8a` | Hover en botón y enviar |
| Mensajes usuario | `#0a3d6b` | Burbuja azul oscuro |
| Mensajes bot | `var(--ifm-color-emphasis-100)` | Se adapta a dark/light mode |

### Soporte dark/light mode

Los estilos usan variables CSS de Docusaurus (`--ifm-*`) para adaptarse automáticamente al tema activo.

### Responsive

En pantallas menores a 480px, la ventana del chat ocupa el ancho completo y se ancla al fondo de la pantalla.

---

## Root wrapper

El archivo `src/theme/Root.tsx` usa el mecanismo de [swizzling](https://docusaurus.io/docs/swizzling) de Docusaurus para envolver toda la aplicación. Esto garantiza que el chatbot aparezca en **todas las páginas** (docs, blog, inicio).

```tsx
import type { ReactNode } from 'react';
import ChatBot from '@site/src/components/ChatBot';

export default function Root({ children }: { children: ReactNode }): ReactNode {
  return (
    <>
      {children}
      <ChatBot />
    </>
  );
}
```

---

## Scripts de npm

| Script | Comando | Descripción |
|--------|---------|-------------|
| `index-docs` | `node scripts/index-docs.js` | Genera el índice de documentos |
| `start` | `node scripts/index-docs.js && docusaurus start` | Indexa + inicia dev server |
| `build` | `node scripts/index-docs.js && docusaurus build` | Indexa + build de producción |

---

## Requisitos

| Requisito | Detalle |
|-----------|---------|
| Node.js | >= 20.0 |
| API Key | OpenAI (modelo `gpt-4o-mini`) |
| Navegador | Cualquier navegador moderno |

---

## Verificación

1. Ejecutar `npm start`
2. Abrir `http://localhost:3000`
3. Verificar que el botón 💬 aparece en la esquina inferior derecha
4. Hacer clic y verificar que pide la API key
5. Ingresar una API key válida de OpenAI
6. Hacer una pregunta (ej: "¿Qué es un microservicio?")
7. Verificar que la respuesta usa información de la documentación
8. Navegar a otra página y verificar que el chatbot sigue visible
9. Cambiar a modo oscuro y verificar que los estilos se adaptan
10. Probar en vista mobile (responsive)

---

## Limitaciones actuales (MVP)

| Limitación | Descripción |
|------------|-------------|
| Sin embeddings | La búsqueda es por palabras clave, no semántica |
| API key en cliente | Cada usuario necesita su propia key de OpenAI |
| Sin persistencia del chat | El historial se pierde al recargar la página |
| Contexto limitado | Se envían máximo 3 docs (2000 chars cada uno) como contexto |

---

## Mejoras futuras

- **Embeddings**: usar embeddings para búsqueda semántica más precisa
- **Backend proxy**: mover la llamada a OpenAI a un backend para proteger la API key
- **Persistencia**: guardar historial de conversaciones en `localStorage`
- **Streaming**: mostrar la respuesta de OpenAI en tiempo real (streaming)
- **Feedback**: permitir al usuario calificar las respuestas
