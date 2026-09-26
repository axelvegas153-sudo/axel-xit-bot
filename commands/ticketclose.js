const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketclose")
    .setDescription("Cierra el ticket actual"),

  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) {
      return interaction.reply({
        content: "❌ Este comando solo puede usarse dentro de un servidor.",
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

    const miembro = interaction.member;

    const puedeCerrar =
      miembro.permissions.has(PermissionFlagsBits.ManageChannels) ||
      canal.name ===
        `ticket-${interaction.user.username}`
          .toLowerCase()
          .replace(/[^a-z0-9-_]/g, "")
          .slice(0, 20);

    if (!puedeCerrar) {
      return interaction.reply({
        content: "❌ No tienes permiso para cerrar este ticket.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🔒 Ticket cerrado")
      .setDescription(
        `Este ticket será eliminado en **5 segundos**.\n\n` +
        `Cerrado por ${interaction.user}.`
      )
      .setColor(0xed4245)
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });

    setTimeout(async () => {
      try {
        await canal.delete("Ticket cerrado");
      } catch (error) {
        console.error("No se pudo eliminar el ticket:", error);
      }
    }, 5000);
  }
};
