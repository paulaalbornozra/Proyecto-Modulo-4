# 📋 TaskFlow — Aplicación de Gestión de Tareas

| | |
|---|---|
| 📅 **Fecha** | 22 de febrero de 2026 |
| 👩‍🏫 **Docente** | Sabina Romero |
| 📚 **Módulo** | Programación Avanzada en JavaScript |
| 👩🏻 **Estudiante** | Paula Albornoz Ramos |
| 🏫 **Institución** | Alkemy |


Aplicación web interactiva para gestionar tareas, desarrollada con JavaScript moderno (ES6+). Implementa los 5 pasos del ABP: POO, ES6+, eventos DOM, asincronía y consumo de APIs.

---

## 📁 Estructura del Proyecto

```
taskflow/
├── index.html   → Interfaz HTML (formulario + lista de tareas)
├── app.js       → Lógica JavaScript (todos los pasos ABP)
├── style.css    → Estilos editorial oscuro
└── README.md    → Este archivo
```

---

## 🚀 Cómo ejecutar

1. Descarga los 3 archivos en la misma carpeta.
2. Abre `index.html` con doble clic (no requiere servidor).
3. Escribe una tarea y haz clic en **＋ Agregar Tarea**.

> ✅ No requiere instalación ni API Key. Funciona offline (excepto la carga desde API JSONPlaceholder).

---

## 📐 Paso a paso — Implementación

### Paso 1 — Orientación a Objetos (POO)

Se crearon dos clases con `class` (ES6):

**Clase `Tarea`** — representa una tarea individual:
```javascript
class Tarea {
  constructor({ descripcion, prioridad, fechaLimite }) {
    this.id           = Date.now();      // identificador único
    this.descripcion  = descripcion;
    this.prioridad    = prioridad;       // 'alta' | 'media' | 'baja'
    this.estado       = 'pendiente';     // 'pendiente' | 'completada'
    this.fechaCreacion = new Date().toLocaleString();
  }

  cambiarEstado() { /* alterna pendiente ↔ completada */ }
  estaCompletada() { return this.estado === 'completada'; }
}
```

**Clase `GestorTareas`** — administra el array de tareas (CRUD):
```javascript
class GestorTareas {
  constructor() { this.tareas = []; }

  agregar(datos)      { /* crea new Tarea() y la agrega */ }
  obtenerFiltradas()  { /* retorna tareas según filtro */ }
  toggleEstado(id)    { /* cambia estado de una tarea */ }
  eliminar(id)        { /* elimina tarea del array */ }
}
```

---

### Paso 2 — Características ES6+

Todas las características ES6+ usadas en el código:

| Característica | Dónde se usa | Ejemplo |
|---|---|---|
| `const` / `let` | Todo el código | `const gestorTareas = new GestorTareas()` |
| **Template literals** | Renderizar HTML | `` `Tarea #${tarea.id}` `` |
| **Arrow functions** | Callbacks, map, filter | `tareas.filter(t => t.estado === 'pendiente')` |
| **Destructuring** | Parámetros, variables | `const { title, completed } = dato` |
| **Spread operator** | Combinar arrays | `this.tareas = [...this.tareas, ...nuevas]` |
| **Shorthand properties** | Crear objetos | `gestorTareas.agregar({ descripcion, prioridad })` |
| **Default parameters** | Constructor | `prioridad = 'media'` |
| **`class`** | POO | `class Tarea { ... }` |
| **`async/await`** | Llamadas API | `const r = await fetch(url)` |

---

### Paso 3 — Eventos y Manipulación del DOM

Eventos implementados:

| Evento | Elemento | Acción |
|---|---|---|
| `submit` | Formulario | Captura los datos y crea una tarea |
| `keyup` | Textarea descripción | Actualiza contador de caracteres en tiempo real |
| `mouseover` | Lista de tareas | Delegación de eventos en el contenedor |
| `click` | Checkbox de tarea | Cambia estado pendiente ↔ completada |
| `click` | Botón eliminar | Elimina la tarea del gestor y del DOM |
| `click` | Filtros | Cambia la vista (todas / pendientes / completadas) |

Manipulación del DOM:
```javascript
// Construir HTML dinámicamente con template literals
lista.innerHTML = tareasFiltradas.map(tarea => `
    <li class="tarea-card" id="card-${tarea.id}">
        <p class="tarea-desc">${tarea.descripcion}</p>
    </li>
`).join('');
```

---

### Paso 4 — JavaScript Asíncrono

**`setTimeout`** — retardo al agregar una tarea (simula procesamiento):
```javascript
// Deshabilitar botón y esperar 2 segundos
setTimeout(() => {
    btnAgregar.disabled = false;
    this.renderizar();
    this.mostrarNotificacion('✓ Tarea agregada');
}, 2000); // 2000ms = 2 segundos
```

**`setInterval`** — reloj en tiempo real y cuenta regresiva:
```javascript
// Reloj: actualizar cada 1 segundo
setInterval(() => {
    relojEl.textContent = new Date().toLocaleTimeString();
}, 1000);

// Countdown: calcular tiempo restante para fecha límite
setInterval(() => {
    const diferencia = new Date(tarea.fechaLimite) - new Date();
    badge.textContent = `⏱ ${dias}d ${horas}h ${mins}m`;
}, 1000);
```

**`clearInterval`** — detener el intervalo cuando la tarea se completa:
```javascript
clearInterval(this._intervalos[tareaId]);
```

---

### Paso 5 — Consumo de APIs + localStorage

**fetch() con async/await + try/catch:**
```javascript
async cargarDesdeAPI() {
    try {
        const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

        const datos = await respuesta.json();

        // Mapear datos de la API a instancias de Tarea
        const nuevas = datos.map(({ title, completed }) => new Tarea({ descripcion: title }));
        this.tareas = [...this.tareas, ...nuevas];

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        btn.disabled = false; // siempre se ejecuta
    }
}
```

**localStorage — guardar y recuperar:**
```javascript
// Guardar (objeto → string JSON)
localStorage.setItem('taskflow_tareas', JSON.stringify(this.tareas));

// Recuperar (string JSON → objeto)
const datos = JSON.parse(localStorage.getItem('taskflow_tareas'));
```

---

## ✅ Checklist de validación

| Criterio | Estado |
|---|---|
| Clase `Tarea` con `id`, `descripcion`, `estado`, `fechaCreacion` | ✅ |
| Métodos `cambiarEstado()` y `estaCompletada()` en `Tarea` | ✅ |
| Clase `GestorTareas` que administra la lista | ✅ |
| `const` / `let` — nunca `var` | ✅ |
| Template literals en renderizado HTML | ✅ |
| Arrow functions en callbacks | ✅ |
| Destructuring y spread operator | ✅ |
| Formulario con evento `submit` | ✅ |
| Eventos `keyup` y `mouseover` | ✅ |
| Manipulación dinámica del DOM | ✅ |
| `setTimeout` — retardo de 2 segundos al agregar | ✅ |
| `setInterval` — reloj y cuenta regresiva | ✅ |
| `clearInterval` — limpiar intervalos | ✅ |
| `fetch()` con JSONPlaceholder | ✅ |
| `async/await` + `try/catch` | ✅ |
| `localStorage` — guardar y recuperar | ✅ |
| Manejo de errores en peticiones | ✅ |

---

## 🌐 API Utilizada

**JSONPlaceholder** — `https://jsonplaceholder.typicode.com/todos`

API pública y gratuita, sin registro ni API Key. Devuelve 200 tareas de prueba.

---

## 🛠️ Tecnologías

- HTML5
- CSS3 (variables CSS, Grid, Flexbox, animaciones)
- JavaScript ES6+ (clases, async/await, fetch, localStorage)
- [Google Fonts](https://fonts.google.com/) — DM Serif Display + DM Sans
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/)# Proyecto-Modulo-4
