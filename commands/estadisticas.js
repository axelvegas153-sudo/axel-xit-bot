const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    const contenido = fs.readFileSync(DB_PATH, "utf8");

    return contenido.trim()
      ? JSON.parse(contenido)
      : {};
  } catch {
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(db, null, 2)
  );
}

function prepararStats(db, guildId) {
  if (!db.estadisticas) {
    db.estadisticas = {};
  }

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

  if (!stats.usuarios) stats.usuarios = {};
  if (!stats.comandosUsados) stats.comandosUsados = {};
  if (!stats.canales) stats.canales = {};
  if (!stats.voz) stats.voz = {};

  return stats;
}

function obtenerUsuarioStats(stats, userId) {
  if (!stats.usuarios[userId]) {
    stats.usuarios[userId] = {
      mensajes: 0,
      comandos: 0,
      tiempoVoz: 0
    };
  }

  return stats.usuarios[userId];
}

const commands = [];

/* =========================================================
   /stats
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Muestra las estadísticas generales del servidor"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    stats.miembros = interaction.guild.memberCount;

    guardarDB(db);

    const embed = new EmbedBuilder()
      .setTitle("📊 Estadísticas del servidor")
      .addFields(
        {
          name: "👥 Miembros",
          value: `\`${interaction.guild.memberCount}\``,
          inline: true
        },
        {
          name: "💬 Mensajes",
          value: `\`${stats.mensajes}\``,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: `\`${stats.comandos}\``,
          inline: true
        }
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /serverstatistics
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("serverstatistics")
    .setDescription("Muestra estadísticas detalladas del servidor"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const textoCanales =
      Object.entries(stats.canales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id, cantidad]) => `<#${id}> — ${cantidad}`)
        .join("\n") ||
      "No hay datos de canales todavía.";

    const textoComandos =
      Object.entries(stats.comandosUsados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([nombre, cantidad]) => `/${nombre} — ${cantidad}`)
        .join("\n") ||
      "No hay comandos registrados.";

    const embed = new EmbedBuilder()
      .setTitle("📊 Estadísticas detalladas")
      .addFields(
        {
          name: "👥 Miembros",
          value: `${interaction.guild.memberCount}`,
          inline: true
        },
        {
          name: "💬 Mensajes",
          value: `${stats.mensajes}`,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: `${stats.comandos}`,
          inline: true
        },
        {
          name: "📢 Canales activos",
          value: textoCanales
        },
        {
          name: "🔥 Comandos más utilizados",
          value: textoComandos
        }
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /memberstats
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("memberstats")
    .setDescription("Muestra las estadísticas de un miembro")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Miembro")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") ||
      interaction.user;

    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const datos = obtenerUsuarioStats(
      stats,
      usuario.id
    );

    guardarDB(db);

    const embed = new EmbedBuilder()
      .setTitle(`📊 Estadísticas de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL())
      .addFields(
        {
          name: "💬 Mensajes",
          value: `${datos.mensajes}`,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: `${datos.comandos}`,
          inline: true
        },
        {
          name: "🎤 Tiempo en voz",
          value: `${Math.floor(datos.tiempoVoz / 60)} minutos`,
          inline: true
        }
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /messagestats
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("messagestats")
    .setDescription("Muestra estadísticas de mensajes"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const usuarios =
      Object.entries(stats.usuarios)
        .sort((a, b) =>
          b[1].mensajes - a[1].mensajes
        )
        .slice(0, 10);

    const texto =
      usuarios.length
        ? usuarios
            .map(
              ([id, datos], index) =>
                `**${index + 1}.** <@${id}> — ${datos.mensajes} mensajes`
            )
            .join("\n")
        : "Todavía no hay mensajes registrados.";

    const embed = new EmbedBuilder()
      .setTitle("💬 Estadísticas de mensajes")
      .setDescription(texto)
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /voicestats
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("voicestats")
    .setDescription("Muestra estadísticas de voz"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const usuarios =
      Object.entries(stats.usuarios)
        .filter(([, datos]) => datos.tiempoVoz > 0)
        .sort((a, b) =>
          b[1].tiempoVoz - a[1].tiempoVoz
        )
        .slice(0, 10);

    const texto =
      usuarios.length
        ? usuarios
            .map(([id, datos], index) => {
              const minutos =
                Math.floor(datos.tiempoVoz / 60);

              return `**${index + 1}.** <@${id}> — ${minutos} minutos`;
            })
            .join("\n")
        : "Todavía no hay datos de voz.";

    const embed = new EmbedBuilder()
      .setTitle("🎤 Estadísticas de voz")
      .setDescription(texto)
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /commandstats
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("commandstats")
    .setDescription("Muestra estadísticas de comandos"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const comandos =
      Object.entries(stats.comandosUsados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

    const texto =
      comandos.length
        ? comandos
            .map(
              ([nombre, cantidad], index) =>
                `**${index + 1}.** \`/${nombre}\` — ${cantidad} usos`
            )
            .join("\n")
        : "Todavía no hay comandos registrados.";

    const embed = new EmbedBuilder()
      .setTitle("⚡ Estadísticas de comandos")
      .setDescription(texto)
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /topcommands
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("topcommands")
    .setDescription("Muestra los comandos más utilizados"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const lista =
      Object.entries(stats.comandosUsados)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    if (!lista.length) {
      return interaction.reply({
        content:
          "📊 Todavía no hay estadísticas de comandos.",
        ephemeral: true
      });
    }

    const texto = lista
      .map(
        ([nombre, cantidad], index) =>
          `**${index + 1}.** \`/${nombre}\` — **${cantidad}** usos`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🏆 Top comandos")
      .setDescription(texto)
      .setColor(0xf1c40f);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /activity
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("activity")
    .setDescription("Muestra la actividad general del servidor"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const usuariosActivos =
      Object.values(stats.usuarios)
        .filter(datos => datos.mensajes > 0)
        .length;

    const canalesActivos =
      Object.keys(stats.canales).length;

    const embed = new EmbedBuilder()
      .setTitle("📈 Actividad del servidor")
      .addFields(
        {
          name: "👤 Usuarios activos",
          value: `${usuariosActivos}`,
          inline: true
        },
        {
          name: "📢 Canales activos",
          value: `${canalesActivos}`,
          inline: true
        },
        {
          name: "💬 Mensajes",
          value: `${stats.mensajes}`,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: `${stats.comandos}`,
          inline: true
        }
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /statistics
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("statistics")
    .setDescription("Muestra un resumen completo de estadísticas"),

  async execute(interaction) {
    const db = cargarDB();
    const stats = prepararStats(db, interaction.guildId);

    const topComando =
      Object.entries(stats.comandosUsados)
        .sort((a, b) => b[1] - a[1])[0];

    const topUsuario =
      Object.entries(stats.usuarios)
        .sort((a, b) =>
          b[1].mensajes - a[1].mensajes
        )[0];

    const embed = new EmbedBuilder()
      .setTitle("📊 Resumen de estadísticas")
      .addFields(
        {
          name: "👥 Miembros",
          value: `${interaction.guild.memberCount}`,
          inline: true
        },
        {
          name: "💬 Mensajes",
          value: `${stats.mensajes}`,
          inline: true
        },
        {
          name: "⚡ Comandos",
          value: `${stats.comandos}`,
          inline: true
        },
        {
          name: "🏆 Comando #1",
          value: topComando
            ? `/${topComando[0]} — ${topComando[1]} usos`
            : "Sin datos",
          inline: false
        },
        {
          name: "🔥 Usuario más activo",
          value: topUsuario
            ? `<@${topUsuario[0]}> — ${topUsuario[1].mensajes} mensajes`
            : "Sin datos",
          inline: false
        }
      )
      .setColor(0x5865f2)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   /statsreset
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("statsreset")
    .setDescription("Reinicia las estadísticas del servidor")
    .setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    ),

  async execute(interaction) {
    const db = cargarDB();

    if (!db.estadisticas) {
      db.estadisticas = {};
    }

    db.estadisticas[interaction.guildId] = {
      mensajes: 0,
      comandos: 0,
      miembros: interaction.guild.memberCount,
      usuarios: {},
      comandosUsados: {},
      canales: {},
      voz: {}
    };

    guardarDB(db);

    await interaction.reply(
      "🗑️ Las estadísticas de este servidor fueron reiniciadas."
    );
  }
});

/* =========================================================
   /statshelp
========================================================= */

commands.push({
  data: new SlashCommandBuilder()
    .setName("statshelp")
    .setDescription("Muestra los comandos de estadísticas"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("📊 Comandos de estadísticas")
      .setDescription(
        [
          "`/stats` — Estadísticas generales.",
          "`/serverstatistics` — Estadísticas detalladas.",
          "`/memberstats` — Estadísticas de un miembro.",
          "`/messagestats` — Estadísticas de mensajes.",
          "`/voicestats` — Estadísticas de voz.",
          "`/commandstats` — Estadísticas de comandos.",
          "`/topcommands` — Comandos más utilizados.",
          "`/activity` — Actividad del servidor.",
          "`/statistics` — Resumen completo.",
          "`/statsreset` — Reiniciar estadísticas.",
          "`/statshelp` — Esta ayuda."
        ].join("\n")
      )
      .setColor(0x5865f2);

    await interaction.reply({
      embeds: [embed]
    });
  }
});

/* =========================================================
   EXPORTACIÓN
========================================================= */

module.exports = commands;
