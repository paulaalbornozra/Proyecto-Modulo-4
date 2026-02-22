// ╔══════════════════════════════════════════════════════════╗
// ║   TASKFLOW — app.js                                      ║
// ║   Evaluación Módulo #4 · Alkemy                          ║
// ║                                                          ║
// ║   PASOS IMPLEMENTADOS (según consigna ABP):              ║
// ║   ① Orientación a Objetos (POO)                          ║
// ║   ② Características ES6+                                 ║
// ║   ③ Eventos y Manipulación del DOM                       ║
// ║   ④ JavaScript Asíncrono (setTimeout / setInterval)      ║
// ║   ⑤ Consumo de APIs + localStorage                       ║
// ╚══════════════════════════════════════════════════════════╝

'use strict'; // ES6: modo estricto — detecta errores silenciosos

// ══════════════════════════════════════════════════════════
//  ① PASO 1: ORIENTACIÓN A OBJETOS (POO)
//
//  "class" en ES6 es la forma moderna de crear objetos
//  con propiedades y métodos. Es como una "plantilla"
//  que describe cómo es cada tarea.
//
//  CONCEPTOS:
//  - constructor()  → se ejecuta al crear un objeto con "new"
//  - this           → se refiere al objeto actual
//  - métodos        → funciones que pertenecen a la clase
// ══════════════════════════════════════════════════════════

class Tarea {
  // El constructor recibe los datos y los guarda en el objeto
  constructor({ descripcion, prioridad = 'media', fechaLimite = null }) {

    // PASO 2 — ES6: usamos const/let, nunca var
    // PASO 2 — ES6: destructuring en los parámetros ({ descripcion, ... })

    this.id           = Date.now();         // id único basado en timestamp
    this.descripcion  = descripcion;        // texto de la tarea
    this.prioridad    = prioridad;          // 'alta' | 'media' | 'baja'
    this.estado       = 'pendiente';        // 'pendiente' | 'completada'
    this.fechaLimite  = fechaLimite;        // fecha como string "YYYY-MM-DD" o null
    this.fechaCreacion = new Date().toLocaleString('es-CL'); // cuándo se creó
  }

  // ── Método: cambiar el estado de la tarea ─────────────
  //  Alterna entre 'pendiente' y 'completada'
  cambiarEstado() {
    this.estado = this.estado === 'pendiente' ? 'completada' : 'pendiente';
  }

  // ── Método: verificar si la tarea está completada ─────
  estaCompletada() {
    return this.estado === 'completada';
  }

  // ── Método: convertir la tarea a objeto plano ─────────
  //  Útil para guardar en JSON / localStorage
  toJSON() {
    // PASO 2 — ES6: spread operator para copiar todas las propiedades
    return { ...this };
  }
}

// ══════════════════════════════════════════════════════════
//  ① PASO 1: CLASE GestorTareas
//
//  Esta clase administra el ARRAY de tareas.
//  Contiene los métodos CRUD:
//  C = Create (agregar)
//  R = Read   (obtener, filtrar)
//  U = Update (cambiar estado)
//  D = Delete (eliminar)
// ══════════════════════════════════════════════════════════

class GestorTareas {
  constructor() {
    // Array donde guardamos todas las instancias de Tarea
    this.tareas = [];
    // Filtro activo actualmente
    this.filtroActual = 'todas';
    // Intervalos activos de cuenta regresiva por id de tarea
    this._intervalos = {};
  }

  // ── C: Agregar tarea ───────────────────────────────────
  //  Recibe datos del formulario, crea una instancia de Tarea
  //  PASO 2 — ES6: arrow function como callback en setTimeout
  agregar(datos) {
    const nuevaTarea = new Tarea(datos); // instanciar la clase Tarea
    this.tareas.push(nuevaTarea);        // agregar al array

    // ④ PASO 4: ASINCRONÍA — setTimeout
    //  Simulamos un "retardo de procesamiento" de 2 segundos.
    //  setTimeout(funcion, milisegundos) ejecuta la función
    //  después del tiempo indicado sin bloquear la página.
    const btnTexto = document.getElementById('btnTexto');
    const btnAgregar = document.getElementById('btnAgregar');
    btnAgregar.disabled = true;
    btnTexto.textContent = '⏳ Procesando...';

    setTimeout(() => {
      // Esto se ejecuta 2 segundos después
      btnAgregar.disabled = false;
      btnTexto.textContent = '＋ Agregar Tarea';
      this.renderizar();
      this.actualizarContadores();

      // ④ PASO 4: Notificación que aparece tras 2 segundos
      this.mostrarNotificacion(`✓ Tarea "${nuevaTarea.descripcion.slice(0,30)}..." agregada`);

      // Si tiene fecha límite, iniciar cuenta regresiva
      if (nuevaTarea.fechaLimite) {
        this.iniciarCuentaRegresiva(nuevaTarea.id);
      }
    }, 2000); // 2000ms = 2 segundos
  }

  // ── R: Obtener tareas filtradas ────────────────────────
  //  PASO 2 — ES6: arrow function dentro de filter
  obtenerFiltradas() {
    if (this.filtroActual === 'todas') return this.tareas;

    // Array.filter() devuelve solo los elementos que cumplen la condición
    return this.tareas.filter(t => t.estado === this.filtroActual);
  }

  // ── U: Cambiar estado de una tarea ────────────────────
  toggleEstado(id) {
    // Array.find() busca el primero que cumpla la condición
    // PASO 2 — ES6: arrow function
    const tarea = this.tareas.find(t => t.id === id);
    if (!tarea) return;

    tarea.cambiarEstado(); // llamar el método de la clase Tarea

    // Detener cuenta regresiva si se completó
    if (tarea.estaCompletada() && this._intervalos[id]) {
      clearInterval(this._intervalos[id]);
      delete this._intervalos[id];
    }

    this.renderizar();
    this.actualizarContadores();
  }

  // ── D: Eliminar tarea ─────────────────────────────────
  //  PASO 2 — ES6: arrow function en filter
  eliminar(id) {
    // Detener countdown si existe
    if (this._intervalos[id]) {
      clearInterval(this._intervalos[id]);
      delete this._intervalos[id];
    }

    // filter() devuelve todas las tareas EXCEPTO la eliminada
    this.tareas = this.tareas.filter(t => t.id !== id);

    this.renderizar();
    this.actualizarContadores();
    this.mostrarNotificacion('🗑 Tarea eliminada');
  }

  // ── Filtrar vista ──────────────────────────────────────
  filtrar(tipo, boton) {
    this.filtroActual = tipo;

    // Actualizar chips de filtro (quitar/poner clase "activo")
    document.querySelectorAll('.filtro-chip').forEach(btn => {
      btn.classList.remove('activo');
    });
    boton.classList.add('activo');

    this.renderizar();
  }

  // ══════════════════════════════════════════════════════
  //  ③ PASO 3: MANIPULACIÓN DEL DOM
  //
  //  renderizar() construye el HTML de la lista dinámicamente.
  //  Cada vez que cambian las tareas, limpiamos la lista y
  //  la reconstruimos desde cero.
  //
  //  CONCEPTOS DOM usados:
  //  - innerHTML       → insertar HTML como string
  //  - createElement() → crear un elemento nuevo
  //  - classList       → manejar clases CSS
  //  - querySelector() → buscar elementos
  // ══════════════════════════════════════════════════════
  renderizar() {
    const lista = document.getElementById('listaTareas');
    const estadoVacio = document.getElementById('estadoVacio');
    const tareasFiltradas = this.obtenerFiltradas();

    // Si no hay tareas, mostrar el estado vacío
    if (tareasFiltradas.length === 0) {
      lista.innerHTML = '';
      estadoVacio.classList.remove('hidden');
      return;
    }

    estadoVacio.classList.add('hidden');

    // Reconstruir la lista con template literals (PASO 2 ES6)
    // PASO 2 — ES6: template literals con ` ` y ${expresion}
    lista.innerHTML = tareasFiltradas.map(tarea => {
      const claseEstado    = tarea.estaCompletada() ? 'completada' : '';
      const claseCheck     = tarea.estaCompletada() ? 'marcado' : '';
      const iconoCheck     = tarea.estaCompletada() ? '✓' : '';
      const clasePrioridad = `prioridad-${tarea.prioridad}`;
      const etiquetaPrioridad = {
        alta: '🔴 Alta',
        media: '🟡 Media',
        baja: '🟢 Baja'
      }[tarea.prioridad];

      // Badge de fecha límite
      const badgeFecha = tarea.fechaLimite
        ? `<span class="badge badge-fecha" id="fecha-${tarea.id}">📅 ${tarea.fechaLimite}</span>`
        : '';

      // Placeholder para el countdown (lo llena setInterval)
      const badgeCountdown = (tarea.fechaLimite && !tarea.estaCompletada())
        ? `<span class="badge badge-countdown" id="countdown-${tarea.id}">⏱ calculando...</span>`
        : '';

      // PASO 2 — ES6: template literal multilínea
      return `
        <li class="tarea-card ${clasePrioridad} ${claseEstado}" id="card-${tarea.id}"
            data-id="${tarea.id}">

          <!-- Checkbox para toggle de estado -->
          <div class="tarea-check ${claseCheck}"
               onclick="gestorTareas.toggleEstado(${tarea.id})"
               title="${tarea.estaCompletada() ? 'Marcar pendiente' : 'Completar'}">
            ${iconoCheck}
          </div>

          <!-- Contenido principal -->
          <div class="tarea-contenido">
            <p class="tarea-desc">${tarea.descripcion}</p>
            <div class="tarea-meta">
              <span class="badge badge-prioridad-${tarea.prioridad}">${etiquetaPrioridad}</span>
              <span class="badge badge-id">#${tarea.id}</span>
              ${badgeFecha}
              ${badgeCountdown}
            </div>
            <p class="tarea-fecha-creacion">Creada: ${tarea.fechaCreacion}</p>
          </div>

          <!-- Botones de acción -->
          <div class="tarea-acciones">
            <button class="btn-accion eliminar"
                    onclick="gestorTareas.eliminar(${tarea.id})"
                    title="Eliminar">✕</button>
          </div>
        </li>
      `;
    }).join(''); // join('') une todos los strings del array en uno solo

    // Reiniciar countdowns para tareas con fecha límite
    tareasFiltradas.forEach(tarea => {
      if (tarea.fechaLimite && !tarea.estaCompletada()) {
        this.iniciarCuentaRegresiva(tarea.id);
      }
    });
  }

  // ── Actualizar contadores del topbar ──────────────────
  actualizarContadores() {
    // PASO 2 — ES6: destructuring para extraer dos valores de filter
    const completadas = this.tareas.filter(t => t.estaCompletada()).length;
    const pendientes  = this.tareas.filter(t => !t.estaCompletada()).length;

    document.getElementById('statTotal').textContent       = this.tareas.length;
    document.getElementById('statCompletadas').textContent = completadas;
    document.getElementById('statPendientes').textContent  = pendientes;
  }

  // ══════════════════════════════════════════════════════
  //  ④ PASO 4: JAVASCRIPT ASÍNCRONO — setInterval
  //
  //  iniciarCuentaRegresiva() usa setInterval() para
  //  actualizar el badge de cuenta regresiva cada segundo.
  //
  //  setInterval(funcion, intervalo)
  //  → ejecuta la función cada X milisegundos
  //  clearInterval(id)
  //  → detiene el intervalo
  // ══════════════════════════════════════════════════════
  iniciarCuentaRegresiva(tareaId) {
    // Limpiar intervalo anterior si existía (evitar duplicados)
    if (this._intervalos[tareaId]) {
      clearInterval(this._intervalos[tareaId]);
    }

    const tarea = this.tareas.find(t => t.id === tareaId);
    if (!tarea || !tarea.fechaLimite) return;

    // setInterval ejecuta la función cada 1000ms (1 segundo)
    this._intervalos[tareaId] = setInterval(() => {
      const badge = document.getElementById(`countdown-${tareaId}`);
      if (!badge) {
        // El elemento ya no existe → detener el intervalo
        clearInterval(this._intervalos[tareaId]);
        return;
      }

      // Calcular tiempo restante
      const ahora      = new Date();
      const limite     = new Date(tarea.fechaLimite + 'T23:59:59');
      const diferencia = limite - ahora; // milisegundos de diferencia

      if (diferencia <= 0) {
        badge.textContent = '⚠ VENCIDA';
        clearInterval(this._intervalos[tareaId]);
        return;
      }

      // Convertir milisegundos a días, horas, minutos
      const dias   = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas  = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins   = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

      badge.textContent = `⏱ ${dias}d ${horas}h ${mins}m`;
    }, 1000); // cada 1 segundo
  }

  // ══════════════════════════════════════════════════════
  //  ④ PASO 4: Notificación con setTimeout
  //
  //  Muestra un mensaje y lo oculta automáticamente
  //  después de 3 segundos usando setTimeout.
  // ══════════════════════════════════════════════════════
  mostrarNotificacion(mensaje) {
    const notif = document.getElementById('notificacion');
    const texto = document.getElementById('notificacionTexto');

    texto.textContent = mensaje;
    notif.classList.remove('hidden');

    // setTimeout: ocultar la notificación tras 3 segundos
    setTimeout(() => {
      notif.classList.add('hidden');
    }, 3000);
  }

  // ══════════════════════════════════════════════════════
  //  ⑤ PASO 5: CONSUMO DE API — fetch()
  //
  //  cargarDesdeAPI() hace una petición GET a JSONPlaceholder
  //  y convierte los todos en instancias de Tarea.
  //
  //  async/await + try/catch para manejar la asincronía.
  // ══════════════════════════════════════════════════════
  async cargarDesdeAPI() {
    const btn = document.getElementById('btnCargarAPI');
    btn.disabled = true;
    btn.textContent = '↓ Cargando...';

    try {
      // fetch() hace la petición HTTP — await espera la respuesta
      const respuesta = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

      // Verificar que la respuesta sea exitosa (código 200-299)
      if (!respuesta.ok) {
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }

      // .json() convierte el cuerpo de la respuesta a un objeto JS
      const datos = await respuesta.json();

      // Mapear los datos de la API al formato de nuestra clase Tarea
      // PASO 2 — ES6: arrow function + destructuring
      const nuevasTareas = datos.map(({ title, completed }) => {
        const t = new Tarea({ descripcion: title, prioridad: 'baja' });
        if (completed) t.cambiarEstado();
        return t;
      });

      // PASO 2 — ES6: spread operator para combinar arrays
      this.tareas = [...this.tareas, ...nuevasTareas];

      this.renderizar();
      this.actualizarContadores();
      this.mostrarNotificacion(`✓ ${nuevasTareas.length} tareas cargadas desde la API`);

    } catch (error) {
      // catch atrapa cualquier error: de red, de parseo, etc.
      this.mostrarNotificacion(`✕ Error al cargar API: ${error.message}`);
      console.error('Error en cargarDesdeAPI:', error);

    } finally {
      // finally SIEMPRE se ejecuta — reactivar el botón
      btn.disabled = false;
      btn.textContent = '↓ Cargar desde API';
    }
  }

  // ══════════════════════════════════════════════════════
  //  ⑤ PASO 5: LOCALSTORAGE — guardar
  //
  //  localStorage guarda datos en el navegador de forma
  //  persistente (sobreviven al cerrar la pestaña).
  //
  //  Solo almacena strings → usamos JSON.stringify/parse.
  // ══════════════════════════════════════════════════════
  guardarEnStorage() {
    // JSON.stringify convierte el array de objetos a string
    const datos = JSON.stringify(this.tareas.map(t => t.toJSON()));
    localStorage.setItem('taskflow_tareas', datos);
    this.mostrarNotificacion(`💾 ${this.tareas.length} tareas guardadas en Storage`);
  }

  // ══════════════════════════════════════════════════════
  //  ⑤ PASO 5: LOCALSTORAGE — recuperar
  // ══════════════════════════════════════════════════════
  cargarDesdeStorage() {
    const datos = localStorage.getItem('taskflow_tareas');

    if (!datos) {
      this.mostrarNotificacion('📂 No hay datos en Storage');
      return;
    }

    // JSON.parse convierte el string de vuelta a array de objetos
    const objetos = JSON.parse(datos);

    // Reconstruir instancias de Tarea desde los objetos planos
    this.tareas = objetos.map(obj => {
      const t = new Tarea({ descripcion: obj.descripcion, prioridad: obj.prioridad, fechaLimite: obj.fechaLimite });
      t.id            = obj.id;
      t.estado        = obj.estado;
      t.fechaCreacion = obj.fechaCreacion;
      return t;
    });

    this.renderizar();
    this.actualizarContadores();
    this.mostrarNotificacion(`📂 ${this.tareas.length} tareas recuperadas de Storage`);
  }

  // Limpiar todas las tareas
  limpiarTodo() {
    if (this.tareas.length === 0) return;
    // Detener todos los intervalos
    Object.keys(this._intervalos).forEach(id => clearInterval(this._intervalos[id]));
    this._intervalos = {};
    this.tareas = [];
    this.renderizar();
    this.actualizarContadores();
    this.mostrarNotificacion('🗑 Todas las tareas eliminadas');
  }
}

// ══════════════════════════════════════════════════════════
//  INSTANCIAR EL GESTOR
//
//  "new GestorTareas()" crea un objeto usando la clase.
//  Lo guardamos en "gestorTareas" (con let, ES6).
//  La variable es global para que el HTML pueda usarla.
// ══════════════════════════════════════════════════════════
const gestorTareas = new GestorTareas();

// ══════════════════════════════════════════════════════════
//  ③ PASO 3: EVENTOS DEL DOM
//
//  addEventListener() "escucha" eventos del usuario.
//  Se registran cuando la página termina de cargar.
// ══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // ── Evento submit del formulario ───────────────────────
  //  "submit" se dispara al hacer clic en el botón o Enter
  const formTarea = document.getElementById('formTarea');
  formTarea.addEventListener('submit', (evento) => {

    // preventDefault() evita que el formulario recargue la página
    evento.preventDefault();

    // Leer valores de los campos
    const descripcion = document.getElementById('inputDescripcion').value.trim();
    const prioridad   = document.getElementById('selectPrioridad').value;
    const fechaLimite = document.getElementById('inputFecha').value || null;

    // Validación básica
    if (!descripcion) {
      document.getElementById('inputDescripcion').focus();
      return;
    }

    // Agregar la tarea al gestor
    // PASO 2 — ES6: shorthand property (descripcion en vez de descripcion: descripcion)
    gestorTareas.agregar({ descripcion, prioridad, fechaLimite });

    // Limpiar el formulario
    formTarea.reset();
    document.getElementById('charCounter').textContent = '0 / 120';
  });

  // ── Evento keyup: contador de caracteres ───────────────
  //  "keyup" se dispara cada vez que el usuario suelta una tecla
  const inputDesc = document.getElementById('inputDescripcion');
  inputDesc.addEventListener('keyup', () => {
    const longitud = inputDesc.value.length;
    const contador = document.getElementById('charCounter');
    contador.textContent = `${longitud} / 120`;

    // Cambiar color si se acerca al límite
    if (longitud > 100) {
      contador.classList.add('alerta');
    } else {
      contador.classList.remove('alerta');
    }

    // Limitar a 120 caracteres
    if (longitud > 120) {
      inputDesc.value = inputDesc.value.slice(0, 120);
    }
  });

  // ── Evento mouseover en la lista ───────────────────────
  //  "mouseover" se dispara al pasar el mouse sobre un elemento
  //  Usamos "delegación de eventos": un solo listener en el padre
  const listaTareas = document.getElementById('listaTareas');
  listaTareas.addEventListener('mouseover', (evento) => {
    const card = evento.target.closest('.tarea-card');
    if (card) {
      // La animación CSS se activa con :hover, pero aquí podemos
      // agregar lógica adicional si necesitamos
      card.style.cursor = 'default';
    }
  });

  // ④ PASO 4: setInterval para el reloj del topbar
  //  Actualiza la hora cada segundo
  const relojEl = document.getElementById('reloj');
  setInterval(() => {
    const ahora = new Date();
    relojEl.textContent = ahora.toLocaleTimeString('es-CL');
  }, 1000);

  // Renderizar inicial (lista vacía)
  gestorTareas.renderizar();
  gestorTareas.actualizarContadores();

  // Intentar cargar desde Storage automáticamente al inicio
  const hayStorage = localStorage.getItem('taskflow_tareas');
  if (hayStorage) {
    gestorTareas.cargarDesdeStorage();
  }
});