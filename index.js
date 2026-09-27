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
  PermissionsBitField
} = require("discord.js");

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const TOKEN = process.env.TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID || process.env.DISCORD_CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || process.env.DISCORD_GUILD_ID;

const PORT = process.env.PORT || 3000;

if (!TOKEN) {
  console.error("❌ Falta TOKEN en las variables de entorno.");
  process.exit(1);
}

if (!CLIENT_ID) {
  console.error("❌ Falta CLIENT_ID en las variables de entorno.");
  process.exit(1);
}

/* =========================================================
   CLIENTE DISCORD
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

const databasePath = path.join(__dirname, "database.json");

function loadDatabase() {
  try {
    if (!fs.existsSync(databasePath)) {
      fs.writeFileSync(databasePath, JSON.stringify({}, null, 2));
    }

    const data = fs.readFileSync(databasePath, "utf8");

    if (!data.trim()) {
      return {};
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error leyendo database.json:", error);
    return {};
  }
}

function saveDatabase(db) {
  try {
    fs.writeFileSync(
      databasePath,
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error("❌ Error guardando database.json:", error);
  }
}

let db = loadDatabase();

function ensureDatabase() {
  if (!db || typeof db !== "object") {
    db = {};
  }

  if (!db.automod) db.automod = {};
  if (!db.logs) db.logs = {};
  if (!db.niveles) db.niveles = {};
  if (!db.estadisticas) db.estadisticas = {};
  if (!db.economia) db.economia = {};
  if (!db.tienda) db.tienda = {};
  if (!db.inventarios) db.inventarios = {};
  if (!db.logros) db.logros = {};
  if (!db.recompensas) db.recompensas = {};
  if (!db.premium) db.premium = {};
  if (!db.archivos) db.archivos = {};

  saveDatabase(db);
}

ensureDatabase();

/* =========================================================
   CARGAR COMANDOS
========================================================= */

const commandsPath = path.join(__dirname, "commands");

const slashCommands = [];

function getCommandFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir, {
    withFileTypes: true
  });

  const result = [];

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      result.push(...getCommandFiles(fullPath));
    } else if (file.name.endsWith(".js")) {
      result.push(fullPath);
    }
  }

  return result;
}

const commandFiles = getCommandFiles(commandsPath);

console.log(`📂 Archivos encontrados: ${commandFiles.length}`);

for (const filePath of commandFiles) {
  try {
    delete require.cache[require.resolve(filePath)];

    const loaded = require(filePath);

    const commands = Array.isArray(loaded)
      ? loaded
      : [loaded];

    for (const command of commands) {
      if (!command || !command.data) {
        console.warn(
          `⚠️ Comando inválido en: ${filePath}`
        );
        continue;
      }

      const commandName = command.data.name;

      if (!commandName) {
        console.warn(
          `⚠️ Comando sin nombre en: ${filePath}`
        );
        continue;
      }

      /*
       * Evita que dos archivos registren
       * exactamente el mismo comando.
       */

      if (client.commands.has(commandName)) {
        const existente = client.commands.get(commandName);

        console.warn(
          `⚠️ Comando duplicado ignorado: /${commandName}`
        );

        console.warn(
          `   Se conservará el primer comando cargado.`
        );

        continue;
      }

      client.commands.set(commandName, command);

      slashCommands.push(
        command.data.toJSON()
      );

      console.log(`✅ /${commandName}`);
    }
  } catch (error) {
    console.error(
      `❌ Error cargando ${filePath}:`,
      error
    );
  }
}

console.log(
  `📦 Comandos cargados: ${client.commands.size}`
);

/* =========================================================
   REGISTRAR SLASH COMMANDS
========================================================= */

async function registerCommands() {
  try {
    const rest = new REST({
      version: "10"
    }).setToken(TOKEN);

    console.log("🔄 Registrando comandos...");

    /*
     * Si existe GUILD_ID:
     * se registran instantáneamente en ese servidor.
     */

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
    } else {
      /*
       * Registro global.
       * Puede tardar en actualizarse.
       */

      await rest.put(
        Routes.applicationCommands(CLIENT_ID),
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
      "❌ Error registrando comandos:",
      error
    );
  }
}

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function isStaff(member) {
  if (!member) return false;

  return member.permissions.has(
    PermissionsBitField.Flags.ManageGuild
  ) ||
  member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );
}

function getGuildDatabase(guildId) {
  if (!db[guildId]) {
    db[guildId] = {};
  }

  return db[guildId];
}

function save() {
  saveDatabase(db);
}

/* =========================================================
   BOT READY
========================================================= */

client.once("ready", async () => {
  console.log("=================================");
  console.log(`🤖 ${client.user.tag}`);
  console.log(`🆔 ${client.user.id}`);
  console.log(`🌐 Servidores: ${client.guilds.cache.size}`);
  console.log(`📦 Comandos: ${client.commands.size}`);
  console.log("=================================");

  client.user.setPresence({
    activities: [
      {
        name: "/help | DARK FF V1",
        type: 0
      }
    ],
    status: "online"
  });

  await registerCommands();
});

/* =========================================================
   INTERACCIONES
========================================================= */

client.on("interactionCreate", async interaction => {
  try {
    /* =====================================================
       SLASH COMMANDS
    ===================================================== */

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(
        interaction.commandName
      );

      if (!command) {
        return interaction.reply({
          content: "❌ Este comando no existe.",
          ephemeral: true
        });
      }

      /*
       * Estadísticas de comandos
       */

      try {
        const guildId = interaction.guild?.id;

        if (guildId) {
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

          const stats = db.estadisticas[guildId];

          stats.comandos =
            Number(stats.comandos || 0) + 1;

          if (!stats.comandosUsados) {
            stats.comandosUsados = {};
          }

          stats.comandosUsados[
            interaction.commandName
          ] =
            Number(
              stats.comandosUsados[
                interaction.commandName
              ] || 0
            ) + 1;

          if (!stats.usuarios) {
            stats.usuarios = {};
          }

          if (!stats.usuarios[interaction.user.id]) {
            stats.usuarios[interaction.user.id] = {
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
          "Error actualizando estadísticas:",
          error
        );
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

      return;
    }

    /* =====================================================
       BOTÓN: CREAR TICKET
    ===================================================== */

    if (
      interaction.isButton() &&
      interaction.customId === "ticket_create"
    ) {
      if (!interaction.guild) {
        return interaction.reply({
          content: "❌ Este botón solo funciona en servidores.",
          ephemeral: true
        });
      }

      const guild = interaction.guild;

      let category =
        guild.channels.cache.find(
          channel =>
            channel.type === 4 &&
            channel.name === "🎫 TICKETS"
        );

      if (!category) {
        category = await guild.channels.create({
          name: "🎫 TICKETS",
          type: 4
        });
      }

      const existing = guild.channels.cache.find(
        channel =>
          channel.parentId === category.id &&
          channel.name ===
            `ticket-${interaction.user.username
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 15)}`
      );

      if (existing) {
        return interaction.reply({
          content: `❌ Ya tienes un ticket abierto: ${existing}`,
          ephemeral: true
        });
      }

      const safeName =
        interaction.user.username
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 15);

      const channel =
        await guild.channels.create({
          name: `ticket-${safeName}`,
          type: 0,
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

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket creado")
        .setDescription(
          "Explica tu problema y espera a que el equipo te atienda."
        )
        .setColor("Blue");

      const {
        ActionRowBuilder,
        ButtonBuilder,
        ButtonStyle
      } = require("discord.js");

      const row =
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("ticket_close")
            .setLabel("Cerrar ticket")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Danger)
        );

      await channel.send({
        content: `<@${interaction.user.id}>`,
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: `✅ Ticket creado: ${channel}`,
        ephemeral: true
      });

      return;
    }

    /* =====================================================
       BOTÓN: CERRAR TICKET
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
          content: "❌ No puedes cerrar este ticket.",
          ephemeral: true
        });
      }

      await interaction.reply(
        "🔒 Este ticket se cerrará en 5 segundos..."
      );

      setTimeout(() => {
        interaction.channel.delete().catch(() => {});
      }, 5000);

      return;
    }

    /* =====================================================
       MENÚ DE AYUDA
    ===================================================== */

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "help_category"
    ) {
      const categoria =
        interaction.values?.[0];

      if (!categoria) return;

      const comandosCategoria =
        obtenerComandosCategoria(categoria);

      const embed = new EmbedBuilder()
        .setTitle(`📚 DARK FF V1 — ${categoria}`)
        .setDescription(
          comandosCategoria.length
            ? comandosCategoria
                .map(name => `\`/${name}\``)
                .join("\n")
            : "No se encontraron comandos."
        )
        .setColor("Blue")
        .setFooter({
          text: "DARK FF V1"
        });

      await interaction.update({
        embeds: [embed]
      });

      return;
    }

    /* =====================================================
       BOTONES DE AYUDA
    ===================================================== */

    if (
      interaction.isButton() &&
      interaction.customId.startsWith("help_")
    ) {
      /*
       * Los botones de ayuda se procesan aquí.
       * Los botones desconocidos no hacen nada.
       */

      if (interaction.customId === "help_home") {
        const embed = new EmbedBuilder()
          .setTitle("📚 DARK FF V1")
          .setDescription(
            `Bot multifunción con **${client.commands.size} comandos**.\n\n` +
            "Selecciona una categoría para ver sus comandos."
          )
          .setColor("Blue");

        await interaction.update({
          embeds: [embed]
        });

        return;
      }

      if (interaction.customId === "help_info") {
        const embed = new EmbedBuilder()
          .setTitle("ℹ️ DARK FF V1")
          .setDescription(
            "Bot multifunción para administración, diversión, economía, niveles, tickets, seguridad y mucho más."
          )
          .setColor("Purple");

        await interaction.update({
          embeds: [embed]
        });

        return;
      }
    }
  } catch (error) {
    console.error(
      "❌ Error en interactionCreate:",
      error
    );
  }
});

/* =========================================================
   OBTENER COMANDOS POR CATEGORÍA
========================================================= */

function obtenerComandosCategoria(categoria) {
  const archivo = path.join(
    commandsPath,
    `${categoria}.js`
  );

  if (!fs.existsSync(archivo)) {
    return [];
  }

  try {
    delete require.cache[require.resolve(archivo)];

    const loaded = require(archivo);

    const comandos = Array.isArray(loaded)
      ? loaded
      : [loaded];

    return comandos
      .filter(command => command?.data?.name)
      .map(command => command.data.name);
  } catch {
    return [];
  }
}

/* =========================================================
   SISTEMA DE NIVELES
========================================================= */

client.on("messageCreate", async message => {
  if (!message.guild) return;
  if (message.author.bot) return;

  try {
    const guildId = message.guild.id;
    const userId = message.author.id;

    /*
     * ESTADÍSTICAS
     */

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

    const stats = db.estadisticas[guildId];

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

    /*
     * NIVELES
     */

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

    const niveles = db.niveles[guildId];

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
        Number(usuario.xp || 0) + xpGanado;

      const base =
        Number(
          niveles.configuracion.nivelBase || 100
        );

      const nivelAnterior =
        Number(usuario.nivel || 0);

      const nuevoNivel =
        Math.floor(usuario.xp / base);

      usuario.nivel = nuevoNivel;

      /*
       * Aviso de subida de nivel
       */

      if (nuevoNivel > nivelAnterior) {
        const canalNivel =
          niveles.configuracion.canal;

        const canal =
          canalNivel
            ? message.guild.channels.cache.get(
                canalNivel
              )
            : message.channel;

        if (canal?.isTextBased()) {
          canal.send(
            `🎉 <@${userId}> subió al **nivel ${nuevoNivel}**!`
          ).catch(() => {});
        }

                 /*
         * Roles por nivel
         */

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
            message.member.roles.add(role)
              .catch(() => {});
          }
        }
      }
    }

    /*
     * AUTO MOD
     */

    await ejecutarAutoMod(message);

    save();
  } catch (error) {
    console.error(
      "❌ Error en messageCreate:",
      error
    );
  }
});

/* =========================================================
   AUTOMOD
========================================================= */

async function ejecutarAutoMod(message) {
  const guildId = message.guild.id;

  if (!db.automod[guildId]) {
    return;
  }

  const config = db.automod[guildId];

  /*
   * ANTILINKS
   */

  if (
    config.antilinks?.activo &&
    /(https?:\/\/|www\.)/i.test(message.content || "")
  ) {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      await message.delete().catch(() => {});

      const aviso =
        await message.channel.send(
          `🚫 <@${message.author.id}> no se permiten enlaces aquí.`
        ).catch(() => null);

      if (aviso) {
        setTimeout(() => {
          aviso.delete().catch(() => {});
        }, 5000);
      }

      return;
    }
  }

  /*
   * INVITES
   */

  if (
    config.antiinvite?.activo &&
    /discord(?:\.gg|\.com\/invite)\/[a-z0-9-]+/i.test(
      message.content || ""
    )
  ) {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      await message.delete().catch(() => {});

      const aviso =
        await message.channel.send(
          `🚫 <@${message.author.id}> no se permiten invitaciones de Discord.`
        ).catch(() => null);

      if (aviso) {
        setTimeout(() => {
          aviso.delete().catch(() => {});
        }, 5000);
      }

      return;
    }
  }

  /*
   * CAPS
   */

  if (config.anticaps?.activo) {
    const contenido = message.content || "";

    const letras =
      contenido.match(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/g);

    const mayusculas =
      contenido.match(/[A-ZÁÉÍÓÚÑ]/g);

    if (
      letras &&
      mayusculas &&
      letras.length >= 10 &&
      mayusculas.length / letras.length >= 0.75
    ) {
      await message.delete().catch(() => {});

      const aviso =
        await message.channel.send(
          `🔤 <@${message.author.id}> evita escribir todo en mayúsculas.`
        ).catch(() => null);

      if (aviso) {
        setTimeout(() => {
          aviso.delete().catch(() => {});
        }, 4000);
      }

      return;
    }
  }

  /*
   * MENCIONES
   */

  if (
    config.antimentions?.activo &&
    message.mentions.users.size >
      Number(config.antimentions.maximo || 5)
  ) {
    if (
      !message.member.permissions.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      await message.delete().catch(() => {});
      return;
    }
  }

  /*
   * BAD WORDS
   */

  if (config.antibadwords?.activo) {
    const palabras =
      config.antibadwords.palabras || [];

    const contenido =
      (message.content || "").toLowerCase();

    const encontrada =
      palabras.some(palabra =>
        contenido.includes(
          String(palabra).toLowerCase()
        )
      );

    if (encontrada) {
      await message.delete().catch(() => {});

      const aviso =
        await message.channel.send(
          `🚫 <@${message.author.id}> ese mensaje no está permitido.`
        ).catch(() => null);

      if (aviso) {
        setTimeout(() => {
          aviso.delete().catch(() => {});
        }, 4000);
      }

      return;
    }
  }

  /*
   * EMOJIS EXCESIVOS
   */

  if (config.antiemoji?.activo) {
    const emojis =
      (message.content || "").match(
        /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu
      ) || [];

    const limite =
      Number(config.antiemoji.maximo || 10);

    if (emojis.length > limite) {
      await message.delete().catch(() => {});
      return;
    }
  }

  /*
   * FLOOD / REPETICIÓN
   */

  if (
    config.antiflood?.activo ||
    config.antiduplicates?.activo
  ) {
    if (!db.automodRuntime) {
      db.automodRuntime = {};
    }

    if (!db.automodRuntime[guildId]) {
      db.automodRuntime[guildId] = {};
    }

    if (
      !db.automodRuntime[guildId][message.author.id]
    ) {
      db.automodRuntime[guildId][message.author.id] = {
        mensajes: [],
        ultimo: ""
      };
    }

    const runtime =
      db.automodRuntime[guildId][message.author.id];

    const ahora = Date.now();

    runtime.mensajes =
      runtime.mensajes.filter(
        tiempo =>
          ahora - tiempo < 7000
      );

    runtime.mensajes.push(ahora);

    if (
      config.antiflood?.activo &&
      runtime.mensajes.length >= 6
    ) {
      await message.delete().catch(() => {});
      return;
    }

    if (
      config.antiduplicates?.activo &&
      runtime.ultimo &&
      runtime.ultimo === message.content &&
      (message.content || "").length > 2
    ) {
      await message.delete().catch(() => {});
      return;
    }

    runtime.ultimo = message.content || "";
  }

  /*
   * ANTISPAM BÁSICO
   */

  if (
    config.antispam?.activo &&
    (message.content || "").length > 1500
  ) {
    await message.delete().catch(() => {});
  }
}

/* =========================================================
   ANTI-BOT / ANTI-ALT / ANTI-RAID
========================================================= */

client.on("guildMemberAdd", async member => {
  try {
    const guildId = member.guild.id;

    const config =
      db.automod[guildId];

    if (!config) return;

    /*
     * ANTI BOT
     */

    if (
      config.antibot?.activo &&
      member.user.bot
    ) {
      if (
        !member.guild.members.me?.permissions.has(
          PermissionsBitField.Flags.KickMembers
        )
      ) {
        return;
      }

      await member.kick(
        "AutoMod: AntiBot"
      ).catch(() => {});

      return;
    }

    /*
     * ANTI ALT
     */

    if (config.antialt?.activo) {
      const edadCuenta =
        Date.now() -
        member.user.createdTimestamp;

      const dias =
        edadCuenta /
        (1000 * 60 * 60 * 24);

      const minimo =
        Number(config.antialt.dias || 7);

      if (dias < minimo) {
        if (
          member.guild.members.me?.permissions.has(
            PermissionsBitField.Flags.KickMembers
          )
        ) {
          await member.kick(
            "AutoMod: posible cuenta ALT"
          ).catch(() => {});
        }
      }
    }

    /*
     * ESTADÍSTICAS
     */

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
});

/* =========================================================
   MIEMBRO SALE
========================================================= */

client.on("guildMemberRemove", async member => {
  try {
    const guildId = member.guild.id;

    if (db.estadisticas[guildId]) {
      db.estadisticas[guildId].miembros =
        member.guild.memberCount;

      save();
    }
  } catch {}
});

/* =========================================================
   VOZ / ESTADÍSTICAS
========================================================= */

client.on(
  "voiceStateUpdate",
  async (oldState, newState) => {
    try {
      const guildId =
        newState.guild?.id ||
        oldState.guild?.id;

      if (!guildId) return;

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

      /*
       * Entró a voz
       */

      if (
        !oldState.channelId &&
        newState.channelId
      ) {
        stats.voz[newState.id] = {
          canal: newState.channelId,
          entrada: Date.now()
        };
      }

      /*
       * Salió de voz
       */

      if (
        oldState.channelId &&
        !newState.channelId
      ) {
        delete stats.voz[newState.id];
      }

      /*
       * Cambió de canal
       */

      if (
        oldState.channelId &&
        newState.channelId &&
        oldState.channelId !==
          newState.channelId
      ) {
        stats.voz[newState.id] = {
          canal: newState.channelId,
          entrada: Date.now()
        };
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
   LOGS: MENSAJE ELIMINADO
========================================================= */

client.on("messageDelete", async message => {
  try {
    if (!message.guild) return;

    const config =
      db.logs?.[message.guild.id];

    if (!config) return;

    const canalId =
      config.canal ||
      config.channel ||
      config.mensaje;

    if (!canalId) return;

    const canal =
      message.guild.channels.cache.get(
        canalId
      );

    if (!canal?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Mensaje eliminado")
      .setDescription(
        `Mensaje eliminado en ${message.channel}`
      )
      .addFields(
        {
          name: "👤 Usuario",
          value: message.author
            ? `<@${message.author.id}>`
            : "Desconocido",
          inline: true
        },
        {
          name: "📝 Contenido",
          value:
            message.content?.slice(0, 1000) ||
            "Sin contenido",
          inline: false
        }
      )
      .setColor("Red")
      .setTimestamp();

    await canal.send({
      embeds: [embed]
    }).catch(() => {});
  } catch {}
});

/* =========================================================
   LOGS: MIEMBRO ENTRA
========================================================= */

client.on("guildMemberAdd", async member => {
  try {
    const config =
      db.logs?.[member.guild.id];

    if (!config) return;

    const canal =
      member.guild.channels.cache.get(
        config.canal
      );

    if (!canal?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("📥 Miembro entró")
      .setDescription(
        `${member} entró al servidor.`
      )
      .setColor("Green")
      .setTimestamp();

    await canal.send({
      embeds: [embed]
    }).catch(() => {});
  } catch {}
});

/* =========================================================
   LOGS: MIEMBRO SALE
========================================================= */

client.on("guildMemberRemove", async member => {
  try {
    const config =
      db.logs?.[member.guild.id];

    if (!config) return;

    const canal =
      member.guild.channels.cache.get(
        config.canal
      );

    if (!canal?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("📤 Miembro salió")
      .setDescription(
        `${member.user.tag} salió del servidor.`
      )
      .setColor("Orange")
      .setTimestamp();

    await canal.send({
      embeds: [embed]
    }).catch(() => {});
  } catch {}
});

/* =========================================================
   LOGS: BAN
========================================================= */

client.on("guildBanAdd", async ban => {
  try {
    const config =
      db.logs?.[ban.guild.id];

    if (!config) return;

    const canal =
      ban.guild.channels.cache.get(
        config.canal
      );

    if (!canal?.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("🔨 Usuario baneado")
      .setDescription(
        `${ban.user.tag} fue baneado.`
      )
      .setColor("DarkRed")
      .setTimestamp();

    await canal.send({
      embeds: [embed]
    }).catch(() => {});
  } catch {}
});

/* =========================================================
   HTTP SERVER PARA RAILWAY
========================================================= */

const server = http.createServer(
  (req, res) => {
    res.writeHead(200, {
      "Content-Type":
        "text/plain; charset=utf-8"
    });

    res.end(
      "DARK FF V1 está funcionando correctamente."
    );
  }
);

server.listen(PORT, () => {
  console.log(
    `🌐 Servidor HTTP activo en puerto ${PORT}`
  );
});

/* =========================================================
   MANEJO DE ERRORES
========================================================= */

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
});

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN);
