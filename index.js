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
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

// ========================================
// CONFIGURACIÓN
// ========================================

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error("❌ Falta DISCORD_TOKEN.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID.");
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

      delete require.cache[require.resolve(filePath)];

      const commandModule = require(filePath);

      const commandList = Array.isArray(commandModule)
        ? commandModule
        : [commandModule];

      for (const command of commandList) {
        if (!command?.data || !command?.execute) {
          console.warn(`⚠️ Comando inválido en ${file}`);
          continue;
        }

        const commandName = command.data.name;

        if (client.commands.has(commandName)) {
          console.warn(
            `⚠️ Comando duplicado: /${commandName}`
          );

          continue;
        }

        client.commands.set(commandName, command);

        commands.push(command.data.toJSON());

        console.log(`✅ Comando cargado: /${commandName}`);
      }
    } catch (error) {
      console.error(
        `❌ Error cargando ${file}:`,
        error
      );
    }
  }
} else {
  console.warn("⚠️ No existe la carpeta commands.");
}

// ========================================
// 🤖 COMANDO /IA
// ========================================

const comandoIA = {
  data: new SlashCommandBuilder()
    .setName("ia")
    .setDescription("Habla con la IA de DARK FF V1")
    .addStringOption(option =>
      option
        .setName("pregunta")
        .setDescription("Escribe lo que quieres preguntarle")
        .setRequired(true)
        .setMaxLength(4000)
    ),

  category: "ia",

  async execute(interaction) {

    if (!OPENAI_API_KEY) {
      return interaction.reply({
        content:
          "❌ La IA no está configurada. Falta `OPENAI_API_KEY` en Railway.",
        ephemeral: true
      });
    }

    const pregunta =
      interaction.options.getString("pregunta");

    await interaction.deferReply();

    try {
      const respuestaIA = await fetch(
        "https://api.openai.com/v1/responses",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },

          body: JSON.stringify({
            model: "gpt-5.6-luna",

            instructions:
              "Eres la IA oficial de DARK FF V1. Responde en español de forma clara, útil y amigable. Puedes ayudar con Discord, programación, videojuegos, matemáticas, tecnología, escritura y conocimientos generales. No inventes información cuando no estés seguro. Mantén las respuestas apropiadas para adolescentes.",

            input: pregunta,

            max_output_tokens: 1000
          })
        }
      );

      const data = await respuestaIA.json();

      if (!respuestaIA.ok) {
        console.error("❌ Error OpenAI:", data);

        return interaction.editReply(
          "❌ La IA tuvo un problema al procesar tu pregunta."
        );
      }

      const texto =
        data.output_text ||
        data.output
          ?.flatMap(item => item.content || [])
          ?.filter(item => item.type === "output_text")
          ?.map(item => item.text)
          ?.join("\n") ||
        "❌ La IA no devolvió una respuesta.";

      const respuestaFinal =
        texto.length > 1900
          ? texto.slice(0, 1900) + "..."
          : texto;

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setAuthor({
          name: "🤖 DARK FF V1 • IA"
        })
        .setDescription(respuestaFinal)
        .setFooter({
          text: "DARK FF V1"
        });

      await interaction.editReply({
        embeds: [embed]
      });

    } catch (error) {

      console.error(
        "❌ Error ejecutando /ia:",
        error
      );

      await interaction.editReply(
        "❌ No pude conectar con la IA."
      );
    }
  }
};

if (!client.commands.has("ia")) {
  client.commands.set("ia", comandoIA);
  commands.push(comandoIA.data.toJSON());

  console.log("🤖 Comando cargado: /ia");
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

    console.log(
      `✅ ${commands.length} comandos registrados.`
    );

  } catch (error) {
    console.error(
      "❌ Error registrando comandos:",
      error
    );
  }
}

// ========================================
// BOT LISTO
// ========================================

client.once(
  Events.ClientReady,
  async readyClient => {

    console.log("");
    console.log("========================================");
    console.log("🤖 DARK FF V1");
    console.log("========================================");

    console.log(
      `✅ Bot: ${readyClient.user.tag}`
    );

    console.log(
      `🌐 Servidores: ${readyClient.guilds.cache.size}`
    );

    console.log(
      `📜 Comandos: ${client.commands.size}`
    );

    console.log(
      `🏓 Ping: ${readyClient.ws.ping}ms`
    );

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
  }
);

// ========================================
// INTERACCIONES
// ========================================

client.on(
  Events.InteractionCreate,
  async interaction => {

    // ====================================
    // 🔘 BOTONES DE /AYUDA
    // ====================================

    if (interaction.isButton()) {

      const categorias = {

        help_general: {
          nombre: "🛠️ Generales",
          categoria: "generales",
          color: 0x5865f2
        },

        help_moderacion: {
          nombre: "🛡️ Moderación",
          categoria: "moderacion",
          color: 0xed4245
        },

        help_diversion: {
          nombre: "🎉 Diversión",
          categoria: "diversion",
          color: 0xfee75c
        },

        help_economia: {
          nombre: "💰 Economía",
          categoria: "economia",
          color: 0xf1c40f
        },

        help_niveles: {
          nombre: "⭐ Niveles",
          categoria: "niveles",
          color: 0x57f287
        },

        help_informacion: {
          nombre: "📋 Información",
          categoria: "informacion",
          color: 0x3498db
        },

        help_utilidades: {
          nombre: "🔧 Utilidades",
          categoria: "utilidades",
          color: 0x95a5a6
        },

        help_configuracion: {
          nombre: "⚙️ Configuración",
          categoria: "configuracion",
          color: 0x9b59b6
        },

        help_administracion: {
          nombre: "👑 Administración",
          categoria: "administracion",
          color: 0xe67e22
        },

        help_ia: {
          nombre: "🤖 IA",
          categoria: "ia",
          color: 0x5865f2
        }
      };

      const datos =
        categorias[interaction.customId];

      if (!datos) {
        return;
      }

      const comandosCategoria =
        [...client.commands.values()]
          .filter(command =>
            command.category === datos.categoria
          );

      if (comandosCategoria.length === 0) {

        return interaction.reply({
          content:
            "❌ Todavía no hay comandos en esta categoría.",
          ephemeral: true
        });
      }

      const lista =
        comandosCategoria
          .map(command =>
            `**/${command.data.name}** — ${command.data.description}`
          )
          .join("\n");

      const embed =
        new EmbedBuilder()
          .setColor(datos.color)
          .setTitle(datos.nombre)
          .setDescription(lista)
          .setFooter({
            text:
              `DARK FF V1 • ${comandosCategoria.length} comandos`
          });

      try {

        await interaction.update({
          embeds: [embed]
        });

      } catch (error) {

        console.error(
          "❌ Error en botón de ayuda:",
          error
        );

      }

      return;
    }

    // ====================================
    // SLASH COMMANDS
    // ====================================

    if (!interaction.isChatInputCommand()) {
      return;
    }

    const command =
      client.commands.get(
        interaction.commandName
      );

    if (!command) {

      console.warn(
        `⚠️ No se encontró /${interaction.commandName}`
      );

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content:
            "❌ Ese comando no existe o no está cargado.",
          ephemeral: true
        });
      }

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
        content:
          `❌ No pude ejecutar el comando.\n\n` +
          `**Error:** ${error.message || "Error desconocido"}`,
        ephemeral: true
      };

      try {

        if (
          interaction.replied ||
          interaction.deferred
        ) {

          await interaction.followUp(
            mensaje
          );

        } else {

          await interaction.reply(
            mensaje
          );

        }

      } catch (replyError) {

        console.error(
          "❌ No pude enviar el error:",
          replyError
        );

      }
    }
  }
);

// ========================================
// 👋 BIENVENIDA
// ========================================

client.on(
  Events.GuildMemberAdd,
  async member => {

    try {

      const db = cargarDB();

      const servidor =
        db.servidores?.[member.guild.id];

      const configuracion =
        servidor?.bienvenida ||
        db[member.guild.id]?.bienvenida;

      if (!configuracion?.activa) {
        return;
      }

      if (!configuracion.canal) {
        return;
      }

      const canal =
        member.guild.channels.cache.get(
          configuracion.canal
        );

      if (!canal) {
        return;
      }

      let mensaje =
        configuracion.mensaje ||
        "👋 ¡Bienvenido {usuario} a {servidor}!";

      mensaje = mensaje
        .replace(
          /{usuario}/g,
          `<@${member.id}>`
        )
        .replace(
          /{nombre}/g,
          member.user.username
        )
        .replace(
          /{servidor}/g,
          member.guild.name
        )
        .replace(
          /{miembros}/g,
          member.guild.memberCount.toString()
        );

      await canal.send({
        content: mensaje
      });

      console.log(
        `👋 Bienvenida enviada a ${member.user.tag}`
      );

    } catch (error) {

      console.error(
        "❌ Error enviando bienvenida:",
        error
      );
    }
  }
);

// ========================================
// 🚪 DESPEDIDA
// ========================================

client.on(
  Events.GuildMemberRemove,
  async member => {

    try {

      const db = cargarDB();

      const servidor =
        db.servidores?.[member.guild.id];

      const configuracion =
        servidor?.despedida ||
        db[member.guild.id]?.despedida;

      if (!configuracion?.activa) {
        return;
      }

      if (!configuracion.canal) {
        return;
      }

      const canal =
        member.guild.channels.cache.get(
          configuracion.canal
        );

      if (!canal) {
        return;
      }

      let mensaje =
        configuracion.mensaje ||
        "👋 {usuario} ha salido del servidor.";

      mensaje = mensaje
        .replace(
          /{usuario}/g,
          `<@${member.id}>`
        )
        .replace(
          /{nombre}/g,
          member.user.username
        )
        .replace(
          /{servidor}/g,
          member.guild.name
        )
        .replace(
          /{miembros}/g,
          member.guild.memberCount.toString()
        );

      await canal.send({
        content: mensaje
      });

      console.log(
        `🚪 Despedida enviada por ${member.user.tag}`
      );

    } catch (error) {

      console.error(
        "❌ Error enviando despedida:",
        error
      );
    }
  }
);

// ========================================
// 🌐 SERVIDOR WEB RAILWAY
// ========================================

const server = http.createServer(
  (req, res) => {

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

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    // ================================
    // PÁGINA
    // ================================

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

    // ================================
    // STATUS
    // ================================

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
          online: client.isReady(),
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

    // ================================
    // RUTA NO ENCONTRADA
    // ================================

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
  }
);

// ========================================
// SERVIDOR WEB
// ========================================

server.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `🌐 Panel DARK FF V1: puerto ${PORT}`
    );

    console.log(
      "🚀 Servidor web iniciado."
    );
  }
);

// ========================================
// LOGIN
// ========================================

client.login(TOKEN).catch(error => {

  console.error(
    "❌ No se pudo iniciar sesión en Discord:"
  );

  console.error(error);
});

// ========================================
// ERRORES GLOBALES
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
