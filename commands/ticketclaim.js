const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "database.json");

function loadDatabase() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2));
    }

    const content = fs.readFileSync(DB_PATH, "utf8").trim();

    if (!content) return {};

    return JSON.parse(content);
  } catch (error) {
    console.error("Error leyendo database.json:", error);
    return {};
  }
}

function saveDatabase(database) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(database, null, 2),
    "utf8"
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketclaim")
    .setDescription("Reclama el ticket para atenderlo tú"),

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

    if (
      !interaction.member.permissions.has(
        PermissionFlagsBits.ManageChannels
      )
    ) {
      return interaction.reply({
        content: "❌ Necesitas el permiso **Gestionar canales**.",
        ephemeral: true
      });
    }

    try {
      const database = loadDatabase();

      if (!database.tickets) {
        database.tickets = {};
      }

      if (!database.tickets[interaction.guild.id]) {
        database.tickets[interaction.guild.id] = {};
      }

      const tickets = database.tickets[interaction.guild.id];

      if (!tickets[canal.id]) {
        tickets[canal.id] = {
          channelId: canal.id,
          guildId: interaction.guild.id,
          createdAt: Date.now(),
          claimedBy: null
        };
      }

      if (tickets[canal.id].claimedBy) {
        const anterior = await interaction.guild.members
          .fetch(tickets[canal.id].claimedBy)
          .catch(() => null);

        return interaction.reply({
          content: `❌ Este ticket ya está reclamado por ${
            anterior ? anterior.user.tag : "otro miembro del staff"
          }.`,
          ephemeral: true
        });
      }

      tickets[canal.id].claimedBy = interaction.user.id;
      tickets[canal.id].claimedAt = Date.now();

      saveDatabase(database);

      const embed = new EmbedBuilder()
        .setTitle("🎫 Ticket reclamado")
        .setDescription(
          `Este ticket ahora será atendido por ${interaction.user}.`
        )
        .addFields({
          name: "👤 Responsable",
          value: `${interaction.user}`,
          inline: true
        })
        .setColor(0x57f287)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Error reclamando ticket:", error);

      await interaction.reply({
        content:
          "❌ Ocurrió un error al guardar quién reclamó el ticket.",
        ephemeral: true
      });
    }
  }
};
