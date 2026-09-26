const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return {};
    }

    const data = fs.readFileSync(DB_PATH, "utf8").trim();

    if (!data) return {};

    return JSON.parse(data);
  } catch (error) {
    console.error("Error leyendo database.json:", error);
    return {};
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketinfo")
    .setDescription("Muestra la información del ticket actual"),

  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) {
      return interaction.reply({
        content: "❌ Este comando solo puede utilizarse dentro de un servidor.",
        ephemeral: true
      });
    }

    const canal = interaction.channel;

    if (!canal.name.startsWith("ticket-")) {
      return interaction.reply({
        content: "❌ Este canal no parece ser un ticket.",
        ephemeral: true
      });
    }

    const database = loadDatabase();

    const ticket =
      database.tickets?.[interaction.guild.id]?.[canal.id];

    const creador =
      canal.permissionOverwrites.cache.find(
        overwrite =>
          overwrite.type === 1 &&
          overwrite.allow.has("ViewChannel")
      );

    let creadorTexto = "No identificado";

    if (creador) {
      const usuario = await interaction.client.users
        .fetch(creador.id)
        .catch(() => null);

      if (usuario) {
        creadorTexto = `${usuario} (${usuario.tag})`;
      }
    }

    let responsable = "Sin reclamar";

    if (ticket?.claimedBy) {
      const usuario = await interaction.client.users
        .fetch(ticket.claimedBy)
        .catch(() => null);

      responsable = usuario
        ? `${usuario}`
        : `<@${ticket.claimedBy}>`;
    }

    const creado =
      ticket?.createdAt
        ? `<t:${Math.floor(ticket.createdAt / 1000)}:F>`
        : "No registrado";

    const embed = new EmbedBuilder()
      .setTitle("🎫 Información del ticket")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "📌 Canal",
          value: `${canal}`,
          inline: true
        },
        {
          name: "🆔 ID",
          value: canal.id,
          inline: true
        },
        {
          name: "👤 Creador",
          value: creadorTexto,
          inline: false
        },
        {
          name: "🛡️ Responsable",
          value: responsable,
          inline: false
        },
        {
          name: "📅 Creado",
          value: creado,
          inline: false
        }
      )
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};
