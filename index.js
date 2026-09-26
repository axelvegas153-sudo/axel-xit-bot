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

// ======================================================
// AXEL XIT
// Bot público de Discord
// ======================================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN en el archivo .env");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en el archivo .env");
  process.exit(1);
}

// ======================================================
// CLIENTE DE DISCORD
// ======================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ======================================================
// COLECCIONES
// ======================================================

client.commands = new Collection();
client.commandFiles = new Map();
client.eventModules = [];

// ======================================================
// CARGAR COMANDOS AUTOMÁTICAMENTE
// ======================================================

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.error("❌ No existe la carpeta commands/");
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    delete require.cache[require.resolve(filePath)];

    const command = require(filePath);

    if (!command.data || !command.execute) {
      console.warn(
        `⚠️ ${file} no tiene data o execute. Se omitirá.`
      );
      continue;
    }

    const commandName = command.data.name;

    if (client.commands.has(commandName)) {
      console.warn(
        `⚠️ Comando duplicado detectado: /${commandName}`
      );
      console.warn(`   Archivo ignorado: ${file}`);
      continue;
    }

    client.commands.set(commandName, command);
    client.commandFiles.set(commandName, file);

    // Guardamos módulos que tienen eventos especiales
    if (
      typeof command.messageCreate === "function" ||
      typeof command.guildMemberAdd === "function" ||
      typeof command.guildMemberRemove === "function" ||
      typeof command.handleReaction === "function"
    ) {
      client.eventModules.push(command);
    }

    console.log(`✅ Comando cargado: /${commandName}`);
  } catch (error) {
    console.error(`❌ Error cargando ${file}:`);
    console.error(error);
  }
}

console.log(
  `\n📦 Total de comandos cargados: ${client.commands.size}\n`
);

// ======================================================
// REGISTRAR SLASH COMMANDS
// ======================================================

async function registrarComandos() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  const commands = [];

  for (const command of client.commands.values()) {
    commands.push(command.data.toJSON());
  }

  try {
    console.log("🔄 Registrando comandos de Axel XIT...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log(
      `✅ ${commands.length} comandos registrados correctamente.`
    );
  } catch (error) {
    console.error("❌ Error registrando comandos:");
    console.error(error);
  }
}

// ======================================================
// BOT LISTO
// ======================================================

client.once(Events.ClientReady, async readyClient => {
  console.log("");
  console.log("======================================");
  console.log("        AXEL XIT CONECTADO");
  console.log("======================================");
  console.log(`🤖 Bot: ${readyClient.user.tag}`);
  console.log(`🆔 ID: ${readyClient.user.id}`);
  console.log(`🌐 Servidores: ${readyClient.guilds.cache.size}`);
  console.log(`📦 Comandos: ${client.commands.size}`);
  console.log("======================================");
  console.log("");

  readyClient.user.setPresence({
    activities: [
      {
        name: `${client.commands.size} comandos | /help`,
        type: 0
      }
    ],
    status: "online"
  });

  await registrarComandos();
});

// ======================================================
// INTERACCIONES
// ======================================================

client.on(Events.InteractionCreate, async interaction => {

  // ----------------------------------------------------
  // SLASH COMMANDS
  // ----------------------------------------------------

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(
      interaction.commandName
    );

    if (!command) {
      console.warn(
        `⚠️ Comando no encontrado: /${interaction.commandName}`
      );

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: "❌ Ese comando ya no está disponible.",
          ephemeral: true
        }).catch(() => {});
      }

      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(
        `❌ Error ejecutando /${interaction.commandName}:`
      );

      console.error(error);

      const mensaje =
        "❌ Ocurrió un error al ejecutar este comando.";

      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: mensaje
        }).catch(() => {});
      } else {
        await interaction.reply({
          content: mensaje,
          ephemeral: true
        }).catch(() => {});
      }
    }
  }

  // ----------------------------------------------------
  // BOTONES
  // ----------------------------------------------------

  if (interaction.isButton()) {
    console.log(
      `🔘 Botón utilizado: ${interaction.customId}`
    );

    // Los sistemas que necesiten botones
    // podrán conectarse aquí posteriormente.
  }

  // ----------------------------------------------------
  // MENÚS SELECT
  // ----------------------------------------------------

  if (interaction.isStringSelectMenu()) {
    console.log(
      `📋 Menú utilizado: ${interaction.customId}`
    );

    // Los sistemas que necesiten menús
    // podrán conectarse aquí posteriormente.
  }
});

// ======================================================
// MENSAJES
// ======================================================

client.on(Events.MessageCreate, async message => {

  if (message.author.bot) return;

  for (const module of client.eventModules) {

    if (typeof module.messageCreate !== "function") {
      continue;
    }

    try {
      await module.messageCreate(message);
    } catch (error) {
      console.error(
        "❌ Error en un módulo messageCreate:"
      );

      console.error(error);
    }
  }
});

// ======================================================
// NUEVO MIEMBRO
// ======================================================

client.on(Events.GuildMemberAdd, async member => {

  for (const module of client.eventModules) {

    if (typeof module.guildMemberAdd !== "function") {
      continue;
    }

    try {
      await module.guildMemberAdd(member);
    } catch (error) {
      console.error(
        "❌ Error en guildMemberAdd:"
      );

      console.error(error);
    }
  }
});

// ======================================================
// MIEMBRO SALE
// ======================================================

client.on(Events.GuildMemberRemove, async member => {

  for (const module of client.eventModules) {

    if (typeof module.guildMemberRemove !== "function") {
      continue;
    }

    try {
      await module.guildMemberRemove(member);
    } catch (error) {
      console.error(
        "❌ Error en guildMemberRemove:"
      );

      console.error(error);
    }
  }
});

// ======================================================
// REACCIONES
// ======================================================

client.on(
  Events.MessageReactionAdd,
  async (reaction, user) => {

    if (user.bot) return;

    // Soporte para reacciones de Giveaways
    for (const module of client.eventModules) {

      if (typeof module.handleReaction !== "function") {
        continue;
      }

      try {
        await module.handleReaction(
          reaction,
          user,
          client
        );
      } catch (error) {
        console.error(
          "❌ Error procesando reacción:"
        );

        console.error(error);
      }
    }
  }
);

// ======================================================
// REACCIÓN QUITADA
// ======================================================

client.on(
  Events.MessageReactionRemove,
  async (reaction, user) => {

    if (user.bot) return;

    // Preparado para futuros sistemas.
  }
);

// ======================================================
// ERRORES DEL CLIENTE
// ======================================================

client.on(Events.Error, error => {
  console.error("❌ Discord Client Error:");
  console.error(error);
});

// ======================================================
// WARNINGS
// ======================================================

client.on(Events.Warn, warning => {
  console.warn("⚠️ Discord Warning:");
  console.warn(warning);
});

// ======================================================
// DEBUG
// ======================================================

client.on(Events.Debug, info => {
  // Evitamos llenar demasiado la consola.
  if (
    info.includes("Heartbeat") ||
    info.includes("heartbeat")
  ) {
    return;
  }

  console.log(`🔧 Debug: ${info}`);
});

// ======================================================
// SERVIDOR HTTP PARA RAILWAY
// ======================================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

  if (req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    res.end(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Axel XIT</title>
      </head>

      <body style="
        margin:0;
        background:#111;
        color:white;
        font-family:Arial;
        display:flex;
        align-items:center;
        justify-content:center;
        height:100vh;
        text-align:center;
      ">

        <div>
          <h1>🤖 Axel XIT</h1>
          <p>Bot online correctamente.</p>
          <p>⚡ Sistema funcionando</p>
        </div>

      </body>
      </html>
    `);

    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(
      JSON.stringify({
        status: "online",
        bot: "Axel XIT",
        commands: client.commands.size,
        guilds: client.guilds.cache.size,
        uptime: process.uptime()
      })
    );

    return;
  }

  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(
    JSON.stringify({
      error: "Not Found"
    })
  );
});

server.listen(PORT, () => {
  console.log(`🌐 Servidor web activo en el puerto ${PORT}`);
});

// ======================================================
// MANEJO DE CIERRE
// ======================================================

async function apagar() {
  console.log("\n🛑 Apagando Axel XIT...");

  try {
    await client.destroy();
  } catch (error) {
    console.error("Error cerrando Discord:", error);
  }

  server.close(() => {
    console.log("🌐 Servidor HTTP cerrado.");
    process.exit(0);
  });
}

process.on("SIGINT", apagar);
process.on("SIGTERM", apagar);

// ======================================================
// ERRORES GLOBALES
// ======================================================

process.on("unhandledRejection", error => {
  console.error("❌ Unhandled Rejection:");
  console.error(error);
});

process.on("uncaughtException", error => {
  console.error("❌ Uncaught Exception:");
  console.error(error);
});

// ======================================================
// INICIAR BOT
// ======================================================

console.log("🚀 Iniciando Axel XIT...");

client.login(TOKEN);
