const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketrename")
    .setDescription("Cambia el nombre del ticket actual")
    .addStringOption(option =>
      option
        .setName("nombre")
        .setDescription("Nuevo nombre del ticket")
        .setRequired(true)
        .setMaxLength(90)
    ),

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

    const nombre = interaction.options
      .getString("nombre")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .slice(0, 90);

    if (!nombre) {
      return interaction.reply({
        content: "❌ El nombre indicado no es válido.",
        ephemeral: true
      });
    }

    try {
      await canal.setName(`ticket-${nombre}`);

      const embed = new EmbedBuilder()
        .setTitle("✏️ Ticket renombrado")
        .setDescription(
          `El ticket ahora se llama **${canal.name}**.`
        )
        .setColor(0x5865f2)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Error renombrando ticket:", error);

      await interaction.reply({
        content:
          "❌ No pude cambiar el nombre del ticket. Comprueba que tengo permiso para gestionar canales.",
        ephemeral: true
      });
    }
  }
};
