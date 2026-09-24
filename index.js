require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
Client,
GatewayIntentBits,
Collection,
REST,
Routes,
Events
} = require("discord.js");

// ========================================
// CONFIGURACIÓN
// ========================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
console.error("❌ Falta DISCORD_TOKEN en las variables de entorno.");
process.exit(1);
}

if (!CLIENT_ID) {
console.error("❌ Falta CLIENT_ID en las variables de entorno.");
process.exit(1);
}

// ========================================
// CLIENTE DISCORD
// ========================================

const client = new Client({
intents: [
GatewayIntentBits.Guilds,
GatewayIntentBits.GuildMembers,
GatewayIntentBits.GuildMessages,
GatewayIntentBits.MessageContent
]
});

client.commands = new Collection();

// ========================================
// BASE DE DATOS
// ========================================

const DB_PATH = path.join(__dirname, "database.json");

function cargarDB() {
try {
if (!fs.existsSync(DB_PATH)) {
fs.writeFileSync(DB_PATH, "{}");
}

const data = fs.readFileSync(DB_PATH, "utf8");

return JSON.parse(data || "{}");

} catch (error) {
console.error("❌ Error leyendo database.json:", error);
return {};
}
}

function guardarDB(data) {
try {
fs.writeFileSync(
DB_PATH,
JSON.stringify(data, null, 2),
"utf8"
);

return true;

} catch (error) {
console.error("❌ Error guardando database.json:", error);
return false;
}
}

// ========================================
// CARGAR COMANDOS
// ========================================

const commandsPath = path.join(__dirname, "commands");

const commands = [];

if (fs.existsSync(commandsPath)) {

const commandFiles = fs
.readdirSync(commandsPath)
.filter(file => file.endsWith(".js"));

for (const file of commandFiles) {

try {

  const filePath = path.join(commandsPath, file);

  const commandModule = require(filePath);

  const commandList = Array.isArray(commandModule)
    ? commandModule
    : [commandModule];

  for (const command of commandList) {

    if (!command.data || !command.execute) {
      console.warn(`⚠️ Comando inválido en ${file}`);
      continue;
    }

    const commandName = command.data.name;

    client.commands.set(commandName, command);

    commands.push(command.data.toJSON());

    console.log(`✅ Comando cargado: /${commandName}`);
  }

} catch (error) {

  console.error(`❌ Error cargando ${file}:`, error);

}

}

} else {

console.warn("⚠️ No existe la carpeta commands.");

}

// ========================================
// REGISTRAR COMANDOS
// ========================================

async function registrarComandos() {

try {

console.log("🔄 Registrando comandos globales...");

const rest = new REST({
  version: "10"
}).setToken(TOKEN);

await rest.put(
  Routes.applicationCommands(CLIENT_ID),
  {
    body: commands
  }
);

console.log(`✅ ${commands.length} comandos registrados.`);

} catch (error) {

console.error("❌ Error registrando comandos:", error);

}

}

// ========================================
// BOT LISTO
// ========================================

client.once(Events.ClientReady, async readyClient => {

console.log("");
console.log("========================================");
console.log("🤖 DARK FF V1");
console.log("========================================");

console.log("✅ Bot: ${readyClient.user.tag}");
console.log("🌐 Servidores: ${readyClient.guilds.cache.size}");
console.log("📜 Comandos: ${client.commands.size}");
console.log("🏓 Ping: ${readyClient.ws.ping}ms");

console.log("========================================");

readyClient.user.setPresence({
activities: [
{
name: "/ayuda | DARK FF V1",
type: 0
}
],
status: "online"
});

await registrarComandos();

});

// ========================================
// COMANDOS SLASH
// ========================================

client.on(Events.InteractionCreate, async interaction => {

if (!interaction.isChatInputCommand()) return;

const command = client.commands.get(
interaction.commandName
);

if (!command) {

console.warn(
  `⚠️ No se encontró /${interaction.commandName}`
);

return;

}

try {

await command.execute(
  interaction,
  client
);

} catch (error) {

console.error(
  `❌ Error ejecutando /${interaction.commandName}:`,
  error
);

const mensaje = {
  content: "❌ Ocurrió un error al ejecutar este comando.",
  ephemeral: true
};

if (
  interaction.replied ||
  interaction.deferred
) {

  await interaction
    .followUp(mensaje)
    .catch(() => {});

} else {

  await interaction
    .reply(mensaje)
    .catch(() => {});

}

}

});

// ========================================
// 👋 BIENVENIDA AUTOMÁTICA
// ========================================

client.on(Events.GuildMemberAdd, async member => {

try {

const db = cargarDB();

const configuracion =
  db[member.guild.id]?.bienvenida;

if (!configuracion) {
  return;
}

if (!configuracion.activa) {
  return;
}

if (!configuracion.canal) {
  return;
}

const canal = member.guild.channels.cache.get(
  configuracion.canal
);

if (!canal) {

  console.warn(
    `⚠️ No se encontró el canal de bienvenida en ${member.guild.name}`
  );

  return;

}

let mensaje =
  configuracion.mensaje ||
  "¡Bienvenido {usuario}! 👋";

// Reemplazar variables

mensaje = mensaje
  .replace(/{usuario}/g, `<@${member.id}>`)
  .replace(/{nombre}/g, member.user.username)
  .replace(/{servidor}/g, member.guild.name)
  .replace(
    /{miembros}/g,
    member.guild.memberCount.toString()
  );

// Enviar mensaje

await canal.send({
  content: mensaje
});

console.log(
  `👋 Bienvenida enviada a ${member.user.tag} en ${member.guild.name}`
);

} catch (error) {

console.error(
  "❌ Error enviando bienvenida:",
  error
);

}

});

// ========================================
// 🚪 DESPEDIDA AUTOMÁTICA
// ========================================

client.on(Events.GuildMemberRemove, async member => {

try {

const db = cargarDB();

const configuracion =
  db[member.guild.id]?.despedida;

if (!configuracion) {
  return;
}

if (!configuracion.activa) {
  return;
}

if (!configuracion.canal) {
  return;
}

const canal = member.guild.channels.cache.get(
  configuracion.canal
);

if (!canal) {
  return;
}

let mensaje =
  configuracion.mensaje ||
  "Adiós {usuario}. 👋";

mensaje = mensaje
  .replace(/{usuario}/g, member.user.username)
  .replace(/{nombre}/g, member.user.username)
  .replace(/{servidor}/g, member.guild.name)
  .replace(
    /{miembros}/g,
    member.guild.memberCount.toString()
  );

await canal.send({
  content: mensaje
});

console.log(
  `🚪 Despedida enviada por ${member.user.tag} en ${member.guild.name}`
);

} catch (error) {

console.error(
  "❌ Error enviando despedida:",
  error
);

}

});

// ========================================
// 🌐 SERVIDOR WEB PARA RAILWAY
// ========================================

const server = http.createServer((req, res) => {

// ======================================
// CORS
// ======================================

res.setHeader(
"Access-Control-Allow-Origin",
"*"
);

res.setHeader(
"Access-Control-Allow-Methods",
"GET, POST, OPTIONS"
);

res.setHeader(
"Access-Control-Allow-Headers",
"Content-Type"
);

// ======================================
// OPTIONS
// ======================================

if (req.method === "OPTIONS") {

res.writeHead(204);
res.end();

return;

}

// ======================================
// PÁGINA PRINCIPAL
// ======================================

if (
req.method === "GET" &&
req.url === "/"
) {

const htmlPath =
  path.join(__dirname, "index.html");

if (!fs.existsSync(htmlPath)) {

  res.writeHead(404, {
    "Content-Type":
      "text/plain; charset=utf-8"
  });

  res.end(
    "No se encontró index.html"
  );

  return;
}

const html =
  fs.readFileSync(
    htmlPath,
    "utf8"
  );

res.writeHead(200, {
  "Content-Type":
    "text/html; charset=utf-8"
});

res.end(html);

return;

}

// ======================================
// ESTADO
// ======================================

if (
req.method === "GET" &&
req.url === "/api/status"
) {

res.writeHead(200, {
  "Content-Type":
    "application/json; charset=utf-8"
});

res.end(
  JSON.stringify({
    online: true,
    bot: "DARK FF V1",
    panel: true,
    servers:
      client.guilds.cache.size,
    commands:
      client.commands.size,
    ping:
      client.ws.ping,
    uptime:
      client.uptime,
    timestamp:
      Date.now()
  })
);

return;

}

// ======================================
// OBTENER BIENVENIDA
// ======================================

if (
req.method === "GET" &&
req.url.startsWith(
"/api/bienvenida/"
)
) {

const guildId =
  req.url.split("/").pop();

const db = cargarDB();

const bienvenida =
  db[guildId]?.bienvenida || {
    activa: false,
    canal: "",
    mensaje: "",
    imagen: ""
  };

res.writeHead(200, {
  "Content-Type":
    "application/json; charset=utf-8"
});

res.end(
  JSON.stringify(bienvenida)
);

return;

}

// ======================================
// GUARDAR BIENVENIDA
// ======================================

if (
req.method === "POST" &&
req.url === "/api/bienvenida"
) {

let body = "";

req.on("data", chunk => {
  body += chunk.toString();
});

req.on("end", () => {

  try {

    const data =
      JSON.parse(body || "{}");

    const {
      guildId,
      channelId,
      message,
      image
    } = data;

    if (!guildId) {

      res.writeHead(400, {
        "Content-Type":
          "application/json; charset=utf-8"
      });

      res.end(
        JSON.stringify({
          success: false,
          message:
            "Falta el ID del servidor."
        })
      );

      return;
    }

    const db = cargarDB();

    if (!db[guildId]) {
      db[guildId] = {};
    }

    db[guildId].bienvenida = {

      activa: true,

      canal:
        channelId || "",

      mensaje:
        message ||
        "¡Bienvenido {usuario}! 👋",

      imagen:
        image || ""

    };

    const guardado =
      guardarDB(db);

    res.writeHead(200, {
      "Content-Type":
        "application/json; charset=utf-8"
    });

    res.end(
      JSON.stringify({
        success: guardado,

        message: guardado
          ? "✅ Bienvenida guardada correctamente."
          : "❌ No se pudo guardar."
      })
    );

  } catch (error) {

    console.error(
      "❌ Error en API bienvenida:",
      error
    );

    res.writeHead(400, {
      "Content-Type":
        "application/json; charset=utf-8"
    });

    res.end(
      JSON.stringify({
        success: false,
        message:
          "Datos inválidos."
      })
    );

  }

});

return;

}

// ======================================
// OBTENER DESPEDIDA
// ======================================

if (
req.method === "GET" &&
req.url.startsWith(
"/api/despedida/"
)
) {

const guildId =
  req.url.split("/").pop();

const db = cargarDB();

const despedida =
  db[guildId]?.despedida || {
    activa: false,
    canal: "",
    mensaje: ""
  };

res.writeHead(200, {
  "Content-Type":
    "application/json; charset=utf-8"
});

res.end(
  JSON.stringify(despedida)
);

return;

}

// ======================================
// GUARDAR DESPEDIDA
// ======================================

if (
req.method === "POST" &&
req.url === "/api/despedida"
) {

let body = "";

req.on("data", chunk => {
  body += chunk.toString();
});

req.on("end", () => {

  try {

    const data =
      JSON.parse(body || "{}");

    const {
      guildId,
      channelId,
      message
    } = data;

    if (!guildId) {

      res.writeHead(400, {
        "Content-Type":
          "application/json; charset=utf-8"
      });

      res.end(
        JSON.stringify({
          success: false,
          message:
            "Falta el ID del servidor."
        })
      );

      return;
    }

    const db = cargarDB();

    if (!db[guildId]) {
      db[guildId] = {};
    }

    db[guildId].despedida = {

      activa: true,

      canal:
        channelId || "",

      mensaje:
        message ||
        "Adiós {usuario}. 👋"

    };

    const guardado =
      guardarDB(db);

    res.writeHead(200, {
      "Content-Type":
        "application/json; charset=utf-8"
    });

    res.end(
      JSON.stringify({
        success: guardado,

        message: guardado
          ? "✅ Despedida guardada correctamente."
          : "❌ No se pudo guardar."
      })
    );

  } catch (error) {

    console.error(
      "❌ Error en API despedida:",
      error
    );

    res.writeHead(400, {
      "Content-Type":
        "application/json; charset=utf-8"
    });

    res.end(
      JSON.stringify({
        success: false,
        message:
          "Datos inválidos."
      })
    );

  }

});

return;

}

// ======================================
// RUTA NO ENCONTRADA
// ======================================

res.writeHead(404, {
"Content-Type":
"application/json; charset=utf-8"
});

res.end(
JSON.stringify({
success: false,
message:
"Ruta no encontrada."
})
);

});

// ========================================
// INICIAR SERVIDOR WEB
// ========================================

server.listen(
PORT,
"0.0.0.0",
() => {

console.log(
  `🌐 Panel DARK FF V1: puerto ${PORT}`
);

console.log(
  "🚀 Servidor web iniciado correctamente."
);

}
);

// ========================================
// INICIAR BOT
// ========================================

client.login(TOKEN).catch(error => {

console.error(
"❌ No se pudo iniciar sesión en Discord:"
);

console.error(error);

});

// ========================================
// ERRORES
// ========================================

process.on(
"unhandledRejection",
error => {

console.error(
  "❌ Unhandled Rejection:",
  error
);

}
);

process.on(
"uncaughtException",
error => {

console.error(
  "❌ Uncaught Exception:",
  error
);

}
);
