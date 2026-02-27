const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// pool de conexiones
const db = mysql.createPool({
  host: "localhost",
  database: "tareas",
  user: "tareas_user",
  password: "root",
  waitForConnections: true,
  connectionLimit: 10,
});

app.get("/health", (req, res) => res.json({ ok: true }));

// listar-de-tareas
app.get("/api/tareas", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, tarea, estado FROM tabla_tareas ORDER BY id DESC");
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener tareas" });
  }
});

app.put("/api/tareas/todas", async (req, res) => {
  try {
    const { ids } = req.body;
    const [result] = await db.query(
      "UPDATE tabla_tareas SET estado = 1 WHERE id IN (?)",
      [ids]
    );
    res.status(200).json({
      message: "Tareas actualizadas",
      updated: result.affectedRows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar tareas" });
  }
});

//obtener-tarea-por-id
app.get("/api/tareas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [rows] = await db.query(
      "SELECT id, tarea, estado FROM tabla_tareas WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la tarea" });
  }
});

//crear
app.post("/api/tareas", async (req, res) => {
  try {
    const { tarea, estado } = req.body;

    if (typeof tarea !== "string" || tarea.trim().length === 0) {
      return res.status(400).json({ message: "La 'tarea' es obligatoria y debe ser texto" });
    }

    const estadoBool = estado === true || estado === 1 ? 1 : 0;

    const [result] = await db.query(
      "INSERT INTO tabla_tareas (tarea, estado) VALUES (?, ?)",
      [tarea.trim(), estadoBool]
    );

    res.status(201).json({
      id: result.insertId,
      tarea: tarea.trim(),
      estado: !!estadoBool,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear tarea" });
  }
});

//actualizar
app.put("/api/tareas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const { tarea, estado } = req.body;

    if (tarea === undefined && estado === undefined) {
      return res.status(400).json({ message: "Envía 'tarea' y/o 'estado' para actualizar" });
    }

    const campos = [];
    const valores = [];

    if (tarea !== undefined) {
      if (typeof tarea !== "string" || tarea.trim().length === 0) {
        return res.status(400).json({ message: "La 'tarea' debe ser texto no vacío" });
      }
      campos.push("tarea = ?");
      valores.push(tarea.trim());
    }

    if (estado !== undefined) {
      const estadoBool = estado === true || estado === 1 ? 1 : 0;
      campos.push("estado = ?");
      valores.push(estadoBool);
    }

    valores.push(id);

    const [result] = await db.query(
      `UPDATE tabla_tareas SET ${campos.join(", ")} WHERE id = ?`,
      valores
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    const [rows] = await db.query(
      "SELECT id, tarea, estado FROM tabla_tareas WHERE id = ?",
      [id]
    );

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar tarea" });
  }
});



//eliminar
app.delete("/api/tareas/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const [result] = await db.query("DELETE FROM tabla_tareas WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Tarea no encontrada" });
    }

    res.status(200).json({ message: "Tarea eliminada", id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar tarea" });
  }
});





app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});