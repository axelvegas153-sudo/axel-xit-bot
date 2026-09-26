const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function cargarDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}", "utf8");
    }

    const contenido = fs.readFileSync(DB_PATH, "utf8").trim();

    if (!contenido) return {};

    return JSON.parse(contenido);
  } catch (error) {
    console.error("Error leyendo database.json:", error);
    return {};
  }
}

function guardarDB(db) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(db, null, 2),
    "utf8"
  );
}

function obtenerConfig(db, guildId) {
  if (!db.configuracion) {
    db.configuracion = {};
  }

  if (!db.configuracion[guildId]) {
    db.configuracion[guildId] = {
      logs: null,
      canalGeneral: null,
      idioma: "es",
      prefijo: "/",
      color: "#5865F2"
    };
  }

  return db.configuracion[guildId];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("configuracion")
    .setDescription("⚙️ Configuración de Axel XIT")

    .addSubcommand(sub =>
      sub
        .setName("ver")
        .setDescription("Muestra la configuración actual")
    )

    .addSubcommand(sub =>
      sub
        .setName("logs")
        .setDescription("Configura el canal de logs")
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription("Canal donde se enviarán los logs")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("general")
        .setDescription("Configura el canal general")
        .addChannelOption(option =>
          option
            .setName("canal")
            .setDescription("Canal general del servidor")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("idioma")
        .setDescription("Configura el idioma del bot")
        .addStringOption(option =>
          option
            .setName("idioma")
            .setDescription("Idioma")
            .setRequired(true)
            .addChoices(
              {
                name: "Español",
                value: "es"
              },
              {
                name: "English",
                value: "en"
              }
            )
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("color")
        .setDescription("Configura el color de los embeds")
        .addStringOption(option =>
          option
            .setName("color")
            .setDescription("Color HEX, ejemplo: #5865F2")
            .setRequired(true)
        )
    )

    .addSubcommand(sub =>
      sub
        .setName("reset")
        .setDescription("Restablece la configuración")
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "❌ Este comando solo funciona en servidores.",
        ephemeral: true
      });
    }

    if (!interaction.member.permissions.has("ManageGuild")) {
      return interaction.reply({
        content:
          "❌ Necesitas el permiso **Gestionar servidor**.",
        ephemeral: true
      });
    }

    const db = cargarDB();

    const config = obtenerConfig(
      db,
      interaction.guild.id
    );

    const sub = interaction.options.getSubcommand();

    /* =========================
       VER
    ========================= */

    if (sub === "ver") {
      const embed = new EmbedBuilder()
        .setTitle("⚙️ Configuración de Axel XIT")
        .setDescription(
          `Configuración de **${interaction.guild.name}**`
        )
        .addFields(
          {
            name: "📋 Logs",
            value: config.logs
              ? `<#${config.logs}>`
              : "No configurado",
            inline: true
          },
          {
            name: "💬 Canal general",
            value: config.canalGeneral
              ? `<#${config.canalGeneral}>`
              : "No configurado",
            inline: true
          },
          {
            name: "🌎 Idioma",
            value:
              config.idioma === "es"
                ? "🇪🇸 Español"
                : "🇺🇸 English",
            inline: true
          },
          {
            name: "🎨 Color",
            value: `\`${config.color}\``,
            inline: true
          }
        )
        .setColor(
          /^#[0-9A-F]{6}$/i.test(config.color)
            ? config.color
            : "#5865F2"
        )
        .setTimestamp();

      return interaction.reply({
        embeds: [embed]
      });
    }

    /* =========================
       LOGS
    ========================= */

    if (sub === "logs") {
      const canal =
        interaction.options.getChannel("canal");

      config.logs = canal.id;

      guardarDB(db);

      return interaction.reply({
        content:
          `📋 Canal de logs configurado en ${canal}.`
      });
    }

    /* =========================
       GENERAL
    ========================= */

    if (sub === "general") {
      const canal =
        interaction.options.getChannel("canal");

      config.canalGeneral = canal.id;

      guardarDB(db);

      return interaction.reply({
        content:
          `💬 Canal general configurado en ${canal}.`
      });
    }

    /* =========================
       IDIOMA
    ========================= */

    if (sub === "idioma") {
      const idioma =
        interaction.options.getString("idioma");

      config.idioma = idioma;

      guardarDB(db);

      return interaction.reply({
        content:
          idioma === "es"
            ? "🇪🇸 Idioma configurado en **Español**."
            : "🇺🇸 Language set to **English**."
      });
    }

    /* =========================
       COLOR
    ========================= */

    if (sub === "color") {
      const color =
        interaction.options.getString("color");

      if (!/^#[0-9A-F]{6}$/i.test(color)) {
        return interaction.reply({
          content:
            "❌ Color inválido. Usa un formato HEX como `#5865F2`.",
          ephemeral: true
        });
      }

      config.color = color.toUpperCase();

      guardarDB(db);

      return interaction.reply({
        content:
          `🎨 Color configurado en \`${config.color}\`.`
      });
    }

    /* =========================
       RESET
    ========================= */

    if (sub === "reset") {
      db.configuracion[interaction.guild.id] = {
        logs: null,
        canalGeneral: null,
        idioma: "es",
        prefijo: "/",
        color: "#5865F2"
      };

      guardarDB(db);

      return interaction.reply({
        content:
          "♻️ La configuración de Axel XIT fue restablecida."
      });
    }
  }
};
