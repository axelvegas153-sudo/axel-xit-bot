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
  Events,
  EmbedBuilder
} = require("discord.js");

// ======================================================
// CONFIGURACIÓN
// ======================================================

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

// ======================================================
// CLIENTE
// ======================================================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// ======================================================
// COLECCIÓN DE COMANDOS
// ======================================================

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  fs.mkdirSync(commandsPath, { recursive: true });
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  try {
    const filePath = path.join(commandsPath, file);
    const loaded = require(filePath);

    const commands = Array.isArray(loaded)
      ? loaded
      : [loaded];

    for (const command of commands) {
      if (!command?.data || !command?.execute) {
        console.error(`❌ Comando inválido en ${file}`);
        continue;
      }

      const commandName = command.data.name;

      if (!commandName) {
        console.error(`❌ Comando sin nombre en ${file}`);
        continue;
      }

      if (client.commands.has(commandName)) {
        console.error(
          `⚠️ Comando duplicado ignorado: /${commandName} (${file})`
        );
        continue;
      }

      client.commands.set(commandName, command);

      console.log(`✅ Cargado: /${commandName}`);
    }
  } catch (error) {
    console.error(`❌ Error cargando ${file}:`);
    console.error(error);
  }
}

// ======================================================
// REGISTRAR COMANDOS
// ======================================================

async function registrarComandos() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);

  const comandos = [...client.commands.values()]
    .map(command => command.data.toJSON());

  console.log(`📤 Registrando ${comandos.length} comandos...`);

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    {
      body: comandos
    }
  );

  console.log("✅ Comandos registrados correctamente.");
}

// ======================================================
// BOT LISTO
// ======================================================

client.once(Events.ClientReady, async readyClient => {
  console.log("======================================");
  console.log("🤖 DARK FF V1");
  console.log(`✅ Conectado como ${readyClient.user.tag}`);
  console.log(`📜 Comandos: ${client.commands.size}`);
  console.log(`🌐 Servidores: ${readyClient.guilds.cache.size}`);
  console.log("======================================");

  try {
    await registrarComandos();
  } catch (error) {
    console.error("❌ Error registrando comandos:");
    console.error(error);
  }

  readyClient.user.setPresence({
    activities: [
      {
        name: "/ayuda • DARK FF V1",
        type: 0
      }
    ],
    status: "online"
  });
});

// ======================================================
// EJECUTAR COMANDOS
// ======================================================

client.on(Events.InteractionCreate, async interaction => {
  try {
    // ------------------------------
    // SLASH COMMAND
    // ------------------------------

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(
        interaction.commandName
      );

      if (!command) {
        return interaction.reply({
          content: "❌ Ese comando no existe.",
          ephemeral: true
        });
      }

      await command.execute(interaction, client);
      return;
    }

    // ------------------------------
    // BOTONES
    // ------------------------------

    if (interaction.isButton()) {
      const categorias = {
        help_general: "generales",
        help_moderacion: "moderacion",
        help_diversion: "diversion",
        help_economia: "economia",
        help_niveles: "niveles",
        help_informacion: "informacion",
        help_utilidades: "utilidades",
        help_configuracion: "configuracion",
        help_administracion: "administracion"
      };

      const categoria = categorias[interaction.customId];

      if (!categoria) {
        return;
      }

      const comandosCategoria = [
        ...client.commands.values()
      ].filter(command =>
        command.category === categoria
      );

      if (comandosCategoria.length === 0) {
        return interaction.reply({
          content:
            "❌ Esta categoría todavía no tiene comandos.",
          ephemeral: true
        });
      }

      const nombres = comandosCategoria
        .map(command => `• \`/${command.data.name}\``)
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(
          `📚 ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`
        )
        .setDescription(nombres)
        .setFooter({
          text: "DARK FF V1 • Soporte: @Axel XIT"
        });

      await interaction.reply({
        embeds: [embed],
        ephemeral: true
      });
    }
  } catch (error) {
    console.error("❌ Error ejecutando interacción:");
    console.error(error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content:
          "❌ Ocurrió un error al ejecutar este comando.",
        ephemeral: true
      }).catch(() => {});
    } else {
      await interaction.reply({
        content:
          "❌ Ocurrió un error al ejecutar este comando.",
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ======================================================
// SERVIDOR WEB PARA RAILWAY
// ======================================================

const server = http.createServer((req, res) => {
  if (req.url === "/api/status") {
    res.writeHead(200, {
      "Content-Type": "application/json"
    });

    res.end(JSON.stringify({
      online: client.isReady(),
      bot: "DARK FF V1",
      commands: client.commands.size,
      servers: client.guilds.cache.size
    }));

    return;
  }

  res.writeHead(200, {
    "Content-Type": "text/plain; charset=utf-8"
  });

  res.end(
    "🤖 DARK FF V1 está funcionando correctamente."
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Servidor web activo en el puerto ${PORT}`);
});

// ======================================================
// ERRORES
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
// LOGIN
// ======================================================

client.login(TOKEN);
