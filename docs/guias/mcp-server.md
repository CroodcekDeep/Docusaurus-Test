---
sidebar_position: 3
---

# Crear un MCP Server

| Acción | Autor | Fecha |
|--------|-------|-------|
| Creado | Equipo de Arquitectura | 2026-02-09 |
| Modificado | Equipo de Arquitectura | 2026-02-09 |

Guía paso a paso para crear un servidor MCP (Model Context Protocol) que permite a Claude Code consultar la documentación local.

---

## ¿Qué es MCP?

MCP es un **protocolo estándar** que permite que un modelo de IA se conecte a herramientas y fuentes de datos externas. Funciona como un puente entre el cliente (Claude Code, Cursor, VS Code) y los recursos (bases de datos, APIs, archivos).

```
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│   Cliente     │      │  Servidor    │      │  Recurso         │
│   (Claude     │◄────►│  MCP         │◄────►│  externo         │
│   Code)       │      │  (puente)    │      │  (docs, BD, API) │
└──────────────┘      └──────────────┘      └──────────────────┘
```

### Componentes

| Componente | Rol | Ejemplo |
|------------|-----|---------|
| **Host/Cliente** | App que usa la IA | Claude Code, Cursor, VS Code |
| **Servidor MCP** | Proceso que expone herramientas | `mcp-docs-pichincha` |
| **Recurso** | Fuente de datos | Archivos Markdown, BD, API |

### ¿Qué expone un servidor MCP?

| Tipo | Qué es | Ejemplo |
|------|--------|---------|
| **Tools** | Acciones que la IA puede ejecutar | `query()`, `leer_documento()` |
| **Resources** | Datos que la IA puede leer | Esquema de BD, archivos |
| **Prompts** | Templates predefinidos | "Analiza esta tabla" |

---

## Paso 1: Crear el proyecto

Crear una carpeta nueva para el servidor MCP (fuera del proyecto Docusaurus):

```bash
mkdir mcp-docs-pichincha
cd mcp-docs-pichincha
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node
npx tsc --init
```

### Dependencias

| Paquete | Propósito |
|---------|-----------|
| `@modelcontextprotocol/sdk` | SDK oficial del protocolo MCP |
| `zod` | Validación y tipado de parámetros de las herramientas |
| `typescript` | Compilador TypeScript |
| `@types/node` | Tipos de Node.js |

---

## Paso 2: Configurar el proyecto

### `package.json`

```json
{
  "name": "mcp-docs-pichincha",
  "version": "1.0.0",
  "description": "MCP Server para leer documentación de Banco Pichincha",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.26.0",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/node": "^25.2.2",
    "typescript": "^5.9.3"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
```

---

## Paso 3: Escribir el servidor

Crear el archivo `src/index.ts`:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// ============================================================
// CONFIGURACIÓN
// ============================================================
// Ruta a la carpeta docs del proyecto Docusaurus.
// Se puede cambiar con la variable de entorno DOCS_PATH.
const DOCS_DIR =
  process.env["DOCS_PATH"] ||
  path.resolve(__dirname, "../../my-website/docs");

// ============================================================
// FUNCIONES AUXILIARES
// ============================================================

/**
 * Recorre recursivamente un directorio y devuelve todos los
 * archivos .md y .mdx encontrados.
 */
function getMarkdownFiles(dir: string, basePath = ""): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(basePath, entry.name);
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results.push(...getMarkdownFiles(fullPath, relativePath));
    } else if (/\.(md|mdx)$/.test(entry.name)) {
      results.push(relativePath);
    }
  }
  return results;
}

/**
 * Lee el contenido de un archivo de documentación.
 * Incluye protección contra path traversal.
 */
function readDocFile(filePath: string): string | null {
  const fullPath = path.resolve(DOCS_DIR, filePath);

  // Seguridad: evitar salir del directorio docs
  if (!fullPath.startsWith(path.resolve(DOCS_DIR))) {
    return null;
  }

  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf-8");
}

/**
 * Busca un término en todos los archivos Markdown.
 */
function searchInDocs(
  term: string
): { file: string; line: number; content: string }[] {
  const files = getMarkdownFiles(DOCS_DIR);
  const results: { file: string; line: number; content: string }[] = [];
  const lowerTerm = term.toLowerCase();

  for (const file of files) {
    const content = readDocFile(file);
    if (!content) continue;

    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i]!.toLowerCase().includes(lowerTerm)) {
        results.push({
          file,
          line: i + 1,
          content: lines[i]!.trim(),
        });
      }
    }
  }
  return results;
}

// ============================================================
// SERVIDOR MCP
// ============================================================

// 1. Crear instancia del servidor
const server = new McpServer({
  name: "docs-pichincha",
  version: "1.0.0",
});

// 2. Tool: listar_documentos (sin parámetros)
server.tool(
  "listar_documentos",
  "Lista todos los documentos disponibles",
  {},
  async () => {
    const files = getMarkdownFiles(DOCS_DIR);
    if (files.length === 0) {
      return {
        content: [
          { type: "text" as const, text: `No se encontraron documentos en: ${DOCS_DIR}` },
        ],
      };
    }
    const list = files.map((f) => `- ${f}`).join("\n");
    return {
      content: [
        { type: "text" as const, text: `Documentos encontrados (${files.length}):\n\n${list}` },
      ],
    };
  }
);

// 3. Tool: leer_documento (recibe ruta relativa)
server.tool(
  "leer_documento",
  "Lee el contenido completo de un documento específico",
  {
    ruta: z.string().describe("Ruta relativa del documento, ej: guias/estandares-codigo.md"),
  },
  async ({ ruta }) => {
    const content = readDocFile(ruta);
    if (content === null) {
      return {
        content: [
          { type: "text" as const, text: `Error: No se encontró "${ruta}". Usa "listar_documentos" para ver los disponibles.` },
        ],
      };
    }
    return {
      content: [{ type: "text" as const, text: content }],
    };
  }
);

// 4. Tool: buscar_en_docs (recibe término de búsqueda)
server.tool(
  "buscar_en_docs",
  "Busca un término en todos los documentos",
  {
    termino: z.string().describe("Texto a buscar en la documentación"),
  },
  async ({ termino }) => {
    const results = searchInDocs(termino);
    if (results.length === 0) {
      return {
        content: [
          { type: "text" as const, text: `No se encontraron resultados para "${termino}".` },
        ],
      };
    }
    const formatted = results
      .map((r) => `${r.file}:${r.line} → ${r.content}`)
      .join("\n");
    return {
      content: [
        { type: "text" as const, text: `Resultados para "${termino}" (${results.length}):\n\n${formatted}` },
      ],
    };
  }
);

// 5. Conectar transporte stdio y arrancar
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server docs-pichincha iniciado correctamente");
}

main().catch((error) => {
  console.error("Error al iniciar el servidor MCP:", error);
  process.exit(1);
});
```

### Anatomía del código

| Sección | Qué hace |
|---------|----------|
| `McpServer` | Crea la instancia del servidor con nombre y versión |
| `server.tool()` | Registra una herramienta con nombre, descripción, esquema Zod y handler |
| `StdioServerTransport` | Comunicación via stdin/stdout (así Claude Code habla con el servidor) |
| `server.connect()` | Arranca el servidor y lo conecta al transporte |
| `z.string()` | Define que el parámetro es un string (validación con Zod) |

### Protección de seguridad

```ts
// Evita que alguien pase rutas como "../../etc/passwd"
if (!fullPath.startsWith(path.resolve(DOCS_DIR))) {
  return null;
}
```

---

## Paso 4: Compilar y probar

### Compilar

```bash
npm run build
```

Esto genera la carpeta `dist/` con el JavaScript compilado.

### Probar que arranca

```bash
npm start
```

Debería mostrar: `MCP Server docs-pichincha iniciado correctamente` y quedarse esperando. Cerrar con `Ctrl+C`.

---

## Paso 5: Conectar a Claude Code

Desde la carpeta del proyecto que quiere usar el MCP (ej: `my-website`):

```bash
cd C:\ruta\a\my-website
claude mcp add docs-pichincha node C:\ruta\a\mcp-docs-pichincha\dist\index.js
```

Esto registra el servidor en el archivo `.claude.json` del proyecto.

### Verificar

Abrir Claude Code en `my-website` y probar:

```
Usa la herramienta listar_documentos
Usa buscar_en_docs para buscar "microservicios"
Usa leer_documento para leer guias/estandares-codigo.md
```

### Comandos útiles de gestión

```bash
claude mcp list                          # Ver MCPs registrados
claude mcp remove docs-pichincha         # Eliminar un MCP
claude mcp add -s user nombre ...        # Registrar globalmente (no solo al proyecto)
```

---

## Estructura final del proyecto

```text
mcp-docs-pichincha/
├── src/
│   └── index.ts          ← Código fuente del servidor
├── dist/
│   └── index.js          ← Compilado (generado por tsc)
├── node_modules/
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Flujo completo

```
Claude Code abre sesión
        │
        ▼
Lee .claude.json del proyecto
        │
        ▼
Encuentra el MCP "docs-pichincha"
        │
        ▼
Ejecuta: node dist/index.js
        │
        ▼
El servidor expone 3 tools via stdio
        │
        ▼
Claude puede llamar a listar_documentos,
leer_documento y buscar_en_docs
```

---

## Resultado obtenido

### `listar_documentos`

Prompt: `Usa la herramienta listar_documentos del MCP docs-pichincha`

```
Documentos encontrados (7):

- arquitectura\microservicios.md
- frontend\angular.md
- frontend\react.md
- guias\estandares-codigo.md
- guias\git-workflow.md
- infraestructura\autenticacion-azure-swa.md
- intro.md
```

La herramienta recorrió la carpeta `docs/` y listó los 7 archivos Markdown organizados por categoría.

### `buscar_en_docs`

Prompt: `Usa buscar_en_docs para buscar "microservicios"`

```
Resultados para "microservicios" (5 coincidencias):

arquitectura\microservicios.md:5  → # Microservicios
arquitectura\microservicios.md:12 → Guía de referencia sobre la arquitectura de microservicios
                                    adoptada en los proyectos de Banco Pichincha.
arquitectura\microservicios.md:14 → ## ¿Qué son los microservicios?
arquitectura\microservicios.md:16 → Los microservicios son un estilo de arquitectura donde una
                                    aplicación se compone de servicios pequeños e independientes...
intro.md:21                       → | **Arquitectura** | Patrones de diseño, microservicios y
                                    decisiones técnicas |
```

La herramienta buscó el término en todos los documentos y devolvió cada coincidencia con archivo, número de línea y contenido.

---

```
                                                                                                                                                                                                                                                                                               
  ╭─── Claude Code v2.1.15 ───────────────────────────────────────────────────╮                                                                                                                                                                                                                 
  │                                                    │ Tips for getting     │                                                                                                                                                                                                                 
  │                 Welcome back Ginno!                │ started              │                                                                                                                                                                                                                 
  │                                                    │ Run /init to create… │                                                                                                                                                                                                                 
  │                                                    │ ──────────────────── │                                                                                                                                                                                                                 
  │                       ▐▛███▜▌                      │ Recent activity      │                                                                                                                                                                                                                 
  │                      ▝▜█████▛▘                     │ No recent activity   │                                                                                                                                                                                                                 
  │                        ▘▘ ▝▝                       │                      │                                                                                                                                                                                                                 
  │ Opus 4.5 · Claude Pro · ginno.taimal@gmail.com's   │                      │                                                                                                                                                                                                                 
  │ Organization                                       │                      │                                                                                                                                                                                                                 
  │ ~\Documents\Trabajo\Pichincha\Documentacion\docus… │                      │                                                                                                                                                                                                                 
  ╰───────────────────────────────────────────────────────────────────────────╯                                                                                                                                                                                                                 
                                                                                                                                                                                                                                                                                                
  ❯ Usa la herramienta listar_documentos del MCP docs-pichincha                                                                                                                                                                                                                                 
    ⎿  Documentos encontrados (7):                                                                                                                                                                                                                                                              
                                                                                                                                                                                                                                                                                                
       - arquitectura\microservicios.md                                                                                                                                                                                                                                                         
       … +6 lines (ctrl+o to expand)                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                
  ● La documentación de Banco Pichincha contiene 7 documentos:                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                
    Arquitectura:                                                                                                                                                                                                                                                                               
    - arquitectura/microservicios.md                                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                
    Frontend:                                                                                                                                                                                                                                                                                   
    - frontend/angular.md                                                                                                                                                                                                                                                                       
    - frontend/react.md                                                                                                                                                                                                                                                                         
                                                                                                                                                                                                                                                                                                
    Guías:                                                                                                                                                                                                                                                                                      
    - guias/estandares-codigo.md                                                                                                                                                                                                                                                                
    - guias/git-workflow.md                                                                                                                                                                                                                                                                     
                                                                                                                                                                                                                                                                                                
    Infraestructura:                                                                                                                                                                                                                                                                            
    - infraestructura/autenticacion-azure-swa.md                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                                                                
    General:                                                                                                                                                                                                                                                                                    
    - intro.md                                                                                                                                                                                                                                                                                  
                                                                                                                                                                                                                                                                                                
    ¿Te gustaría que lea el contenido de alguno de estos documentos?                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                                                                
  ❯ Usa buscar_en_docs para buscar "microservicios"                                                                                                                                                                                                                                             
                                                                                                                                                                                                                                                                                                
  ● docs-pichincha - buscar_en_docs (MCP)(termino: "microservicios")                                                                                                                                                                                                                            
    ⎿  Resultados para "microservicios" (5 coincidencias):                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                
       arquitectura\microservicios.md:5 → # Microservicios                                                                                                                                                                                                                                      
       … +11 lines (ctrl+o to expand)                                                                                                                                                                                                                                                           
  ● Se encontraron 5 coincidencias para "microservicios" en 2 documentos:                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                
    arquitectura/microservicios.md (4 coincidencias):                            Línea: 5                                                                                                                                                                                                       
    Contenido: # Microservicios                                                                                                                                                                                                                                                                 
    ────────────────────────────────────────                                                                                                                                                                                                                                                    
    Línea: 12                                                                                                                                                                                                                                                                                   
    Contenido: Guía de referencia sobre la arquitectura de microservicios                                                                                                                                                                                                                       
      adoptada en los proyectos de Banco Pichincha.                                                                                                                                                                                                                                             
    ────────────────────────────────────────                                                                                                                                                                                                                                                    
    Línea: 14                                                                                                                                                                                                                                                                                   
    Contenido: ## ¿Qué son los microservicios?                                                                                                                                                                                                                                                  
    ────────────────────────────────────────                                                                                                                                                                                                                                                    
    Línea: 16                                                                                                                                                                                                                                                                                   
    Contenido: Los microservicios son un estilo de arquitectura donde una                                                                                                                                                                                                                       
      aplicación se compone de servicios pequeños e independientes...                                                                                                                                                                                                                           
    intro.md (1 coincidencia):                                                                                                                                                                                                                                                                  
    ┌───────┬───────────┐                                                                                                                                                                                                                                                                       
    │ Línea │ Contenido │                                                                                                                                                                                                                                                                       
    ├───────┼───────────┤                                                                                                                                                                                                                                                                       
    │ 21    │ `         │                                                                                                                                                                                                                                                                       
    └───────┴───────────┘                                                                                                                                                                                                                                                                       
    ¿Te gustaría que lea el documento completo de                                                                                                                                                                                                                                               
    arquitectura/microservicios.md?   
```

## Agregar nuevas herramientas

Para agregar una tool nueva, editar `src/index.ts` y agregar un bloque `server.tool()`:

```ts
server.tool(
  "nombre_de_la_tool",
  "Descripción de lo que hace",
  {
    parametro: z.string().describe("Descripción del parámetro"),
  },
  async ({ parametro }) => {
    // Lógica aquí
    return {
      content: [{ type: "text" as const, text: "Resultado" }],
    };
  }
);
```

Después recompilar y reiniciar Claude Code:

```bash
npm run build
# Cerrar y abrir Claude Code para que reconecte el MCP
```
