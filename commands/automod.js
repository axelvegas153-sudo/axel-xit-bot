const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const commands = [];

const DB_PATH = path.join(process.cwd(), "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(
        DB_PATH,
        JSON.stringify({}, null, 2)
      );
    }

    const data = JSON.parse(
      fs.readFileSync(DB_PATH, "utf8")
    );

    return data || {};
  } catch (error) {
    console.error("Error leyendo database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  try {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(db, null, 2)
    );
  } catch (error) {
    console.error("Error guardando database.json:", error);
  }
}

function obtenerConfig(guildId) {
  const db = cargarDB();

  if (!db.automod) {
    db.automod = {};
  }

  if (!db.automod[guildId]) {
    db.automod[guildId] = {
      enabled: false,
      antilinks: false,
      antiinvite: false,
      antispam: false,
      anticaps: false,
      antimentions: false,
      antibadwords: false,
      antiemoji: false,
      antiflood: false,
      antiduplicates: false,
      antiraid: false,
      antibot: false,
      antialt: false,
      maxMentions: 5,
      capsPercent: 70,
      spamMessages: 5,
      spamInterval: 5000,
      duplicateMessages: 3,
      floodInterval: 3000,
      badwords: []
    };

    guardarDB(db);
  }

  return db.automod[guildId];
}

function actualizarConfig(guildId, cambios) {
  const db = cargarDB();

  if (!db.automod) {
    db.automod = {};
  }

  if (!db.automod[guildId]) {
    db.automod[guildId] = {};
  }

  db.automod[guildId] = {
    ...obtenerConfig(guildId),
    ...cambios
  };

  guardarDB(db);

  return db.automod[guildId];
}


/* =========================================================
   /automod
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Activa o desactiva la automoderación.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        enabled: estado
      }
    );

    return interaction.reply(
      estado
        ? "🛡️ **Automod activado correctamente.**"
        : "🔓 **Automod desactivado.**"
    );
  }
});


/* =========================================================
   /automodconfig
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("automodconfig")
    .setDescription("Configura los sistemas de automoderación.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addStringOption(option =>
      option
        .setName("sistema")
        .setDescription("Sistema que quieres configurar")
        .setRequired(true)
        .addChoices(
          { name: "Anti Links", value: "antilinks" },
          { name: "Anti Invitaciones", value: "antiinvite" },
          { name: "Anti Spam", value: "antispam" },
          { name: "Anti Caps", value: "anticaps" },
          { name: "Anti Menciones", value: "antimentions" },
          { name: "Anti Palabras", value: "antibadwords" },
          { name: "Anti Emojis", value: "antiemoji" },
          { name: "Anti Flood", value: "antiflood" },
          { name: "Anti Duplicados", value: "antiduplicates" },
          { name: "Anti Raid", value: "antiraid" },
          { name: "Anti Bots", value: "antibot" },
          { name: "Anti Alt", value: "antialt" }
        )
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const sistema =
      interaction.options.getString("sistema");

    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        [sistema]: estado
      }
    );

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} **${sistema}** ${
        estado ? "activado" : "desactivado"
      }.`
    );
  }
});


/* =========================================================
   /antilinks
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antilinks")
    .setDescription("Activa o desactiva el sistema anti-links.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antilinks: estado
      }
    );

    return interaction.reply(
      `${estado ? "🔗🛡️ Anti-links activado." : "🔓 Anti-links desactivado."}`
    );
  }
});


/* =========================================================
   /antiinvite
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antiinvite")
    .setDescription("Activa o desactiva el bloqueo de invitaciones.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antiinvite: estado
      }
    );

    return interaction.reply(
      estado
        ? "🚫 Anti-invitaciones activado."
        : "🔓 Anti-invitaciones desactivado."
    );
  }
});


/* =========================================================
   /antispam
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antispam")
    .setDescription("Activa o desactiva el anti-spam.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antispam: estado
      }
    );

    return interaction.reply(
      estado
        ? "🚨 Anti-spam activado."
        : "🔓 Anti-spam desactivado."
    );
  }
});


/* =========================================================
   /anticaps
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("anticaps")
    .setDescription("Activa o desactiva el anti-caps.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        anticaps: estado
      }
    );

    return interaction.reply(
      estado
        ? "🔠 Anti-caps activado."
        : "🔓 Anti-caps desactivado."
    );
  }
});


/* =========================================================
   /antimentions
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antimentions")
    .setDescription("Activa o desactiva el límite de menciones.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antimentions: estado
      }
    );

    return interaction.reply(
      estado
        ? "📢 Anti-menciones activado."
        : "🔓 Anti-menciones desactivado."
    );
  }
});


/* =========================================================
   /antibadwords
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antibadwords")
    .setDescription("Activa o desactiva el filtro de palabras.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antibadwords: estado
      }
    );

    return interaction.reply(
      estado
        ? "🤬🛡️ Filtro de palabras activado."
        : "🔓 Filtro de palabras desactivado."
    );
  }
});


/* =========================================================
   /antiemoji
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antiemoji")
    .setDescription("Activa o desactiva el límite de emojis.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antiemoji: estado
      }
    );

    return interaction.reply(
      estado
        ? "😀 Anti-emojis activado."
        : "🔓 Anti-emojis desactivado."
    );
  }
});


/* =========================================================
   /antiflood
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antiflood")
    .setDescription("Activa o desactiva la protección contra flood.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antiflood: estado
      }
    );

    return interaction.reply(
      estado
        ? "🌊 Anti-flood activado."
        : "🔓 Anti-flood desactivado."
    );
  }
});


/* =========================================================
   /antiduplicates
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antiduplicates")
    .setDescription("Activa o desactiva el bloqueo de mensajes repetidos.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antiduplicates: estado
      }
    );

    return interaction.reply(
      estado
        ? "🔁 Anti-duplicados activado."
        : "🔓 Anti-duplicados desactivado."
    );
  }
});


/* =========================================================
   /antiraid
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antiraid")
    .setDescription("Activa o desactiva la protección anti-raid.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antiraid: estado
      }
    );

    return interaction.reply(
      estado
        ? "🚨 Anti-raid activado."
        : "🔓 Anti-raid desactivado."
    );
  }
});


/* =========================================================
   /antibot
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antibot")
    .setDescription("Activa o desactiva la protección contra bots.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antibot: estado
      }
    );

    return interaction.reply(
      estado
        ? "🤖🛡️ Anti-bot activado."
        : "🔓 Anti-bot desactivado."
    );
  }
});


/* =========================================================
   /antialt
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("antialt")
    .setDescription("Activa o desactiva la protección contra cuentas nuevas.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addBooleanOption(option =>
      option
        .setName("estado")
        .setDescription("Activar o desactivar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const estado =
      interaction.options.getBoolean("estado");

    actualizarConfig(
      interaction.guild.id,
      {
        antialt: estado
      }
    );

    return interaction.reply(
      estado
        ? "👤🛡️ Anti-alt activado."
        : "🔓 Anti-alt desactivado."
    );
  }
});


/* =========================================================
   /automodstatus
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("automodstatus")
    .setDescription("Muestra la configuración actual del Automod."),

  async execute(interaction) {
    const config =
      obtenerConfig(interaction.guild.id);

    const estado = valor =>
      valor ? "🟢 ON" : "🔴 OFF";

    const embed = new EmbedBuilder()
      .setTitle("🛡️ DARK FF V1 — AUTOMOD")
      .setDescription(
        `Automod general: ${estado(config.enabled)}`
      )
      .addFields(
        {
          name: "🔗 Anti Links",
          value: estado(config.antilinks),
          inline: true
        },
        {
          name: "🚫 Anti Invitaciones",
          value: estado(config.antiinvite),
          inline: true
        },
        {
          name: "🚨 Anti Spam",
          value: estado(config.antispam),
          inline: true
        },
        {
          name: "🔠 Anti Caps",
          value: estado(config.anticaps),
          inline: true
        },
        {
          name: "📢 Anti Menciones",
          value: estado(config.antimentions),
          inline: true
        },
        {
          name: "🤬 Anti Palabras",
          value: estado(config.antibadwords),
          inline: true
        },
        {
          name: "😀 Anti Emojis",
          value: estado(config.antiemoji),
          inline: true
        },
        {
          name: "🌊 Anti Flood",
          value: estado(config.antiflood),
          inline: true
        },
        {
          name: "🔁 Anti Duplicados",
          value: estado(config.antiduplicates),
          inline: true
        },
        {
          name: "🚨 Anti Raid",
          value: estado(config.antiraid),
          inline: true
        },
        {
          name: "🤖 Anti Bots",
          value: estado(config.antibot),
          inline: true
        },
        {
          name: "👤 Anti Alt",
          value: estado(config.antialt),
          inline: true
        }
      )
      .setFooter({
        text: "DARK FF V1"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});


/* =========================================================
   /automodreset
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("automodreset")
    .setDescription("Restablece la configuración del Automod.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const db = cargarDB();

    if (!db.automod) {
      db.automod = {};
    }

    db.automod[interaction.guild.id] = {
      enabled: false,
      antilinks: false,
      antiinvite: false,
      antispam: false,
      anticaps: false,
      antimentions: false,
      antibadwords: false,
      antiemoji: false,
      antiflood: false,
      antiduplicates: false,
      antiraid: false,
      antibot: false,
      antialt: false,
      maxMentions: 5,
      capsPercent: 70,
      spamMessages: 5,
      spamInterval: 5000,
      duplicateMessages: 3,
      floodInterval: 3000,
      badwords: []
    };

    guardarDB(db);

    return interaction.reply(
      "♻️ Configuración del Automod restablecida."
    );
  }
});


/* =========================================================
   /automodlogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("automodlogs")
    .setDescription("Configura el canal de registros del Automod.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Canal donde se enviarán los registros")
        .setRequired(true)
    ),

  async execute(interaction) {
    const canal =
      interaction.options.getChannel("canal");

    actualizarConfig(
      interaction.guild.id,
      {
        logChannel: canal.id
      }
    );

    return interaction.reply(
      `📋 Los registros del Automod se enviarán en ${canal}.`
    );
  }
});


/* =========================================================
   /automodhelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("automodhelp")
    .setDescription("Muestra los comandos de Automod."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🤖 DARK FF V1 — AUTOMOD")
      .setDescription(
        "Sistema de protección y automoderación del servidor."
      )
      .addFields(
        {
          name: "🛡️ Principal",
          value:
            "`/automod`\n`/automodconfig`\n`/automodstatus`\n`/automodreset`"
        },
        {
          name: "🚨 Protección",
          value:
            "`/antilinks`\n`/antiinvite`\n`/antispam`\n`/anticaps`\n`/antimentions`\n`/antibadwords`"
        },
        {
          name: "🔒 Seguridad",
          value:
            "`/antiemoji`\n`/antiflood`\n`/antiduplicates`\n`/antiraid`\n`/antibot`\n`/antialt`"
        },
        {
          name: "📋 Registros",
          value: "`/automodlogs`"
        }
      )
      .setFooter({
        text: "DARK FF V1"
      })
      .setTimestamp();

    return interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
