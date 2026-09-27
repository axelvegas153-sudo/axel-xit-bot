require("dotenv").config();

const fs = require("fs");
const path = require("path");
const http = require("http");

const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  REST,
  Routes,
  EmbedBuilder,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require("discord.js");

/* =====================================================
   CONFIGURACIÓN
===================================================== */

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const OWNER_ID = process.env.OWNER_ID || "1483521913429950658";
const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error("❌ Falta TOKEN en las variables de Railway.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en las variables de Railway.");
  process.exit(1);
}

if (!GUILD_ID) {
  console.error("❌ Falta GUILD_ID en las variables de Railway.");
  process.exit(1);
}

/* =====================================================
   CLIENTE DISCORD
===================================================== */

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.Reaction,
    Partials.User,
    Partials.GuildMember
  ]
});

client.commands = new Collection();

/* =====================================================
   DATABASE
===================================================== */

const DB_FILE = path.join(__dirname, "database.json");

let db = {};

function cargarDatabase() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      db = {};
      guardarDatabase();
      return;
    }

    const contenido = fs.readFileSync(DB_FILE, "utf8");

    if (!contenido.trim()) {
      db = {};
      guardarDatabase();
      return;
    }

    db = JSON.parse(contenido);
  } catch (error) {
    console.error("❌ Error leyendo database.json:", error);
    db = {};
  }
}

function guardarDatabase() {
  try {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify(db, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("❌ Error guardando database.json:", error);
  }
}

cargarDatabase();

/* =====================================================
   HELPERS DATABASE
===================================================== */

function getGuildDatabase(guildId) {
  if (!db.guilds) db.guilds = {};

  if (!db.guilds[guildId]) {
    db.guilds[guildId] = {};
  }

  return db.guilds[guildId];
}

function isOwner(userId) {
  return userId === OWNER_ID;
}

function isStaff(interaction) {
  if (!interaction.member) return false;

  return (
    isOwner(interaction.user.id) ||
    interaction.member.permissions?.has(
      PermissionsBitField.Flags.ManageGuild
    ) ||
    interaction.member.permissions?.has(
      PermissionsBitField.Flags.Administrator
    )
  );
}

/* =====================================================
   CARGAR COMANDOS
===================================================== */

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.error("❌ No existe la carpeta commands.");
  process.exit(1);
}

function obtenerArchivosJS(carpeta) {
  let archivos = [];

  if (!fs.existsSync(carpeta)) {
    return archivos;
  }

  const elementos = fs.readdirSync(carpeta, {
    withFileTypes: true
  });

  for (const elemento of elementos) {
    const ruta = path.join(carpeta, elemento.name);

    if (elemento.isDirectory()) {
      archivos = archivos.concat(
        obtenerArchivosJS(ruta)
      );
    } else if (
      elemento.isFile() &&
      elemento.name.endsWith(".js")
    ) {
      archivos.push(ruta);
    }
  }

  return archivos;
}

let archivosComandos = obtenerArchivosJS(commandsPath);

/*
  Ponemos help.js primero para que el /help interactivo
  tenga prioridad sobre otro /help duplicado.
*/
archivosComandos.sort((a, b) => {
  const aHelp = path.basename(a).toLowerCase() === "help.js";
  const bHelp = path.basename(b).toLowerCase() === "help.js";

  if (aHelp && !bHelp) return -1;
  if (!aHelp && bHelp) return 1;

  return a.localeCompare(b);
});

console.log(
  `📂 Archivos encontrados: ${archivosComandos.length}`
);

for (const archivo of archivosComandos) {
  try {
    delete require.cache[require.resolve(archivo)];

    const modulo = require(archivo);

    /*
      Las categorías normalmente exportan:
      module.exports = commands;

      Pero help.js puede exportar un solo objeto.
    */

    if (Array.isArray(modulo)) {
      for (const command of modulo) {
        if (!command?.data?.name) {
          console.log(
            `⚠️ Comando inválido en: ${archivo}`
          );
          continue;
        }

        if (client.commands.has(command.data.name)) {
          console.log(
            `⚠️ Comando duplicado ignorado: /${command.data.name}`
          );
          console.log(`   Archivo: ${archivo}`);
          continue;
        }

        client.commands.set(
          command.data.name,
          command
        );
      }
    } else if (modulo?.data?.name) {
      if (client.commands.has(modulo.data.name)) {
        console.log(
          `⚠️ Comando duplicado ignorado: /${modulo.data.name}`
        );
        console.log(`   Archivo: ${archivo}`);
      } else {
        client.commands.set(
          modulo.data.name,
          modulo
        );
      }
    } else {
      console.log(
        `⚠️ Archivo sin comando: ${archivo}`
      );
    }

  } catch (error) {
    console.error(
      `❌ ERROR CARGANDO: ${archivo}`
    );
    console.error(error);
  }
}

console.log(
  `📦 Comandos cargados: ${client.commands.size}`
);

/* =====================================================
   VALIDAR COMANDOS ANTES DE DISCORD
===================================================== */

function revisarStrings(obj, ruta = "") {
  const problemas = [];

  if (typeof obj === "string") {
    /*
      Los campos de comandos de Discord tienen límites
      bastante pequeños. Detectamos cualquier texto
      sospechoso antes de enviarlo.
    */

    if (obj.length > 130) {
      problemas.push({
        ruta,
        longitud: obj.length,
        texto: obj
      });
    }

    return problemas;
  }

  if (Array.isArray(obj)) {
    obj.forEach((valor, indice) => {
      problemas.push(
        ...revisarStrings(
          valor,
          `${ruta}[${indice}]`
        )
      );
    });

    return problemas;
  }

  if (obj && typeof obj === "object") {
    for (const [clave, valor] of Object.entries(obj)) {
      problemas.push(
        ...revisarStrings(
          valor,
          ruta ? `${ruta}.${clave}` : clave
        )
      );
    }
  }

  return problemas;
}

function validarComandos() {
  console.log("");
  console.log("🔎 Revisando comandos...");
  console.log("");

  let hayProblemas = false;

  for (const command of client.commands.values()) {
    let json;

    try {
      json = command.data.toJSON();
    } catch (error) {
      console.log(
        `❌ ERROR CONVIRTIENDO /${command.data?.name || "desconocido"}`
      );
      console.log(error);
      hayProblemas = true;
      continue;
    }

    /*
      Nombre del comando
    */

    if (!json.name) {
      console.log("❌ Comando sin nombre.");
      hayProblemas = true;
    }

    if (json.name && json.name.length > 32) {
      console.log(
        `❌ /${json.name} tiene nombre demasiado largo: ${json.name.length}`
      );
      hayProblemas = true;
    }

    /*
      Descripción
    */

    if (
      json.description &&
      json.description.length > 100
    ) {
      console.log("");
      console.log("🚨 COMANDO PROBLEMÁTICO");
      console.log(`   Comando: /${json.name}`);
      console.log(
        `   Campo: description`
      );
      console.log(
        `   Longitud: ${json.description.length}`
      );
      console.log(
        `   Texto: ${json.description}`
      );
      console.log("");

      hayProblemas = true;
    }

    /*
      Opciones
    */

    if (Array.isArray(json.options)) {
      for (const option of json.options) {
        if (
          option.name &&
          option.name.length > 32
        ) {
          console.log("");
          console.log("🚨 OPCIÓN PROBLEMÁTICA");
          console.log(
            `   Comando: /${json.name}`
          );
          console.log(
            `   Opción: ${option.name}`
          );
          console.log(
            `   Longitud: ${option.name.length}`
          );
          console.log("");

          hayProblemas = true;
        }

        if (
          option.description &&
          option.description.length > 100
        ) {
          console.log("");
          console.log("🚨 OPCIÓN PROBLEMÁTICA");
          console.log(
            `   Comando: /${json.name}`
          );
          console.log(
            `   Opción: ${option.name}`
          );
          console.log(
            `   Descripción: ${option.description}`
          );
          console.log(
            `   Longitud: ${option.description.length}`
          );
          console.log("");

          hayProblemas = true;
        }

        /*
          Choices
        */

        if (Array.isArray(option.choices)) {
          for (const choice of option.choices) {
            if (
              choice.name &&
              choice.name.length > 100
            ) {
              console.log("");
              console.log("🚨 CHOICE PROBLEMÁTICO");
              console.log(
                `   Comando: /${json.name}`
              );
              console.log(
                `   Choice: ${choice.name}`
              );
              console.log(
                `   Longitud: ${choice.name.length}`
              );
              console.log("");

              hayProblemas = true;
            }

            if (
              typeof choice.value === "string" &&
              choice.value.length > 100
            ) {
              console.log("");
              console.log("🚨 VALOR DE CHOICE PROBLEMÁTICO");
              console.log(
                `   Comando: /${json.name}`
              );
              console.log(
                `   Valor: ${choice.value}`
              );
              console.log(
                `   Longitud: ${choice.value.length}`
              );
              console.log("");

              hayProblemas = true;
            }
          }
        }
      }
    }

    /*
      Revisión general para detectar el campo exacto
      si Discord devuelve BASE_TYPE_MAX_LENGTH.
    */

    const problemasGenerales =
      revisarStrings(json);

    for (const problema of problemasGenerales) {
      console.log("");
      console.log("🚨 TEXTO DEMASIADO LARGO");
      console.log(
        `   Comando: /${json.name}`
      );
      console.log(
        `   Campo: ${problema.ruta}`
      );
      console.log(
        `   Longitud: ${problema.longitud}`
      );
      console.log(
        `   Texto: ${problema.texto}`
      );
      console.log("");
      hayProblemas = true;
    }
  }

  if (hayProblemas) {
    console.log("");
    console.log(
      "❌ SE ENCONTRARON PROBLEMAS EN LOS COMANDOS."
    );
    console.log(
      "❌ NO SE ENVIARÁN A DISCORD HASTA CORREGIRLOS."
    );
    console.log("");

    return false;
  }

  console.log(
    "✅ Todos los comandos pasaron la revisión."
  );

  return true;
}

/* =====================================================
   REGISTRAR COMANDOS
===================================================== */

async function registerCommands() {
  console.log("");
  console.log("🔄 Preparando registro de comandos...");
  console.log("");

  const valido = validarComandos();

  if (!valido) {
    console.log("");
    console.log(
      "⛔ Registro cancelado para evitar romper los comandos."
    );
    return false;
  }

  try {
    const rest = new REST({
      version: "10"
    }).setToken(TOKEN);

    const comandos = [];

    for (const command of client.commands.values()) {
      comandos.push(
        command.data.toJSON()
      );
    }

    console.log(
      `📦 Enviando ${comandos.length} comandos a Discord...`
    );

    await rest.put(
      Routes.applicationGuildCommands(
        CLIENT_ID,
        GUILD_ID
      ),
      {
        body: comandos
      }
    );

    console.log("");
    console.log(
      `✅ ${comandos.length} comandos registrados correctamente.`
    );
    console.log("");

    return true;

  } catch (error) {
    console.error("");
    console.error(
      "❌ ERROR REGISTRANDO COMANDOS"
    );

    console.error(
      error?.message || error
    );

    if (error?.rawError) {
      console.error("");
      console.error(
        "📋 RESPUESTA DE DISCORD:"
      );

      console.error(
        JSON.stringify(
          error.rawError,
          null,
          2
        )
      );
    }

    console.error("");
    console.error(
      "🔎 Los comandos fueron cargados, pero Discord rechazó el registro."
    );
    console.error("");

    return false;
  }
}

/* =====================================================
   OBTENER COMANDOS DE CATEGORÍA
===================================================== */

function obtenerComandosCategoria(categoria) {
  const archivo = path.join(
    commandsPath,
    `${categoria}.js`
  );

  if (!fs.existsSync(archivo)) {
    return [];
  }

  try {
    delete require.cache[
      require.resolve(archivo)
    ];

    const modulo = require(archivo);

    if (Array.isArray(modulo)) {
      return modulo;
    }

    if (modulo?.data?.name) {
      return [modulo];
    }

    return [];

  } catch (error) {
    console.error(
      `❌ Error leyendo categoría ${categoria}:`,
      error
    );

    return [];
  }
}

/* =====================================================
   READY
===================================================== */

client.once("ready", async () => {
  console.log("");
  console.log("=================================");
  console.log("       DARK FF V1 ONLINE");
  console.log("=================================");
  console.log("");
  console.log(`🤖 Bot: ${client.user.tag}`);
  console.log(`🆔 ID: ${client.user.id}`);
  console.log(
    `🏠 Servidores: ${client.guilds.cache.size}`
  );
  console.log(
    `📦 Comandos: ${client.commands.size}`
  );
  console.log("");

  client.user.setPresence({
    activities: [
      {
        name: "DARK FF V1",
        type: 3
      }
    ],
    status: "online"
  });

  await registerCommands();
});

/* =====================================================
   INTERACCIONES
===================================================== */

client.on("interactionCreate", async interaction => {
  try {

    /* =================================================
       SLASH COMMANDS
    ================================================= */

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(
        interaction.commandName
      );

      if (!command) {
        return interaction.reply({
          content:
            "❌ Ese comando no está cargado.",
          ephemeral: true
        });
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(
          `❌ Error ejecutando /${interaction.commandName}:`,
          error
        );

        const mensaje =
          "❌ Ocurrió un error ejecutando este comando.";

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: mensaje,
            ephemeral: true
          }).catch(() => {});
        } else {
          await interaction.reply({
            content: mensaje,
            ephemeral: true
          }).catch(() => {});
        }
      }

      return;
    }

    /* =================================================
       BOTÓN CREAR TICKET
    ================================================= */

    if (
      interaction.isButton() &&
      interaction.customId === "ticket_create"
    ) {
      if (!interaction.guild) {
        return interaction.reply({
          content:
            "❌ Este botón solo funciona dentro de un servidor.",
          ephemeral: true
        });
      }

      const guild = interaction.guild;

      const existente =
        guild.channels.cache.find(
          canal =>
            canal.name ===
            `ticket-${interaction.user.username
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")}`
        );

      if (existente) {
        return interaction.reply({
          content:
            `🎫 Ya tienes un ticket abierto: ${existente}`,
          ephemeral: true
        });
      }

      const categoria =
        guild.channels.cache.find(
          canal =>
            canal.type === ChannelType.GuildCategory &&
            canal.name === "🎫 TICKETS"
        );

      let ticketCategory = categoria;

      if (!ticketCategory) {
        ticketCategory =
          await guild.channels.create({
            name: "🎫 TICKETS",
            type: ChannelType.GuildCategory
          });
      }

      const canal =
        await guild.channels.create({
          name:
            `ticket-${interaction.user.username
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 20)}`,
          type: ChannelType.GuildText,
          parent: ticketCategory.id,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [
                PermissionsBitField.Flags.ViewChannel
              ]
            },
            {
              id: interaction.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },
            {
              id: client.user.id,
              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels
              ]
            }
          ]
        });

      const embed =
        new EmbedBuilder()
          .setTitle("🎫 Ticket creado")
          .setDescription(
            `Hola ${interaction.user}, explica aquí tu problema.\n\n` +
            "Un miembro del staff te atenderá pronto."
          )
          .setColor(0x5865f2);

      const cerrar =
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Cerrar ticket")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

      await canal.send({
        content:
          `${interaction.user} 🎫`,
        embeds: [embed],
        components: [cerrar]
      });

      await interaction.reply({
        content:
          `✅ Ticket creado: ${canal}`,
        ephemeral: true
      });

      return;
    }

    /* =================================================
       BOTÓN CERRAR TICKET
    ================================================= */

    if (
      interaction.isButton() &&
      interaction.customId === "ticket_close"
    ) {
      if (!interaction.channel) return;

      if (!isStaff(interaction)) {
        return interaction.reply({
          content:
            "❌ No tienes permiso para cerrar tickets.",
          ephemeral: true
        });
      }

      await interaction.reply({
        content:
          "🔒 Cerrando ticket en 5 segundos..."
      });

      setTimeout(async () => {
        await interaction.channel
          .delete()
          .catch(() => {});
      }, 5000);

      return;
    }

    /* =================================================
       HELP - CATEGORÍAS
    ================================================= */

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "help_category"
    ) {
      const categoria =
        interaction.values[0];

      try {
        const helpPath =
          path.join(
            commandsPath,
            "utilidades",
            "help.js"
          );

        if (!fs.existsSync(helpPath)) {
          return interaction.reply({
            content:
              "❌ No se encontró el sistema de ayuda.",
            ephemeral: true
          });
        }

        delete require.cache[
          require.resolve(helpPath)
        ];

        const help = require(helpPath);

        if (
          typeof help.crearCategoria !==
          "function"
        ) {
          return interaction.reply({
            content:
              "❌ El archivo help.js no tiene crearCategoria().",
            ephemeral: true
          });
        }

        const embed =
          help.crearCategoria(categoria);

        const componentes = [];

        if (
          typeof help.crearMenu ===
          "function"
        ) {
          componentes.push(
            help.crearMenu()
          );
        }

        if (
          typeof help.crearBotones ===
          "function"
        ) {
          componentes.push(
            help.crearBotones()
          );
        }

        await interaction.update({
          embeds: [embed],
          components: componentes
        });

      } catch (error) {
        console.error(
          "❌ Error en menú de ayuda:",
          error
        );

        if (!interaction.replied) {
          await interaction.reply({
            content:
              "❌ No se pudo abrir esa categoría.",
            ephemeral: true
          }).catch(() => {});
        }
      }

      return;
    }

    /* =================================================
       HELP - INICIO
    ================================================= */

    if (
      interaction.isButton() &&
      interaction.customId === "help_home"
    ) {
      try {
        const helpPath =
          path.join(
            commandsPath,
            "utilidades",
            "help.js"
          );

        if (!fs.existsSync(helpPath)) {
          return interaction.reply({
            content:
              "❌ No se encontró help.js.",
            ephemeral: true
          });
        }

        delete require.cache[
          require.resolve(helpPath)
        ];

        const help = require(helpPath);

        if (
          typeof help.crearInicio !==
          "function"
        ) {
          return interaction.reply({
            content:
              "❌ help.js no tiene crearInicio().",
            ephemeral: true
          });
        }

        const componentes = [];

        if (
          typeof help.crearMenu ===
          "function"
        ) {
          componentes.push(
            help.crearMenu()
          );
        }

        if (
          typeof help.crearBotones ===
          "function"
        ) {
          componentes.push(
            help.crearBotones()
          );
        }

        await interaction.update({
          embeds: [
            help.crearInicio()
          ],
          components: componentes
        });

      } catch (error) {
        console.error(
          "❌ Error regresando al inicio de help:",
          error
        );
      }

      return;
    }

  } catch (error) {
    console.error(
      "❌ Error general de interactionCreate:",
      error
    );
  }
});

/* =================================================
   XP / MENSAJES / ESTADÍSTICAS
================================================= */

client.on("messageCreate", async message => {
  try {
    if (message.author.bot) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    /* /niveles */

    if (!db.niveles) {
      db.niveles = {};
    }

    if (!db.niveles[guildId]) {
      db.niveles[guildId] = {
        usuarios: {},
        configuracion: {
          xpPorMensaje: 10,
          xpMinimo: 5,
          xpMaximo: 15,
          nivelBase: 100,
          canal: null,
          mensajesActivos: true,
          roles: {}
        }
      };
    }

    const niveles =
      db.niveles[guildId];

    if (!niveles.usuarios[userId]) {
      niveles.usuarios[userId] = {
        xp: 0,
        nivel: 0,
        mensajes: 0
      };
    }

    const usuario =
      niveles.usuarios[userId];

    usuario.mensajes++;

    if (
      niveles.configuracion
        .mensajesActivos !== false
    ) {
      const minimo =
        Number(
          niveles.configuracion.xpMinimo
        ) || 5;

      const maximo =
        Number(
          niveles.configuracion.xpMaximo
        ) || 15;

      const xpGanado =
        Math.floor(
          Math.random() *
            (maximo - minimo + 1)
        ) + minimo;

      usuario.xp += xpGanado;

      const base =
        Number(
          niveles.configuracion.nivelBase
        ) || 100;

      const nuevoNivel =
        Math.floor(
          usuario.xp / base
        );

      if (
        nuevoNivel >
        usuario.nivel
      ) {
        usuario.nivel =
          nuevoNivel;

        const canalId =
          niveles.configuracion.canal;

        if (canalId) {
          const canal =
            message.guild.channels.cache.get(
              canalId
            );

          if (canal) {
            canal.send(
              `🎉 ${message.author} subió al nivel **${nuevoNivel}**.`
            ).catch(() => {});
          }
        }
      }
    }

    /* /estadisticas */

    if (!db.estadisticas) {
      db.estadisticas = {};
    }

    if (!db.estadisticas[guildId]) {
      db.estadisticas[guildId] = {
        mensajes: 0,
        comandos: 0,
        usuarios: {},
        voz: {}
      };
    }

    const stats =
      db.estadisticas[guildId];

    stats.mensajes++;

    if (!stats.usuarios[userId]) {
      stats.usuarios[userId] = {
        mensajes: 0,
        comandos: 0
      };
    }

    stats.usuarios[userId].mensajes++;

    /* /automod */

    if (
      db.automod &&
      db.automod[guildId]
    ) {
      const config =
        db.automod[guildId];

      const contenido =
        message.content || "";

      /* /antilinks */

      if (
        config.antilinks &&
        /(https?:\/\/|www\.|discord\.gg\/)/i.test(
          contenido
        )
      ) {
        if (
          !message.member?.permissions.has(
            PermissionsBitField.Flags.ManageMessages
          )
        ) {
          await message.delete().catch(() => {});

          await message.channel.send(
            `🚫 ${message.author}, los enlaces no están permitidos.`
          ).then(msg => {
            setTimeout(
              () => msg.delete().catch(() => {}),
              5000
            );
          }).catch(() => {});

          return;
        }
      }

      /* /antispam */

      if (
        config.antispam &&
        contenido.length > 0
      ) {
        if (!db._spam) {
          db._spam = {};
        }

        if (!db._spam[guildId]) {
          db._spam[guildId] = {};
        }

        if (!db._spam[guildId][userId]) {
          db._spam[guildId][userId] = {
            mensajes: [],
            ultimo: 0
          };
        }

        const spam =
          db._spam[guildId][userId];

        const ahora = Date.now();

        spam.mensajes =
          spam.mensajes.filter(
            tiempo =>
              ahora - tiempo < 5000
          );

        spam.mensajes.push(ahora);

        if (spam.mensajes.length >= 6) {
          await message.delete().catch(() => {});

          await message.channel.send(
            `⚠️ ${message.author}, evita enviar tantos mensajes seguidos.`
          ).then(msg => {
            setTimeout(
              () => msg.delete().catch(() => {}),
              5000
            );
          }).catch(() => {});
        }
      }

      /* /anticaps */

      if (
        config.anticaps &&
        contenido.length >= 8
      ) {
        const letras =
          contenido.replace(
            /[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g,
            ""
          );

        if (letras.length >= 8) {
          const mayusculas =
            letras
              .split("")
              .filter(
                letra =>
                  letra ===
                  letra.toUpperCase()
              ).length;

          const porcentaje =
            mayusculas /
            letras.length;

          if (porcentaje >= 0.8) {
            await message.delete().catch(() => {});

            await message.channel.send(
              `🔠 ${message.author}, evita escribir todo en mayúsculas.`
            ).then(msg => {
              setTimeout(
                () => msg.delete().catch(() => {}),
                5000
              );
            }).catch(() => {});
          }
        }
      }
    }

    if (
      stats.mensajes % 10 === 0
    ) {
      guardarDatabase();
    }

  } catch (error) {
    console.error(
      "❌ Error en messageCreate:",
      error
    );
  }
});

/* =================================================
   ESTADÍSTICAS DE COMANDOS
================================================= */

client.on(
  "interactionCreate",
  async interaction => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    try {
      if (!db.estadisticas) {
        db.estadisticas = {};
      }

      if (!db.estadisticas[interaction.guildId]) {
        db.estadisticas[
          interaction.guildId
        ] = {
          mensajes: 0,
          comandos: 0,
          usuarios: {},
          voz: {}
        };
      }

      const stats =
        db.estadisticas[
          interaction.guildId
        ];

      stats.comandos++;

      const userId =
        interaction.user.id;

      if (!stats.usuarios[userId]) {
        stats.usuarios[userId] = {
          mensajes: 0,
          comandos: 0
        };
      }

      stats.usuarios[userId].comandos++;

    } catch (error) {
      console.error(
        "❌ Error registrando estadísticas:",
        error
      );
    }
  }
);

/* =================================================
   MIEMBRO ENTRA
================================================= */

client.on(
  "guildMemberAdd",
  async member => {
    try {
      const guildId =
        member.guild.id;

      if (!db.logs) {
        db.logs = {};
      }

      if (
        db.logs[guildId] &&
        db.logs[guildId].member
      ) {
        const canalId =
          db.logs[guildId].member;

        const canal =
          member.guild.channels.cache.get(
            canalId
          );

        if (canal) {
          const embed =
            new EmbedBuilder()
              .setTitle("📥 Miembro entró")
              .setDescription(
                `${member.user} entró al servidor.`
              )
              .addFields({
                name: "Usuario",
                value:
                  `${member.user.tag}`,
                inline: true
              })
              .setColor(0x57f287)
              .setTimestamp();

          await canal.send({
            embeds: [embed]
          });
        }
      }
    } catch (error) {
      console.error(
        "❌ Error guildMemberAdd:",
        error
      );
    }
  }
);

/* =================================================
   MIEMBRO SALE
================================================= */

client.on(
  "guildMemberRemove",
  async member => {
    try {
      const guildId =
        member.guild.id;

      if (!db.logs) {
        db.logs = {};
      }

      if (
        db.logs[guildId] &&
        db.logs[guildId].member
      ) {
        const canalId =
          db.logs[guildId].member;

        const canal =
          member.guild.channels.cache.get(
            canalId
          );

        if (canal) {
          const embed =
            new EmbedBuilder()
              .setTitle("📤 Miembro salió")
              .setDescription(
                `${member.user.tag} salió del servidor.`
              )
              .setColor(0xed4245)
              .setTimestamp();

          await canal.send({
            embeds: [embed]
          });
        }
      }
    } catch (error) {
      console.error(
        "❌ Error guildMemberRemove:",
        error
      );
    }
  }
);

/* =================================================
   VOZ
================================================= */

client.on(
  "voiceStateUpdate",
  async (oldState, newState) => {
    try {
      if (!newState.guild) return;

      const guildId =
        newState.guild.id;

      const userId =
        newState.id;

      if (!db.estadisticas) {
        db.estadisticas = {};
      }

      if (!db.estadisticas[guildId]) {
        db.estadisticas[guildId] = {
          mensajes: 0,
          comandos: 0,
          usuarios: {},
          voz: {}
        };
      }

      const stats =
        db.estadisticas[guildId];

      if (!stats.voz) {
        stats.voz = {};
      }

      if (!stats.voz[userId]) {
        stats.voz[userId] = {
          conectado: false,
          entrada: null,
          segundos: 0
        };
      }

      const usuario =
        stats.voz[userId];

      /* /voice join */

      if (
        !oldState.channelId &&
        newState.channelId
      ) {
        usuario.conectado = true;
        usuario.entrada = Date.now();
      }

      /* /voice leave */

      if (
        oldState.channelId &&
        !newState.channelId
      ) {
        if (usuario.entrada) {
          const diferencia =
            Date.now() -
            usuario.entrada;

          usuario.segundos +=
            Math.floor(
              diferencia / 1000
            );
        }

        usuario.conectado = false;
        usuario.entrada = null;
      }

    } catch (error) {
      console.error(
        "❌ Error voiceStateUpdate:",
        error
      );
    }
  }
);

/* =================================================
   LOGS - MENSAJE ELIMINADO
================================================= */

client.on(
  "messageDelete",
  async message => {
    try {
      if (!message.guild) return;

      const guildId =
        message.guild.id;

      if (!db.logs) return;
      if (!db.logs[guildId]) return;

      const canalId =
        db.logs[guildId].message;

      if (!canalId) return;

      const canal =
        message.guild.channels.cache.get(
          canalId
        );

      if (!canal) return;

      const embed =
        new EmbedBuilder()
          .setTitle("🗑️ Mensaje eliminado")
          .setColor(0xed4245)
          .setTimestamp();

      if (message.author) {
        embed.addFields({
          name: "Autor",
          value:
            `${message.author.tag}`,
          inline: true
        });
      }

      if (message.channel) {
        embed.addFields({
          name: "Canal",
          value:
            `${message.channel}`,
          inline: true
        });
      }

      if (message.content) {
        embed.addFields({
          name: "Contenido",
          value:
            message.content.slice(0, 1024)
        });
      }

      await canal.send({
        embeds: [embed]
      });

    } catch (error) {
      console.error(
        "❌ Error messageDelete:",
        error
      );
    }
  }
);

/* =================================================
   HTTP SERVER - RAILWAY
================================================= */

const server =
  http.createServer(
    (req, res) => {
      res.writeHead(
        200,
        {
          "Content-Type":
            "text/plain; charset=utf-8"
        }
      );

      res.end(
        "DARK FF V1 está online."
      );
    }
  );

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `🌐 Servidor HTTP activo en puerto ${PORT}`
    );
  }
);

/* =================================================
   LOGIN
================================================= */

client.login(TOKEN).catch(error => {
  console.error(
    "❌ No se pudo iniciar sesión:",
    error
  );
});
