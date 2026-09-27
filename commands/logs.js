const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const commands = [];

const DB_PATH = path.join(process.cwd(), "database.json");

function loadDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    return JSON.parse(
      fs.readFileSync(DB_PATH, "utf8")
    );
  } catch {
    return {};
  }
}

function saveDB(db) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(db, null, 2)
  );
}

function getLogsConfig(guildId) {
  const db = loadDB();

  if (!db.logs) {
    db.logs = {};
  }

  if (!db.logs[guildId]) {
    db.logs[guildId] = {
      enabled: false,
      channel: null,
      messageDelete: true,
      messageEdit: true,
      memberJoin: true,
      memberLeave: true,
      memberBan: true,
      memberUnban: true,
      roleCreate: true,
      roleDelete: true,
      channelCreate: true,
      channelDelete: true,
      voice: true
    };

    saveDB(db);
  }

  return db.logs[guildId];
}


/* =========================================================
   /setlog
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("setlog")
    .setDescription("Configura el canal principal de logs.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Canal donde se enviarán los logs")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const canal =
      interaction.options.getChannel("canal");

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      enabled: true,
      channel: canal.id
    };

    saveDB(db);

    return interaction.reply(
      `📋 Canal de logs configurado: ${canal}`
    );
  }
});


/* =========================================================
   /logs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Muestra la configuración de logs."),

  async execute(interaction) {
    const config =
      getLogsConfig(interaction.guild.id);

    const estado =
      valor => valor ? "🟢 Activado" : "🔴 Desactivado";

    const canal =
      config.channel
        ? `<#${config.channel}>`
        : "No configurado";

    const embed = new EmbedBuilder()
      .setTitle("📋 DARK FF V1 — LOGS")
      .addFields(
        {
          name: "📡 Sistema",
          value: estado(config.enabled),
          inline: true
        },
        {
          name: "📢 Canal",
          value: canal,
          inline: true
        },
        {
          name: "🗑️ Mensajes eliminados",
          value: estado(config.messageDelete),
          inline: true
        },
        {
          name: "✏️ Mensajes editados",
          value: estado(config.messageEdit),
          inline: true
        },
        {
          name: "📥 Miembros entran",
          value: estado(config.memberJoin),
          inline: true
        },
        {
          name: "📤 Miembros salen",
          value: estado(config.memberLeave),
          inline: true
        },
        {
          name: "🔨 Baneos",
          value: estado(config.memberBan),
          inline: true
        },
        {
          name: "🔓 Desbaneos",
          value: estado(config.memberUnban),
          inline: true
        },
        {
          name: "🎭 Roles",
          value:
            `${estado(config.roleCreate)} / ${estado(config.roleDelete)}`,
          inline: true
        },
        {
          name: "📁 Canales",
          value:
            `${estado(config.channelCreate)} / ${estado(config.channelDelete)}`,
          inline: true
        },
        {
          name: "🔊 Voz",
          value: estado(config.voice),
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
   /logstatus
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("logstatus")
    .setDescription("Muestra si los logs están activos."),

  async execute(interaction) {
    const config =
      getLogsConfig(interaction.guild.id);

    return interaction.reply(
      config.enabled
        ? `🟢 Los logs están activos en <#${config.channel}>.`
        : "🔴 Los logs están desactivados."
    );
  }
});


/* =========================================================
   /logchannel
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("logchannel")
    .setDescription("Cambia el canal de logs.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    )
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("Nuevo canal de logs")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),

  async execute(interaction) {
    const canal =
      interaction.options.getChannel("canal");

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      channel: canal.id,
      enabled: true
    };

    saveDB(db);

    return interaction.reply(
      `✅ Canal de logs cambiado a ${canal}.`
    );
  }
});


/* =========================================================
   /messageLogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("messagelogs")
    .setDescription("Activa o desactiva logs de mensajes.")
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

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      messageDelete: estado,
      messageEdit: estado
    };

    saveDB(db);

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} Logs de mensajes ${
        estado ? "activados" : "desactivados"
      }.`
    );
  }
});


/* =========================================================
   /memberlogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memberlogs")
    .setDescription("Activa o desactiva logs de miembros.")
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

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      memberJoin: estado,
      memberLeave: estado
    };

    saveDB(db);

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} Logs de miembros ${
        estado ? "activados" : "desactivados"
      }.`
    );
  }
});


/* =========================================================
   /rolelogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("rolelogs")
    .setDescription("Activa o desactiva logs de roles.")
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

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      roleCreate: estado,
      roleDelete: estado
    };

    saveDB(db);

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} Logs de roles ${
        estado ? "activados" : "desactivados"
      }.`
    );
  }
});


/* =========================================================
   /channellogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("channellogs")
    .setDescription("Activa o desactiva logs de canales.")
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

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      channelCreate: estado,
      channelDelete: estado
    };

    saveDB(db);

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} Logs de canales ${
        estado ? "activados" : "desactivados"
      }.`
    );
  }
});


/* =========================================================
   /voicelogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("voicelogs")
    .setDescription("Activa o desactiva logs de voz.")
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

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      voice: estado
    };

    saveDB(db);

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} Logs de voz ${
        estado ? "activados" : "desactivados"
      }.`
    );
  }
});


/* =========================================================
   /banlogs
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("banlogs")
    .setDescription("Activa o desactiva logs de baneos.")
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

    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      memberBan: estado,
      memberUnban: estado
    };

    saveDB(db);

    return interaction.reply(
      `${estado ? "🟢" : "🔴"} Logs de baneos ${
        estado ? "activados" : "desactivados"
      }.`
    );
  }
});


/* =========================================================
   /logclear
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("logclear")
    .setDescription("Desactiva completamente los logs.")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.ManageGuild
    ),

  async execute(interaction) {
    const db = loadDB();

    if (!db.logs) db.logs = {};

    db.logs[interaction.guild.id] = {
      ...getLogsConfig(interaction.guild.id),
      enabled: false,
      channel: null
    };

    saveDB(db);

    return interaction.reply(
      "🗑️ Sistema de logs desactivado."
    );
  }
});


/* =========================================================
   /loghelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("loghelp")
    .setDescription("Muestra los comandos de logs."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📋 DARK FF V1 — LOGS")
      .setDescription(
        "Sistema de registros del servidor."
      )
      .addFields(
        {
          name: "⚙️ Configuración",
          value:
            "`/setlog`\n`/logchannel`\n`/logs`\n`/logstatus`\n`/logclear`"
        },
        {
          name: "💬 Mensajes",
          value:
            "`/messagelogs`"
        },
        {
          name: "👥 Miembros",
          value:
            "`/memberlogs`"
        },
        {
          name: "🎭 Roles",
          value:
            "`/rolelogs`"
        },
        {
          name: "📁 Canales",
          value:
            "`/channellogs`"
        },
        {
          name: "🔊 Voz",
          value:
            "`/voicelogs`"
        },
        {
          name: "🔨 Moderación",
          value:
            "`/banlogs`"
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
