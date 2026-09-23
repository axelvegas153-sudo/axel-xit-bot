require("dotenv").config();

const fs = require("fs");
const path = require("path");

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

// ================================
// COMPROBAR VARIABLES
// ================================

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN en las variables de entorno.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en las variables de entorno.");
  process.exit(1);
}

// ================================
// CREAR CLIENTE
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

const comandos = [];

// ================================
// CARGAR COMANDOS
// ================================

const carpetaComandos = path.join(__dirname, "comandos");

if (!fs.existsSync(carpetaComandos)) {
  fs.mkdirSync(carpetaComandos, { recursive: true });
  console.log("📁 Carpeta 'comandos' creada.");
}

const archivos = fs
  .readdirSync(carpetaComandos)
  .filter((archivo) => archivo.endsWith(".js"));

for (const archivo of archivos) {
  try {
    const ruta = path.join(carpetaComandos, archivo);
    const comando = require(ruta);

    if (!comando.data || !comando.execute) {
      console.warn(
        `⚠️ ${archivo} no tiene data o execute.`
      );
      continue;
    }

    client.commands.set(
      comando.data.name,
      comando
    );

    comandos.push(
      comando.data.toJSON()
    );

    console.log(
      `✅ Cargado: /${comando.data.name}`
    );

  } catch (error) {
    console.error(
      `❌ Error cargando ${archivo}:`
    );
    console.error(error);
  }
}

// ================================
// REGISTRAR COMANDOS GLOBALES
// ================================

async function registrarComandos() {
  const rest = new REST({
    version: "10"
  }).setToken(TOKEN);

  try {
    console.log(
      `🔄 Registrando ${comandos.length} comandos globales...`
    );

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: comandos
      }
    );

    console.log(
      "✅ Comandos registrados globalmente."
    );

  } catch (error) {
    console.error(
      "❌ Error registrando comandos:"
    );
    console.error(error);
  }
}

// ================================
// BOT LISTO
// ================================

client.once(
  Events.ClientReady,
  async (bot) => {

    console.log("");
    console.log("================================");
    console.log("🤖 DARK FF V1");
    console.log("================================");
    console.log(
      `✅ Conectado como: ${bot.user.tag}`
    );
    console.log(
      `🌐 Servidores: ${bot.guilds.cache.size}`
    );
    console.log(
      `📦 Comandos: ${client.commands.size}`
    );
    console.log(
      "🌎 BOT PÚBLICO ACTIVADO"
    );
    console.log("================================");

    await registrarComandos();

    console.log(
      "🚀 Bot iniciado correctamente."
    );
  }
);

// ================================
// EJECUTAR COMANDOS
// ================================

client.on(
  Events.InteractionCreate,
  async (interaction) => {

    if (!interaction.isChatInputCommand()) {
      return;
    }

    const comando =
      client.commands.get(
        interaction.commandName
      );

    if (!comando) {
      return interaction.reply({
        content:
          "❌ Ese comando no existe o todavía no está cargado.",
        ephemeral: true
      });
    }

    try {

      await comando.execute(
        interaction,
        client
      );

    } catch (error) {

      console.error(
        `❌ Error en /${interaction.commandName}:`
      );

      console.error(error);

      const respuesta = {
        content:
          "❌ Ocurrió un error al ejecutar este comando.",
        ephemeral: true
      };

      if (
        interaction.replied ||
        interaction.deferred
      ) {
        await interaction
          .followUp(respuesta)
          .catch(() => {});
      } else {
        await interaction
          .reply(respuesta)
          .catch(() => {});
      }
    }
  }
);

// ================================
// ERRORES
// ================================

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "❌ Error de promesa:"
    );
    console.error(error);
  }
);

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "❌ Error inesperado:"
    );
    console.error(error);
  }
);

// ================================
// INICIAR
// ================================

client.login(TOKEN);
