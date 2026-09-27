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

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const TOKEN =
  process.env.TOKEN ||
  process.env.DISCORD_TOKEN;

const CLIENT_ID =
  process.env.CLIENT_ID ||
  process.env.DISCORD_CLIENT_ID;

const GUILD_ID =
  process.env.GUILD_ID ||
  process.env.DISCORD_GUILD_ID;

const PORT =
  Number(process.env.PORT) || 3000;

if (!TOKEN) {
  console.error("❌ Falta TOKEN en Railway.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en Railway.");
  process.exit(1);
}

if (!GUILD_ID) {
  console.warn(
    "⚠️ No existe GUILD_ID. Los comandos se registrarán globalmente."
  );
}

/* =========================================================
   CLIENTE
========================================================= */

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
    Partials.User,
    Partials.GuildMember
  ]
});

/* =========================================================
   COLECCIONES
========================================================= */

client.commands = new Collection();

/* =========================================================
   DATABASE
========================================================= */

const databasePath =
  path.join(__dirname, "database.json");

function loadDatabase() {
  try {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(
        databasePath,
        JSON.stringify({}, null, 2)
      );
    }

    const contenido =
      fs.readFileSync(
        databasePath,
        "utf8"
      );

    if (!contenido.trim()) {
      return {};
    }

    return JSON.parse(contenido);
  } catch (error) {
    console.error(
      "❌ Error leyendo database.json:",
      error
    );

    return {};
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(
      databasePath,
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error(
      "❌ Error guardando database.json:",
      error
    );
  }
}

let db = loadDatabase();

/* =========================================================
   ASEGURAR BASE DE DATOS
========================================================= */

function ensureDatabase() {
  if (!db || typeof db !== "object") {
    db = {};
  }

  const estructuras = [
    "automod",
    "logs",
    "niveles",
    "estadisticas",
    "economia",
    "tienda",
    "inventarios",
    "logros",
    "recompensas",
    "archivos",
    "privacidad",
    "tickets",
    "seguridad",
    "servidor",
    "musica"
  ];

  for (const nombre of estructuras) {
    if (!db[nombre]) {
      db[nombre] = {};
    }
  }

  if (!db.premium) {
    db.premium = {
      usuarios: {},
      servidores: {},
      configuracion: {
        activado: true
      }
    };
  }

  saveDatabase();
}

ensureDatabase();

/* =========================================================
   CARGADOR DE COMANDOS
========================================================= */

const commandsPath =
  path.join(__dirname, "commands");

const slashCommands = [];

function getCommandFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const archivos =
    fs.readdirSync(dir, {
      withFileTypes: true
    });

  const resultado = [];

  for (const archivo of archivos) {
    const ruta =
      path.join(dir, archivo.name);

    if (archivo.isDirectory()) {
      resultado.push(
        ...getCommandFiles(ruta)
      );
    } else if (
      archivo.name.endsWith(".js")
    ) {
      resultado.push(ruta);
    }
  }

  return resultado;
}

/* =========================================================
   LIMPIAR DATOS DE SLASH COMMANDS
========================================================= */

function limpiarCommandJSON(data) {
  if (!data || typeof data !== "object") {
    return data;
  }

  const copia =
    JSON.parse(JSON.stringify(data));

  /*
   * Discord permite descripciones de
   * comandos/opciones de hasta 100 caracteres.
   */

  if (
    typeof copia.description === "string" &&
    copia.description.length > 100
  ) {
    console.warn(
      `⚠️ Descripción demasiado larga en /${copia.name}. Se recortará.`
    );

    copia.description =
      copia.description.slice(0, 100);
  }

  if (Array.isArray(copia.options)) {
    for (const option of copia.options) {
      limpiarOption(option);
    }
  }

  return copia;
}

function limpiarOption(option) {
  if (!option || typeof option !== "object") {
    return;
  }

  if (
    typeof option.description === "string" &&
    option.description.length > 100
  ) {
    console.warn(
      `⚠️ Descripción larga en una opción. Se recortará.`
    );

    option.description =
      option.description.slice(0, 100);
  }

  if (
    typeof option.name === "string" &&
    option.name.length > 32
  ) {
    console.warn(
      `⚠️ Nombre de opción demasiado largo: ${option.name}`
    );
  }

  if (Array.isArray(option.options)) {
    for (const subOption of option.options) {
      limpiarOption(subOption);
    }
  }

  if (Array.isArray(option.choices)) {
    for (const choice of option.choices) {
      if (
        typeof choice.name === "string" &&
        choice.name.length > 100
      ) {
        choice.name =
          choice.name.slice(0, 100);
      }
    }
  }
}

/* =========================================================
   VALIDAR COMMAND JSON
========================================================= */

function validarCommandJSON(data) {
  if (!data) {
    return {
      valido: false,
      error: "Comando vacío."
    };
  }

  if (!data.name) {
    return {
      valido: false,
      error: "El comando no tiene nombre."
    };
  }

  if (
    !/^[a-z0-9_-]{1,32}$/.test(
      data.name
    )
  ) {
    return {
      valido: false,
      error:
        `Nombre inválido: ${data.name}`
    };
  }

  if (
    typeof data.description !== "string" ||
    data.description.length < 1
  ) {
    return {
      valido: false,
      error:
        "El comando no tiene descripción válida."
    };
  }

  return {
    valido: true
  };
}

/* =========================================================
   CARGAR TODOS LOS COMANDOS
========================================================= */

const commandFiles =
  getCommandFiles(commandsPath);

console.log(
  `📂 Archivos encontrados: ${commandFiles.length}`
);

let comandosInvalidos = 0;

for (const filePath of commandFiles) {
  try {
    delete require.cache[
      require.resolve(filePath)
    ];

    const loaded =
      require(filePath);

    const comandos =
      Array.isArray(loaded)
        ? loaded
        : [loaded];

    for (const command of comandos) {
      if (
        !command ||
        !command.data ||
        typeof command.execute !== "function"
      ) {
        console.warn(
          `⚠️ Comando inválido en: ${filePath}`
        );

        comandosInvalidos++;
        continue;
      }

      const nombre =
        command.data.name;

      if (!nombre) {
        console.warn(
          `⚠️ Comando sin nombre en: ${filePath}`
        );

        comandosInvalidos++;
        continue;
      }

      if (
        client.commands.has(nombre)
      ) {
        console.warn(
          `⚠️ Comando duplicado ignorado: /${nombre}`
        );

        continue;
      }

      let json;

      try {
        json =
          command.data.toJSON();
      } catch (error) {
        console.error(
          `❌ No se pudo convertir /${nombre}:`,
          error
        );

        comandosInvalidos++;
        continue;
      }

      json =
        limpiarCommandJSON(json);

      const validacion =
        validarCommandJSON(json);

      if (!validacion.valido) {
        console.error(
          `❌ /${nombre} NO registrado: ${validacion.error}`
        );

        comandosInvalidos++;
        continue;
      }

      client.commands.set(
        nombre,
        command
      );

      slashCommands.push(json);

      console.log(
        `✅ Cargado: /${nombre}`
      );
    }
  } catch (error) {
    console.error(
      `❌ Error cargando archivo: ${filePath}`
    );

    console.error(error);

    comandosInvalidos++;
  }
}

console.log(
  "================================="
);

console.log(
  `📦 Comandos cargados: ${client.commands.size}`
);

console.log(
  `⚠️ Comandos con problemas: ${comandosInvalidos}`
);

console.log(
  "================================="
);

/* =========================================================
   REGISTRAR COMANDOS EN DISCORD
========================================================= */

async function registerCommands() {
  try {
    const rest =
      new REST({
        version: "10"
      }).setToken(TOKEN);

    console.log(
      "🔄 Registrando Slash Commands..."
    );

    /*
     * Primero mostramos todos los comandos
     * que Discord recibirá.
     */

    console.log(
      `📤 Enviando ${slashCommands.length} comandos...`
    );

    if (GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(
          CLIENT_ID,
          GUILD_ID
        ),
        {
          body: slashCommands
        }
      );

      console.log(
        `✅ ${slashCommands.length} comandos registrados en el servidor.`
      );

      console.log(
        "💡 Los comandos deberían aparecer inmediatamente al escribir /"
      );
    } else {
      await rest.put(
        Routes.applicationCommands(
          CLIENT_ID
        ),
        {
          body: slashCommands
        }
      );

      console.log(
        `🌍 ${slashCommands.length} comandos registrados globalmente.`
      );
    }
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "❌ ERROR REGISTRANDO COMANDOS"
    );

    console.error(
      "================================="
    );

    console.error(
      error?.message || error
    );

    /*
     * Intentamos encontrar el comando
     * que provoca el problema.
     */

    console.log(
      "🔎 Buscando comando problemático..."
    );

    for (
      const comando of slashCommands
    ) {
      try {
        if (
          typeof comando.description ===
            "string" &&
          comando.description.length > 100
        ) {
          console.error(
            `❌ Descripción larga: /${comando.name}`
          );
        }

        if (
          Array.isArray(
            comando.options
          )
        ) {
          revisarOpciones(
            comando.name,
            comando.options
          );
        }
      } catch {}
    }

    console.error(
      "⚠️ Revisa el comando señalado arriba."
    );
  }
}

function revisarOpciones(
  commandName,
  options
) {
  for (const option of options) {
    if (
      option.description &&
      option.description.length > 100
    ) {
      console.error(
        `❌ /${commandName}: opción "${option.name}" tiene descripción demasiado larga.`
      );
    }

    if (Array.isArray(option.options)) {
      revisarOpciones(
        commandName,
        option.options
      );
    }
  }
}

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function isStaff(member) {
  if (!member) {
    return false;
  }

  if (
    member.permissions.has(
      PermissionsBitField.Flags.Administrator
    )
  ) {
    return true;
  }

  return member.permissions.has(
    PermissionsBitField.Flags.ManageGuild
  );
}

function isOwner(userId) {
  return (
    userId ===
    process.env.OWNER_ID
  );
}

function getGuildDatabase(guildId) {
  if (!db[guildId]) {
    db[guildId] = {};
  }

  return db[guildId];
}

function save() {
  saveDatabase();
}

/* =========================================================
   OBTENER COMANDOS DE CATEGORÍA
========================================================= */

function obtenerComandosCategoria(
  categoria
) {
  const archivo =
    path.join(
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

    const loaded =
      require(archivo);

    const comandos =
      Array.isArray(loaded)
        ? loaded
        : [loaded];

    return comandos
      .filter(
        command =>
          command &&
          command.data &&
          command.data.name
      )
      .map(
        command =>
          command.data.name
      );
  } catch (error) {
    console.error(
      `❌ Error leyendo categoría ${categoria}:`,
      error
    );

    return [];
  }
}

/* =========================================================
   READY
========================================================= */

client.once(
  "ready",
  async () => {
    console.log(
      "================================="
    );

    console.log(
      `🤖 ${client.user.tag}`
    );

    console.log(
      `🆔 ${client.user.id}`
    );

    console.log(
      `🌐 Servidores: ${client.guilds.cache.size}`
    );

    console.log(
      `📦 Comandos: ${client.commands.size}`
    );

    console.log(
      "================================="
    );

    client.user.setPresence({
      activities: [
        {
          name:
            "/help | DARK FF V1",
          type: 0
        }
      ],
      status: "online"
    });

    await registerCommands();
  }
);

/* =========================================================
   INTERACCIONES
========================================================= */

client.on(
  "interactionCreate",
  async interaction => {
    try {

      /* =====================================================
         SLASH COMMANDS
      ===================================================== */

      if (
        interaction.isChatInputCommand()
      ) {
        const command =
          client.commands.get(
            interaction.commandName
          );

        if (!command) {
          return interaction.reply({
            content:
              "❌ Este comando no existe.",
            ephemeral: true
          });
        }

        /*
         * ESTADÍSTICAS
         */

        try {
          const guildId =
            interaction.guild?.id;

          if (guildId) {
            if (
              !db.estadisticas[
                guildId
              ]
            ) {
              db.estadisticas[
                guildId
              ] = {
                mensajes: 0,
                comandos: 0,
                miembros: 0,
                usuarios: {},
                comandosUsados: {},
                canales: {},
                voz: {}
              };
            }

            const stats =
              db.estadisticas[
                guildId
              ];

            stats.comandos =
              Number(
                stats.comandos || 0
              ) + 1;

            if (
              !stats.comandosUsados
            ) {
              stats.comandosUsados =
                {};
            }

            stats.comandosUsados[
              interaction.commandName
            ] =
              Number(
                stats.comandosUsados[
                  interaction.commandName
                ] || 0
              ) + 1;

            if (
              !stats.usuarios
            ) {
              stats.usuarios =
                {};
            }

            if (
              !stats.usuarios[
                interaction.user.id
              ]
            ) {
              stats.usuarios[
                interaction.user.id
              ] = {
                mensajes: 0,
                comandos: 0
              };
            }

            stats.usuarios[
              interaction.user.id
            ].comandos =
              Number(
                stats.usuarios[
                  interaction.user.id
                ].comandos || 0
              ) + 1;

            save();
          }
        } catch (error) {
          console.error(
            "❌ Error actualizando estadísticas:",
            error
          );
        }

        /*
         * EJECUTAR COMANDO REAL
         */

        try {
          await command.execute(
            interaction
          );
        } catch (error) {
          console.error(
            `❌ Error ejecutando /${interaction.commandName}:`,
            error
          );

          const mensaje =
            "❌ Ocurrió un error ejecutando este comando.";

          if (
            interaction.replied ||
            interaction.deferred
          ) {
            await interaction
              .editReply({
                content: mensaje
              })
              .catch(() => {});
          } else {
            await interaction
              .reply({
                content: mensaje,
                ephemeral: true
              })
              .catch(() => {});
          }
        }

        return;
      }

      /* =====================================================
   CREAR TICKET
===================================================== */

if (
  interaction.isButton() &&
  interaction.customId === "ticket_create"
) {
  if (!interaction.guild) {
    return interaction.reply({
      content:
        "❌ Este botón solo funciona en servidores.",
      ephemeral: true
    });
  }

  const guild = interaction.guild;

  let category =
    guild.channels.cache.find(
      channel =>
        channel.type === ChannelType.GuildCategory &&
        channel.name === "🎫 TICKETS"
    );

  if (!category) {
    category =
      await guild.channels.create({
        name: "🎫 TICKETS",
        type: ChannelType.GuildCategory
      });
  }

  const safeName =
    interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 15);

  const ticketName = `ticket-${safeName}`;

  const existing =
    guild.channels.cache.find(
      channel =>
        channel.parentId === category.id &&
        channel.name === ticketName
    );

  if (existing) {
    return interaction.reply({
      content:
        `❌ Ya tienes un ticket abierto: ${existing}`,
      ephemeral: true
    });
  }

  const channel =
    await guild.channels.create({
      name: ticketName,
      type: ChannelType.GuildText,
      parent: category.id,

      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ["ViewChannel"]
        },
        {
          id: interaction.user.id,
          allow: [
            "ViewChannel",
            "SendMessages",
            "ReadMessageHistory"
          ]
        }
      ]
    });

  const embed =
    new EmbedBuilder()
      .setTitle("🎫 Ticket creado")
      .setDescription(
        "Explica tu problema y espera a que el equipo te atienda."
      )
      .setColor("Blue");

  const row =
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("ticket_close")
          .setLabel("Cerrar ticket")
          .setEmoji("🔒")
          .setStyle(ButtonStyle.Danger)
      );

  await channel.send({
    content:
      `<@${interaction.user.id}>`,
    embeds: [embed],
    components: [row]
  });

  await interaction.reply({
    content:
      `✅ Ticket creado: ${channel}`,
    ephemeral: true
  });

  return;
}

/* =====================================================
   CERRAR TICKET
===================================================== */

if (
  interaction.isButton() &&
  interaction.customId === "ticket_close"
) {
  if (!interaction.channel) {
    return;
  }

  const puedeCerrar =
    isStaff(interaction.member) ||
    interaction.channel.name?.startsWith("ticket-");

  if (!puedeCerrar) {
    return interaction.reply({
      content:
        "❌ No puedes cerrar este ticket.",
      ephemeral: true
    });
  }

  await interaction.reply(
    "🔒 Este ticket se cerrará en 5 segundos..."
  );

  setTimeout(() => {
    interaction.channel
      .delete()
      .catch(() => {});
  }, 5000);

  return;
}

/* =====================================================
   MENÚ /HELP
===================================================== */

if (
  interaction.isStringSelectMenu() &&
  interaction.customId === "help_category"
) {
  const categoria =
    interaction.values?.[0];

  if (!categoria) {
    return;
  }

  const comandosCategoria =
    obtenerComandosCategoria(categoria);

  const embed =
    new EmbedBuilder()
      .setTitle(
        `📚 DARK FF V1 — ${categoria}`
      )
      .setDescription(
        comandosCategoria.length
          ? comandosCategoria
              .map(
                name => `\`/${name}\``
              )
              .join("\n")
          : "No se encontraron comandos."
      )
      .setColor("Blue")
      .setFooter({
        text:
          "Escribe / seguido del nombre del comando para utilizarlo."
      });

  await interaction.update({
    embeds: [embed]
  });

  return;
}

/* =====================================================
   BOTÓN INICIO DE /HELP
===================================================== */

if (
  interaction.isButton() &&
  interaction.customId === "help_home"
) {
  const embed =
    new EmbedBuilder()
      .setTitle("📚 DARK FF V1")
      .setDescription(
        `Bot multifunción con **${client.commands.size} comandos**.\n\n` +
        "Selecciona una categoría para ver los comandos disponibles.\n\n" +
        "Después puedes escribir el comando directamente, por ejemplo `/ban`."
      )
      .setColor("Blue");

  try {
    const helpPath =
      path.join(
        commandsPath,
        "utilidades",
        "help.js"
      );

    if (fs.existsSync(helpPath)) {
      delete require.cache[
        require.resolve(helpPath)
      ];

      const help =
        require(helpPath);

      const components = [];

      if (
        typeof help.crearMenu ===
        "function"
      ) {
        components.push(
          help.crearMenu()
        );
      }

      if (
        typeof help.crearBotones ===
        "function"
      ) {
        components.push(
          help.crearBotones()
        );
      }

      await interaction.update({
        embeds: [embed],
        components
      });

      return;
    }
  } catch (error) {
    console.error(
      "❌ Error recuperando menú help:",
      error
    );
  }

  await interaction.update({
    embeds: [embed]
  });

  return;
}

} catch (error) {
  console.error(
    "❌ Error en interactionCreate:",
    error
  );

  try {
    if (
      !interaction.replied &&
      !interaction.deferred
    ) {
      await interaction.reply({
        content:
          "❌ Ocurrió un error.",
        ephemeral: true
      });
    }
  } catch {}
}
});

/* =========================================================
   SISTEMA DE NIVELES + ESTADÍSTICAS
========================================================= */

client.on(
  "messageCreate",
  async message => {
    if (!message.guild) {
      return;
    }

    if (message.author.bot) {
      return;
    }

    try {
      const guildId =
        message.guild.id;

      const userId =
        message.author.id;

      /* ===================================================
         ESTADÍSTICAS
      =================================================== */

      if (!db.estadisticas[guildId]) {
        db.estadisticas[guildId] = {
          mensajes: 0,
          comandos: 0,
          miembros: 0,
          usuarios: {},
          comandosUsados: {},
          canales: {},
          voz: {}
        };
      }

      const stats =
        db.estadisticas[guildId];

      stats.mensajes =
        Number(stats.mensajes || 0) + 1;

      if (!stats.usuarios[userId]) {
        stats.usuarios[userId] = {
          mensajes: 0,
          comandos: 0
        };
      }

      stats.usuarios[userId].mensajes =
        Number(
          stats.usuarios[userId].mensajes || 0
        ) + 1;

      if (!stats.canales[message.channel.id]) {
        stats.canales[message.channel.id] = 0;
      }

      stats.canales[message.channel.id]++;

      /* ===================================================
         NIVELES
      =================================================== */

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

      if (
        niveles.configuracion &&
        niveles.configuracion.mensajesActivos !== false
      ) {
        if (!niveles.usuarios[userId]) {
          niveles.usuarios[userId] = {
            xp: 0,
            nivel: 0,
            mensajes: 0
          };
        }

        const usuario =
          niveles.usuarios[userId];

        usuario.mensajes =
          Number(usuario.mensajes || 0) + 1;

        const minimo =
          Number(
            niveles.configuracion.xpMinimo || 5
          );

        const maximo =
          Number(
            niveles.configuracion.xpMaximo || 15
          );

        const xpGanado =
          Math.floor(
            Math.random() *
              (maximo - minimo + 1)
          ) + minimo;

        usuario.xp =
          Number(usuario.xp || 0) +
          xpGanado;

        const base =
          Number(
            niveles.configuracion.nivelBase || 100
          );

        const nivelAnterior =
          Number(usuario.nivel || 0);

        const nuevoNivel =
          Math.floor(
            usuario.xp / base
          );

        usuario.nivel =
          nuevoNivel;

        /* ===============================================
           SUBIDA DE NIVEL
        =============================================== */

        if (
          nuevoNivel >
          nivelAnterior
        ) {
          const canalNivel =
            niveles.configuracion.canal;

          const canal =
            canalNivel
              ? message.guild.channels.cache.get(
                  canalNivel
                )
              : message.channel;

          if (canal?.isTextBased()) {
            canal
              .send(
                `🎉 <@${userId}> subió al **nivel ${nuevoNivel}**!`
              )
              .catch(() => {});
          }

          /* =============================================
             ROLES POR NIVEL
          ============================================= */

          const roles =
            niveles.configuracion.roles || {};

          const roleId =
            roles[String(nuevoNivel)];

          if (roleId) {
            const role =
              message.guild.roles.cache.get(
                roleId
              );

            if (role) {
              message.member.roles
                .add(role)
                .catch(() => {});
            }
          }
        }
      }

      save();

    } catch (error) {
      console.error(
        "❌ Error en messageCreate:",
        error
      );
    }
  }
);

/* =========================================================
   MIEMBRO ENTRA
========================================================= */

client.on(
  "guildMemberAdd",
  async member => {
    try {
      const guildId =
        member.guild.id;

      if (!db.estadisticas[guildId]) {
        db.estadisticas[guildId] = {
          mensajes: 0,
          comandos: 0,
          miembros: 0,
          usuarios: {},
          comandosUsados: {},
          canales: {},
          voz: {}
        };
      }

      db.estadisticas[guildId].miembros =
        member.guild.memberCount;

      save();

    } catch (error) {
      console.error(
        "❌ Error guildMemberAdd:",
        error
      );
    }
  }
);

/* =========================================================
   MIEMBRO SALE
========================================================= */

client.on(
  "guildMemberRemove",
  async member => {
    try {
      const guildId =
        member.guild.id;

      if (db.estadisticas[guildId]) {
        db.estadisticas[guildId].miembros =
          member.guild.memberCount;

        save();
      }

    } catch (error) {
      console.error(
        "❌ Error guildMemberRemove:",
        error
      );
    }
  }
);

/* =========================================================
   VOZ / ESTADÍSTICAS
========================================================= */

client.on(
  "voiceStateUpdate",
  async (oldState, newState) => {
    try {
      const guildId =
        newState.guild.id;

      const userId =
        newState.id;

      if (!db.estadisticas[guildId]) {
        db.estadisticas[guildId] = {
          mensajes: 0,
          comandos: 0,
          miembros: 0,
          usuarios: {},
          comandosUsados: {},
          canales: {},
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
          entradas: 0,
          salidas: 0,
          canal: null
        };
      }

      /* Entró a voz */

      if (
        !oldState.channelId &&
        newState.channelId
      ) {
        stats.voz[userId].entradas++;

        stats.voz[userId].canal =
          newState.channelId;
      }

      /* Salió de voz */

      if (
        oldState.channelId &&
        !newState.channelId
      ) {
        stats.voz[userId].salidas++;

        stats.voz[userId].canal =
          null;
      }

      /* Cambió de canal */

      if (
        oldState.channelId &&
        newState.channelId &&
        oldState.channelId !==
          newState.channelId
      ) {
        stats.voz[userId].canal =
          newState.channelId;
      }

      save();

    } catch (error) {
      console.error(
        "❌ Error voiceStateUpdate:",
        error
      );
    }
  }
);

/* =========================================================
   LOGS BÁSICOS
========================================================= */

async function enviarLog(
  guild,
  tipo,
  contenido
) {
  try {
    if (!db.logs) {
      db.logs = {};
    }

    const configuracion =
      db.logs[guild.id];

    if (!configuracion) {
      return;
    }

    const canalId =
      configuracion[tipo] ||
      configuracion.canal;

    if (!canalId) {
      return;
    }

    const canal =
      guild.channels.cache.get(
        canalId
      );

    if (!canal?.isTextBased()) {
      return;
    }

    await canal.send({
      content: contenido
    });

  } catch {}
}

/* =========================================================
   MENSAJE ELIMINADO
========================================================= */

client.on(
  "messageDelete",
  async message => {
    if (
      !message.guild ||
      message.author?.bot
    ) {
      return;
    }

    await enviarLog(
      message.guild,
      "mensajes",
      `🗑️ Mensaje eliminado de <#${message.channel.id}> de ${message.author}.`
    );
  }
);

/* =========================================================
   BAN
========================================================= */

client.on(
  "guildBanAdd",
  async ban => {
    await enviarLog(
      ban.guild,
      "bans",
      `🔨 ${ban.user.tag} fue baneado.`
    );
  }
);

/* =========================================================
   SERVIDOR HTTP PARA RAILWAY
========================================================= */

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
        "DARK FF V1 está funcionando correctamente."
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

/* =========================================================
   LOGIN
========================================================= */

client
  .login(TOKEN)
  .then(() => {
    console.log(
      "🔑 Conectando con Discord..."
    );
  })
  .catch(error => {
    console.error(
      "❌ Error iniciando sesión en Discord:",
      error
    );
  });
