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
  console.log("❌ Faltan variables TOKEN, CLIENT_ID o GUILD_ID.");
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

/* CARGAR CATEGORÍAS */

function cargarComandos(carpeta) {
  if (!fs.existsSync(carpeta)) {
    console.log("❌ No existe la carpeta commands.");
    return;
  }

  const archivos = fs.readdirSync(carpeta);

  for (const archivo of archivos) {
    const ruta = path.join(carpeta, archivo);
    const informacion = fs.statSync(ruta);

    if (informacion.isDirectory()) {
      cargarComandos(ruta);
      continue;
    }

    if (!archivo.endsWith(".js")) continue;

    try {
      delete require.cache[require.resolve(ruta)];

      const modulo = require(ruta);

      const comandos = Array.isArray(modulo)
        ? modulo
        : [modulo];

      for (const comando of comandos) {
        if (
          !comando ||
          !comando.data ||
          !comando.data.name ||
          !comando.execute
        ) {
          console.log(`⚠️ Archivo ignorado: ${archivo}`);
          continue;
        }

        const nombre = comando.data.name;

        if (client.commands.has(nombre)) {
          console.log(`⚠️ Duplicado: /${nombre}`);
          continue;
        }

        client.commands.set(nombre, comando);

        console.log(`✅ /${nombre}`);
      }

    } catch (error) {
      console.log(`❌ Error cargando ${archivo}`);
      console.log(error.message);
    }
  }
}

cargarComandos(
  path.join(__dirname, "commands")
);

console.log("");
console.log(
  `📦 Comandos cargados: ${client.commands.size}`
);

/* REGISTRAR COMANDOS */

async function registrarComandos() {
  const comandos = [];

  for (const comando of client.commands.values()) {
    try {
      const datos = comando.data.toJSON();

      if (
        !datos.name ||
        !datos.description
      ) {
        console.log(
          `⚠️ Comando incompleto: /${datos.name || "sin nombre"}`
        );

        continue;
      }

      comandos.push(datos);

    } catch (error) {
      console.log(
        `❌ Error preparando comando: ${comando.data.name}`
      );

      console.log(error.message);
    }
  }

  console.log(
    `📤 Enviando ${comandos.length} comandos...`
  );

  const rest = new REST({
    version: "10"
  }).setToken(TOKEN);

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

    console.log(
      "✅ TODOS LOS COMANDOS REGISTRADOS"
    );

  } catch (error) {
    console.log(
      "❌ ERROR REGISTRANDO COMANDOS"
    );

    if (error.rawError) {
      console.log(
        JSON.stringify(
          error.rawError,
          null,
          2
        )
      );
    } else {
      console.log(error.message);
    }
  }
}

/* BOT READY */

client.once("clientReady", async () => {
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━");
  console.log(`🤖 ${client.user.tag}`);
  console.log("🟢 DARK FF V1 conectado");
  console.log("━━━━━━━━━━━━━━━━━━━━");

  await registrarComandos();
});

/* SLASH COMMANDS */

client.on(
  "interactionCreate",
  async interaction => {

    if (!interaction.isChatInputCommand()) {
      return;
    }

    const comando =
      client.commands.get(
        interaction.commandName
      );

    if (!comando) {
      await interaction.reply({
        content:
          "❌ Ese comando no está disponible.",
        ephemeral: true
      }).catch(() => {});

      return;
    }

    try {
      await comando.execute(
        interaction
      );

    } catch (error) {

      console.error(
        `❌ Error en /${interaction.commandName}:`
      );

      console.error(error);

      const respuesta = {
        content:
          "❌ Ocurrió un error ejecutando este comando.",
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

/* LOGIN */

client.login(TOKEN);
