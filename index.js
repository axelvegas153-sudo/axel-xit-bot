require("dotenv").config();

const fs = require("fs");
const path = require("path");

const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.log("❌ Faltan TOKEN, CLIENT_ID o GUILD_ID en Railway.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

/* CARGAR CATEGORÍAS */

function cargarComandos(dir) {
  if (!fs.existsSync(dir)) return;

  const archivos = fs.readdirSync(dir);

  for (const archivo of archivos) {
    const ruta = path.join(dir, archivo);
    const stat = fs.statSync(ruta);

    if (stat.isDirectory()) {
      cargarComandos(ruta);
      continue;
    }

    if (!archivo.endsWith(".js")) continue;

    try {
      delete require.cache[require.resolve(ruta)];

      const modulo = require(ruta);

      const lista = Array.isArray(modulo)
        ? modulo
        : [modulo];

      for (const comando of lista) {
        if (!comando?.data?.name || !comando?.execute) {
          console.log(`⚠️ Ignorado: ${archivo}`);
          continue;
        }

        const nombre = comando.data.name;

        if (client.commands.has(nombre)) {
          console.log(`⚠️ Comando duplicado: /${nombre}`);
          continue;
        }

        client.commands.set(nombre, comando);

        console.log(`✅ /${nombre}`);
      }

    } catch (error) {
      console.log(`❌ Error en ${archivo}`);
      console.log(error.message);
    }
  }
}

cargarComandos(commandsPath);

console.log("");
console.log(`📦 Comandos cargados: ${client.commands.size}`);

/* REGISTRAR COMANDOS */

async function registrarComandos() {
  const comandos = [];

  for (const comando of client.commands.values()) {
    comandos.push(comando.data.toJSON());
  }

  console.log(`📤 Enviando ${comandos.length} comandos...`);

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: comandos
      }
    );

    console.log("✅ COMANDOS REGISTRADOS CORRECTAMENTE");

  } catch (error) {
    console.log("❌ ERROR REGISTRANDO COMANDOS");

    if (error.rawError) {
      console.log(JSON.stringify(error.rawError, null, 2));
    } else {
      console.log(error.message);
    }
  }
}

/* BOT READY */

client.once("ready", async () => {
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━");
  console.log(`🤖 ${client.user.tag}`);
  console.log("🟢 Bot conectado");
  console.log("━━━━━━━━━━━━━━━━━━━━");

  await registrarComandos();
});

/* SLASH COMMANDS */

client.on("interactionCreate", async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const comando = client.commands.get(
    interaction.commandName
  );

  if (!comando) {
    return interaction.reply({
      content: "❌ Ese comando no está disponible.",
      ephemeral: true
    });
  }

  try {
    await comando.execute(interaction);

  } catch (error) {

    console.error(
      `❌ Error en /${interaction.commandName}:`,
      error
    );

    const mensaje = {
      content: "❌ Ocurrió un error ejecutando este comando.",
      ephemeral: true
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(mensaje).catch(() => {});
    } else {
      await interaction.reply(mensaje).catch(() => {});
    }
  }
});

/* LOGIN */

client.login(TOKEN);
