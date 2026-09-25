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
const GUILD_ID = process.env.GUILD_ID;

// ========================================
// COMPROBAR VARIABLES
// ========================================

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

// ========================================
// COLECCIÓN DE COMANDOS
// ========================================

client.commands = new Collection();

const commandsPath = path.join(__dirname, "comandos");

if (!fs.existsSync(commandsPath)) {
  console.error("❌ No existe la carpeta comandos.");
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

const commands = [];

console.log("========================================");
console.log("📦 CARGANDO COMANDOS");
console.log("========================================");

// ========================================
// CARGAR TODOS LOS ARCHIVOS
// ========================================

for (const file of commandFiles) {
  try {
    const filePath = path.join(commandsPath, file);
    const loaded = require(filePath);

    const commandList = Array.isArray(loaded)
      ? loaded
      : [loaded];

    for (const command of commandList) {

      if (!command || !command.data || !command.execute) {
        console.error(`❌ ${file}: comando inválido.`);
        continue;
      }

      const name = command.data.name;

      if (!name) {
        console.error(`❌ ${file}: el comando no tiene nombre.`);
        continue;
      }

      if (client.commands.has(name)) {
        console.error(`❌ Comando duplicado: /${name}`);
        continue;
      }

      client.commands.set(name, command);
      commands.push(command.data.toJSON());

      console.log(`✅ /${name}`);
    }

  } catch (error) {
    console.error(`❌ Error cargando ${file}:`);
    console.error(error);
  }
}

console.log("========================================");
console.log(`📊 TOTAL: ${commands.length} comandos`);
console.log("========================================");

// ========================================
// REST
// ========================================

const rest = new REST({
  version: "10"
}).setToken(TOKEN);

// ========================================
// REGISTRAR COMANDOS
// ========================================

async function registrarComandos() {
  try {

    console.log("🔄 Registrando comandos...");

    if (GUILD_ID) {

      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        {
          body: commands
        }
      );

      console.log(
        `✅ ${commands.length} comandos registrados en el servidor.`
      );

    } else {

      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
        {
          body: commands
        }
      );

      console.log(
        `✅ ${commands.length} comandos registrados globalmente.`
      );
    }

  } catch (error) {

    console.error("❌ ERROR REGISTRANDO COMANDOS:");
    console.error(error);
  }
}

// ========================================
// BOT LISTO
// ========================================

client.once(Events.ClientReady, async () => {

  console.log("========================================");
  console.log(`🤖 DARK FF V1 conectado`);
  console.log(`👤 Usuario: ${client.user.tag}`);
  console.log(`🆔 ID: ${client.user.id}`);
  console.log("========================================");

  await registrarComandos();
});

// ========================================
// INTERACCIONES
// ========================================

client.on(Events.InteractionCreate, async interaction => {

  if (!interaction.isChatInputCommand()) {
    return;
  }

  console.log(
    `📥 Comando recibido: /${interaction.commandName}`
  );

  const command = client.commands.get(
    interaction.commandName
  );

  // ======================================
  // COMANDO NO ENCONTRADO
  // ======================================

  if (!command) {

    console.error(
      `❌ /${interaction.commandName} no existe en client.commands`
    );

    try {
      await interaction.reply({
        content: "❌ Este comando no está cargado en el bot.",
        ephemeral: true
      });
    } catch (error) {
      console.error("❌ No se pudo responder:", error);
    }

    return;
  }

  // ======================================
  // EJECUTAR COMANDO
  // ======================================

  try {

    console.log(
      `⚙️ Ejecutando: /${interaction.commandName}`
    );

    await command.execute(interaction);

    console.log(
      `✅ Ejecutado: /${interaction.commandName}`
    );

  } catch (error) {

    console.error(
      `❌ ERROR EN /${interaction.commandName}:`
    );

    console.error(error);

    const respuesta = {
      content: "❌ Ocurrió un error al ejecutar este comando.",
      ephemeral: true
    };

    try {

      if (interaction.replied || interaction.deferred) {

        await interaction.followUp(respuesta);

      } else {

        await interaction.reply(respuesta);

      }

    } catch (replyError) {

      console.error(
        "❌ No se pudo enviar el mensaje de error:",
        replyError
      );
    }
  }
});

// ========================================
// SERVIDOR PARA RAILWAY / RENDER
// ========================================

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end("DARK FF V1 está funcionando correctamente.");
});

server.listen(PORT, () => {

  console.log(
    `🌐 Servidor HTTP activo en puerto ${PORT}`
  );
});

// ========================================
// LOGIN
// ========================================

client.login(TOKEN)
  .then(() => {
    console.log("🔐 Login de Discord iniciado...");
  })
  .catch(error => {
    console.error("❌ ERROR AL CONECTAR CON DISCORD:");
    console.error(error);
  });
