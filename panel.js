const fs = require("fs");
const path = require("path");

const express = require("express");

const app = express();
const PORT = process.env.PANEL_PORT || 3001;

const DB_PATH = path.join(__dirname, "database.json");

// ================================
// BASE DE DATOS
// ================================

function cargarDB() {
try {
if (!fs.existsSync(DB_PATH)) {
fs.writeFileSync(DB_PATH, "{}");
}

const data = fs.readFileSync(DB_PATH, "utf8");
return JSON.parse(data || "{}");

} catch (error) {
console.error("Error leyendo database.json:", error);
return {};
}
}

function guardarDB(data) {
fs.writeFileSync(
DB_PATH,
JSON.stringify(data, null, 2),
"utf8"
);
}

// ================================
// CONFIGURACIÓN EXPRESS
// ================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Página principal
app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "index.html"));
});

// ================================
// GUARDAR BIENVENIDA
// ================================

app.post("/api/bienvenida", (req, res) => {
try {
const {
guildId,
channelId,
message,
image
} = req.body;

if (!guildId) {
  return res.status(400).json({
    success: false,
    message: "Falta el ID del servidor."
  });
}

const db = cargarDB();

if (!db[guildId]) {
  db[guildId] = {};
}

db[guildId].bienvenida = {
  activa: true,
  canal: channelId || "",
  mensaje: message || "¡Bienvenido {usuario}!",
  imagen: image || ""
};

guardarDB(db);

res.json({
  success: true,
  message: "Configuración de bienvenida guardada."
});

} catch (error) {
console.error(error);

res.status(500).json({
  success: false,
  message: "No se pudo guardar la configuración."
});

}
});

// ================================
// OBTENER BIENVENIDA
// ================================

app.get("/api/bienvenida/:guildId", (req, res) => {
const db = cargarDB();
const guildId = req.params.guildId;

const bienvenida = db[guildId]?.bienvenida || {
activa: false,
canal: "",
mensaje: "",
imagen: ""
};

res.json(bienvenida);
});

// ================================
// GUARDAR DESPEDIDA
// ================================

app.post("/api/despedida", (req, res) => {
try {
const {
guildId,
channelId,
message
} = req.body;

if (!guildId) {
  return res.status(400).json({
    success: false,
    message: "Falta el ID del servidor."
  });
}

const db = cargarDB();

if (!db[guildId]) {
  db[guildId] = {};
}

db[guildId].despedida = {
  activa: true,
  canal: channelId || "",
  mensaje: message || "Adiós {usuario}."
};

guardarDB(db);

res.json({
  success: true,
  message: "Configuración de despedida guardada."
});

} catch (error) {
console.error(error);

res.status(500).json({
  success: false,
  message: "No se pudo guardar la configuración."
});

}
});

// ================================
// OBTENER DESPEDIDA
// ================================

app.get("/api/despedida/:guildId", (req, res) => {
const db = cargarDB();
const guildId = req.params.guildId;

const despedida = db[guildId]?.despedida || {
activa: false,
canal: "",
mensaje: ""
};

res.json(despedida);
});

// ================================
// ESTADO DEL PANEL
// ================================

app.get("/api/status", (req, res) => {
res.json({
online: true,
bot: "DARK FF V1",
panel: true,
timestamp: Date.now()
});
});

// ================================
// INICIAR PANEL
// ================================
