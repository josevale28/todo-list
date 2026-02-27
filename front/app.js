const API = "http://localhost:3000/api/tareas";

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const markAllBtn = document.getElementById("markAllBtn");

const taskList = document.getElementById("taskList");
const vacioList = document.getElementById("vacio-list");
const counter = document.getElementById("counter");

let tareas = [];



async function obtenerTareas() {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Error al listar");
  return res.json();
}

async function crearTarea(texto) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tarea: texto, estado: false })
  });
  if (!res.ok) throw new Error("Error al crear");
  return res.status(400).json();
}

async function actualizarTarea(id, datos) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });
  if (!res.ok) throw new Error("Error al actualizar");
  return res.status(400).json();
}

async function eliminarTarea(id) {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar");
}


function render() {
  taskList.innerHTML = "";

  if (tareas.length === 0) {
    vacioList.style.display = "block";
    counter.textContent = "0 artículos";
    return;
  }

  vacioList.style.display = "none";

  const pendientes = tareas.filter(t => !t.estado).length;
  counter.textContent = `${pendientes} artículo(s) restante(s)`;

  for (const tarea of tareas) {
    const li = document.createElement("li");
    li.className = `item ${tarea.estado ? "done" : ""}`;
    li.dataset.id = tarea.id;

    li.innerHTML = `
      <div class="item-left">
        <span class="dot"></span>

        <label class="check-wrap">
          <input type="checkbox" class="chk" ${tarea.estado ? "checked" : ""}>
          <span class="text"></span>
        </label>
      </div>

      <div class="actions">
        <button class="icon-btn delete-btn">✕</button>
      </div>
    `;

    li.querySelector(".text").textContent = tarea.tarea;

    li.querySelector(".chk").addEventListener("change", async (e) => {
      const nuevoEstado = e.target.checked;
      const actualizada = await actualizarTarea(tarea.id, { estado: nuevoEstado });
      tareas = tareas.map(t => t.id === tarea.id ? actualizada : t);
      render();
    });

    //eliminar
    li.querySelector(".delete-btn").addEventListener("click", async () => {
      if (!confirm("¿Deseas eliminar esta tarea?")) return;
      await eliminarTarea(tarea.id);
      tareas = tareas.filter(t => t.id !== tarea.id);
      render();
    });

    // Doble click para editar
    li.querySelector(".text").addEventListener("dblclick", async () => {
      const nuevoTexto = prompt("Editar tarea:", tarea.tarea);
      if (!nuevoTexto || !nuevoTexto.trim()) return;

      const actualizada = await actualizarTarea(tarea.id, { tarea: nuevoTexto.trim() });
      tareas = tareas.map(t => t.id === tarea.id ? actualizada : t);
      render();
    });

    taskList.appendChild(li);
  }
}


//eventos
async function agregar() {
  const texto = taskInput.value.trim();
  if (!texto) return;
  const nueva = await crearTarea(texto);
  tareas = [nueva, ...tareas];
  taskInput.value = "";
  render();
}

addBtn.addEventListener("click", agregar);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregar();
});

markAllBtn.addEventListener("click", async () => {
  const pendientes = tareas.filter(t => !t.estado);

  for (const t of pendientes) {
    const actualizada = await actualizarTarea(t.id, { estado: true });
    tareas = tareas.map(x => x.id === t.id ? actualizada : x);
  }

  render();
});

async function init() {
  try {
    tareas = await obtenerTareas();
    render();
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar con el backend");
  }
}

init();