const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

/* =========================
   BASE DE DATOS
========================= */

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}", "utf8");
    }

    const raw = fs.readFileSync(DB_PATH, "utf8").trim();

    if (!raw) return {};

    const db = JSON.parse(raw);

    if (!db.seguridad) {
      db.seguridad = {};
    }

    return db;
  } catch (error) {
    console.error("Error leyendo database.json:", error);

    return {
      seguridad: {}
    };
  }
}

function saveDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2),
      "utf8"
    );

    return true;
  } catch (error) {
    console.error("Error guardando database.json:", error);

    return false;
  }
}

/* =========================
   CONFIGURACIÓN
========================= */

function getConfig(db, guildId) {
  if (!db.seguridad[guildId]) {
    db.seguridad[guildId] = {
      activado: true,
      logs: null,
      antiBot: false,
      antiRaid: false,
      maxBots: 3,
      maxUniones: 10,
      ventanaRaid: 10000
    };
  }

  return db.seguridad[guildId];
}

/* =========================
   REGISTRO DE UNIONES
========================= */

const uniones = new Map();

/* =========================
   COMPROBAR ADMIN
========================= */

function tienePermiso(interaction) {
  return interaction.member.permissions.has(
    PermissionFlagsBits.ManageGuild
  );
}

/* =========================
   LOG
========================= */

async function enviarLog(guild, config, titulo, descripcion) {
  if (!config.logs) return;

  const canal = guild.channels.cache.get(config.logs);

  if (!canal) return;

  const embed = new EmbedBuilder()
    .setTitle(titulo)
    .setDescription(descripcion)
    .setColor(0xed4245)
    .setTimestamp();

  await canal.send({
    embeds: [embed]
  }).catch(() => {});
}

/* =========================
   COMANDO
========================= */

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seguridad")
    .setDescription(
      "🔐 Sistema de seguridad del servidor"
    )

    /* ESTADO */
    .addSubcommand(sub =>
      sub
        .setName("estado")
        .setDescription(
          "Muestra el estado de seguridad"
        )
    )

    /* ACTIVAR */
    .addSubcommand(sub =>
      sub
        .setName("activar")
        .setDescription(
          "Activa el sistema de seguridad"
        )
    )

    /* DESACTIVAR */
    .addSubcommand(sub =>
      sub
        .setName("desactivar")
        .setDescription(
          "Desactiva el sistema de seguridad"
        )
    )

    /* LOGS */
    .addSubcommand(sub =>
      sub
        .setName("logs")
        .setDescription(
          "Configura el canal de registros"
        )
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription(
              "Canal para los registros"
            )
            .addChannelTypes(
              ChannelType.GuildText
            )
            .setRequired(true)
        )
    )

    /* ANTIBOT */
    .addSubcommand(sub =>
      sub
        .setName("antibot")
        .setDescription(
          "Configura la protección contra bots"
        )
        .addBooleanOption(option =>
          option
            .setName("activo")
            .setDescription(
              "Activar o desactivar"
            )
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("maxbots")
            .setDescription(
              "Máximo de bots permitidos"
            )
            .setMinValue(1)
            .setMaxValue(20)
        )
    )

    /* ANTIRAID */
    .addSubcommand(sub =>
      sub
        .setName("antiraid")
        .setDescription(
          "Configura la protección contra raids"
        )
        .addBooleanOption(option =>
          option
            .setName("activo")
            .setDescription(
              "Activar o desactivar"
            )
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option
            .setName("uniones")
            .setDescription(
              "Máximo de uniones en la ventana"
            )
            .setMinValue(2)
            .setMaxValue(100)
        )
    )

    /* ROLES PELIGROSOS */
    .addSubcommand(sub =>
      sub
        .setName("roles")
        .setDescription(
          "Revisa roles con permisos elevados"
        )
    )

    /* PERMISOS */
    .addSubcommand(sub =>
      sub
        .setName("permisos")
        .setDescription(
          "Revisa permisos importantes del servidor"
        )
    )

    /* BOTS */
    .addSubcommand(sub =>
      sub
        .setName("bots")
        .setDescription(
          "Muestra los bots del servidor"
        )
    )

    /* CANALES */
    .addSubcommand(sub =>
      sub
        .setName("canales")
        .setDescription(
          "Revisa canales y permisos"
        )
    )

    /* VERIFICACIÓN */
    .addSubcommand(sub =>
      sub
        .setName("revisar")
        .setDescription(
          "Realiza una revisión general de seguridad"
        )
    ),

  /* =========================
     EXECUTE
  ========================= */

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content:
          "❌ Este comando solo funciona en servidores.",
        ephemeral: true
      });
    }

    if (!tienePermiso(interaction)) {
      return interaction.reply({
        content:
          "❌ Necesitas el permiso **Gestionar servidor**.",
        ephemeral: true
      });
    }

    const sub =
      interaction.options.getSubcommand();

    const db = loadDB();

    const config =
      getConfig(
        db,
        interaction.guild.id
      );

    /* =========================
       ESTADO
    ========================= */

    if (sub === "estado") {
      const embed =
        new EmbedBuilder()
          .setTitle(
            "🔐 Seguridad del servidor"
          )
          .setDescription(
            `Estado de las protecciones de **${interaction.guild.name}**`
          )
          .addFields(
            {
              name: "🔘 Sistema",
              value:
                config.activado
                  ? "🟢 Activado"
                  : "🔴 Desactivado",
              inline: true
            },
            {
              name: "🤖 AntiBot",
              value:
                config.antiBot
                  ? "🟢 Activado"
                  : "🔴 Desactivado",
              inline: true
            },
            {
              name: "🚨 AntiRaid",
              value:
                config.antiRaid
                  ? "🟢 Activado"
                  : "🔴 Desactivado",
              inline: true
            },
            {
              name: "📋 Logs",
              value:
                config.logs
                  ? `<#${config.logs}>`
                  : "No configurado",
              inline: false
            }
          )
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       ACTIVAR
    ========================= */

    if (sub === "activar") {
      config.activado = true;

      saveDB(db);

      return interaction.reply({
        content:
          "🟢 **Sistema de seguridad activado.**"
      });
    }

    /* =========================
       DESACTIVAR
    ========================= */

    if (sub === "desactivar") {
      config.activado = false;

      saveDB(db);

      return interaction.reply({
        content:
          "🔴 **Sistema de seguridad desactivado.**"
      });
    }

    /* =========================
       LOGS
    ========================= */

    if (sub === "logs") {
      const canal =
        interaction.options.getChannel(
          "canal"
        );

      config.logs = canal.id;

      saveDB(db);

      return interaction.reply({
        content:
          `📋 Los registros de seguridad se enviarán en ${canal}.`
      });
    }

    /* =========================
       ANTIBOT
    ========================= */

    if (sub === "antibot") {
      const activo =
        interaction.options.getBoolean(
          "activo"
        );

      const maxBots =
        interaction.options.getInteger(
          "maxbots"
        );

      config.antiBot = activo;

      if (maxBots !== null) {
        config.maxBots = maxBots;
      }

      saveDB(db);

      return interaction.reply({
        content:
          `${activo ? "🟢" : "🔴"} AntiBot ${
            activo ? "activado" : "desactivado"
          }${maxBots ? ` • Máximo: ${maxBots} bots` : ""}.`
      });
    }

    /* =========================
       ANTIRAID
    ========================= */

    if (sub === "antiraid") {
      const activo =
        interaction.options.getBoolean(
          "activo"
        );

      const unionesMax =
        interaction.options.getInteger(
          "uniones"
        );

      config.antiRaid = activo;

      if (unionesMax !== null) {
        config.maxUniones = unionesMax;
      }

      saveDB(db);

      return interaction.reply({
        content:
          `${activo ? "🟢" : "🔴"} AntiRaid ${
            activo ? "activado" : "desactivado"
          }${unionesMax ? ` • Límite: ${unionesMax} uniones` : ""}.`
      });
    }

    /* =========================
       ROLES
    ========================= */

    if (sub === "roles") {
      const roles =
        interaction.guild.roles.cache;

      const peligrosos = roles.filter(
        role =>
          role.permissions.has(
            PermissionFlagsBits.Administrator
          ) ||
          role.permissions.has(
            PermissionFlagsBits.ManageGuild
          ) ||
          role.permissions.has(
            PermissionFlagsBits.ManageRoles
          ) ||
          role.permissions.has(
            PermissionFlagsBits.BanMembers
          ) ||
          role.permissions.has(
            PermissionFlagsBits.KickMembers
          )
      );

      const lista =
        peligrosos
          .sort((a, b) => b.position - a.position)
          .first(15)
          .map(
            role =>
              `${role} — ${
                role.permissions.has(
                  PermissionFlagsBits.Administrator
                )
                  ? "👑 Administrador"
                  : "🛡️ Permisos elevados"
              }`
          );

      const embed =
        new EmbedBuilder()
          .setTitle(
            "🛡️ Roles con permisos elevados"
          )
          .setDescription(
            lista.length
              ? lista.join("\n")
              : "No se encontraron roles con permisos elevados."
          )
          .addFields({
            name: "📊 Total detectado",
            value: `${peligrosos.size}`,
            inline: true
          })
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       PERMISOS DEL SERVIDOR
    ========================= */

    if (sub === "permisos") {
      const owner =
        await interaction.guild.fetchOwner()
          .catch(() => null);

      const botMember =
        interaction.guild.members.me;

      const permisosBot =
        botMember
          ? botMember.permissions
          : null;

      const embed =
        new EmbedBuilder()
          .setTitle(
            "🔐 Revisión de permisos"
          )
          .addFields(
            {
              name: "👑 Propietario",
              value:
                owner
                  ? `${owner.user}`
                  : "No disponible",
              inline: true
            },
            {
              name: "🤖 Administrador del bot",
              value:
                permisosBot?.has(
                  PermissionFlagsBits.Administrator
                )
                  ? "🟢 Sí"
                  : "🔴 No",
              inline: true
            },
            {
              name: "🛡️ Gestionar servidor",
              value:
                permisosBot?.has(
                  PermissionFlagsBits.ManageGuild
                )
                  ? "🟢 Sí"
                  : "🔴 No",
              inline: true
            },
            {
              name: "👢 Expulsar miembros",
              value:
                permisosBot?.has(
                  PermissionFlagsBits.KickMembers
                )
                  ? "🟢 Sí"
                  : "🔴 No",
              inline: true
            },
            {
              name: "🔨 Banear miembros",
              value:
                permisosBot?.has(
                  PermissionFlagsBits.BanMembers
                )
                  ? "🟢 Sí"
                  : "🔴 No",
              inline: true
            },
            {
              name: "🔇 Moderar miembros",
              value:
                permisosBot?.has(
                  PermissionFlagsBits.ModerateMembers
                )
                  ? "🟢 Sí"
                  : "🔴 No",
              inline: true
            }
          )
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       BOTS
    ========================= */

    if (sub === "bots") {
      const bots =
        interaction.guild.members.cache
          .filter(member => member.user.bot);

      const lista =
        bots
          .first(20)
          .map(
            member =>
              `🤖 ${member.user} — \`${member.id}\``
          );

      const embed =
        new EmbedBuilder()
          .setTitle(
            "🤖 Bots del servidor"
          )
          .setDescription(
            lista.length
              ? lista.join("\n")
              : "No hay bots registrados."
          )
          .addFields({
            name: "📊 Cantidad",
            value: `${bots.size}`,
            inline: true
          })
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       CANALES
    ========================= */

    if (sub === "canales") {
      const canales =
        interaction.guild.channels.cache;

      const texto =
        canales.filter(
          canal =>
            canal.type ===
            ChannelType.GuildText
        ).size;

      const voz =
        canales.filter(
          canal =>
            canal.type ===
            ChannelType.GuildVoice
        ).size;

      const categorias =
        canales.filter(
          canal =>
            canal.type ===
            ChannelType.GuildCategory
        ).size;

      const sinPermisoBot =
        canales.filter(canal => {
          if (!interaction.guild.members.me) {
            return false;
          }

          const permisos =
            canal.permissionsFor(
              interaction.guild.members.me
            );

          return !permisos?.has(
            PermissionFlagsBits.ViewChannel
          );
        }).size;

      const embed =
        new EmbedBuilder()
          .setTitle(
            "📁 Seguridad de canales"
          )
          .addFields(
            {
              name: "💬 Texto",
              value: `${texto}`,
              inline: true
            },
            {
              name: "🔊 Voz",
              value: `${voz}`,
              inline: true
            },
            {
              name: "📂 Categorías",
              value: `${categorias}`,
              inline: true
            },
            {
              name: "🚫 Sin acceso para el bot",
              value: `${sinPermisoBot}`,
              inline: true
            }
          )
          .setColor(0x5865f2)
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       REVISIÓN GENERAL
    ========================= */

    if (sub === "revisar") {
      const problemas = [];
      const correctos = [];

      if (!config.activado) {
        problemas.push(
          "🔴 El sistema de seguridad está desactivado."
        );
      } else {
        correctos.push(
          "🟢 Sistema de seguridad activo."
        );
      }

      if (!config.logs) {
        problemas.push(
          "🟡 No hay canal de logs configurado."
        );
      } else {
        correctos.push(
          "🟢 Canal de logs configurado."
        );
      }

      if (!config.antiBot) {
        problemas.push(
          "🟡 AntiBot está desactivado."
        );
      } else {
        correctos.push(
          "🟢 AntiBot activo."
        );
      }

      if (!config.antiRaid) {
        problemas.push(
          "🟡 AntiRaid está desactivado."
        );
      } else {
        correctos.push(
          "🟢 AntiRaid activo."
        );
      }

      const botMember =
        interaction.guild.members.me;

      if (
        botMember?.permissions.has(
          PermissionFlagsBits.Administrator
        )
      ) {
        correctos.push(
          "🟢 El bot tiene Administrador."
        );
      } else {
        problemas.push(
          "🟡 El bot no tiene Administrador; algunas funciones pueden requerir permisos adicionales."
        );
      }

      const embed =
        new EmbedBuilder()
          .setTitle(
            "🔐 Revisión de seguridad"
          )
          .setDescription(
            `Revisión de **${interaction.guild.name}**`
          )
          .addFields(
            {
              name: "✅ Correcto",
              value:
                correctos.length
                  ? correctos.join("\n")
                  : "Ninguno"
            },
            {
              name: "⚠️ Revisar",
              value:
                problemas.length
                  ? problemas.join("\n")
                  : "Ninguno"
            }
          )
          .setColor(
            problemas.length
              ? 0xfee75c
              : 0x57f287
          )
          .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }
  },

  /* =========================
     NUEVO MIEMBRO
  ========================= */

  async guildMemberAdd(member) {
    const db = loadDB();

    const config =
      getConfig(
        db,
        member.guild.id
      );

    if (!config.activado) return;

    const guildId =
      member.guild.id;

    const ahora =
      Date.now();

    if (!uniones.has(guildId)) {
      uniones.set(guildId, []);
    }

    const lista =
      uniones.get(guildId);

    lista.push(ahora);

    const limite =
      ahora -
      config.ventanaRaid;

    while (
      lista.length &&
      lista[0] < limite
    ) {
      lista.shift();
    }

    /* =========================
       ANTIBOT
    ========================= */

    if (
      config.antiBot &&
      member.user.bot
    ) {
      const bots =
        member.guild.members.cache
          .filter(
            miembro =>
              miembro.user.bot
          ).size;

      if (bots > config.maxBots) {
        await member.kick(
          "Seguridad: límite de bots superado"
        ).catch(() => {});

        await enviarLog(
          member.guild,
          config,
          "🤖 Bot bloqueado",
          `${member.user} fue expulsado porque se superó el límite configurado de bots.`
        );

        return;
      }
    }

    /* =========================
       ANTIRAID
    ========================= */

        if (
      config.antiRaid &&
      lista.length >= config.maxUniones
    ) {
      await enviarLog(
        member.guild,
        config,
        "🚨 Posible raid detectado",
        `Se detectaron **${lista.length} uniones** en aproximadamente **${
          config.ventanaRaid / 1000
        } segundos**.`
      );
    }
  }
};
