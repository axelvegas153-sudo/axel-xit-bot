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

// ================================
// CONFIGURACIÓN
// ================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN en Railway.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en Railway.");
  process.exit(1);
}

// ================================
// CLIENTE
// ================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// ================================
// CARGAR COMANDOS
// ================================

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath, { recursive: true });
  console.log("📁 Carpeta commands creada.");
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

const commands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const loaded = require(filePath);

    // Permitir un comando o varios comandos en un archivo
    const commandList = Array.isArray(loaded)
      ? loaded
      : [loaded];

    for (const command of commandList) {
      if (!command.data || !command.execute) {
        console.warn(
          `⚠️ Se encontró un comando inválido en ${file}`
        );
        continue;
      }

      const commandName = command.data.name;

      client.commands.set(commandName, command);
      commands.push(command.data.toJSON());

      console.log(`✅ /${commandName}`);
    }

  } catch (error) {
    console.error(`❌ Error en ${file}:`);
    console.error(error);
  }
}

// ================================
// REGISTRAR SLASH COMMANDS
// ================================

async function registerCommands() {
  try {
    const rest = new REST({
      version: "10"
    }).setToken(TOKEN);

    console.log(
      `🔄 Registrando ${commands.length} comandos...`
    );

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

// ================================
// BOT LISTO
// ================================

client.once(
  Events.ClientReady,
  readyClient => {

    console.log("");
    console.log("================================");
    console.log("🤖 DARK BIO FF ONLINE");
    console.log("================================");
    console.log(`👤 Usuario: ${readyClient.user.tag}`);
    console.log(`🛡️ Servidores: ${readyClient.guilds.cache.size}`);
    console.log(`📚 Comandos: ${client.commands.size}`);
    console.log(`🏓 Ping: ${readyClient.ws.ping}ms`);
    console.log("================================");

    readyClient.user.setPresence({
      activities: [
        {
          name: "/ayuda | DARK BIO FF",
          type: 0
        }
      ],
      status: "online"
    });
  }
);

// ================================
// INTERACCIONES
// ================================

client.on(
  Events.InteractionCreate,
  async interaction => {

    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command =
      client.commands.get(
        interaction.commandName
      );

    if (!command) {
      console.warn(
        `⚠️ Comando no encontrado: /${interaction.commandName}`
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
        `❌ Error ejecutando /${interaction.commandName}`
      );

      console.error(error);

      const respuesta = {
        content:
          "❌ Ocurrió un error al ejecutar este comando.",
        ephemeral: true
      };

      try {

        if (
          interaction.replied ||
          interaction.deferred
        ) {

          await interaction.followUp(
            respuesta
          );

        } else {

          await interaction.reply(
            respuesta
          );
        }

      } catch {}
    }
  }
);

// ================================
// SERVIDOR HTTP PARA RAILWAY
// ================================

const PORT =
  process.env.PORT || 3000;

const server = http.createServer(
  (req, res) => {

    res.writeHead(200, {
      "Content-Type":
        "text/plain; charset=utf-8"
    });

    res.end(
      "DARK BIO FF BOT - ONLINE"
    );
  }
);

server.listen(
  PORT,
  () => {

    console.log(
      `🌐 Servidor HTTP activo en puerto ${PORT}`
    );
  }
);

// ================================
// INICIAR
// ================================

async function start() {

  await registerCommands();

  try {

    await client.login(TOKEN);

  } catch (error) {

    console.error(
      "❌ No se pudo iniciar sesión en Discord."
    );

    console.error(error);

    process.exit(1);
  }
}

start();

// ================================
// MANEJO DE ERRORES
// ================================

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
