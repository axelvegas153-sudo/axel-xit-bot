const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketadd")
    .setDescription("Añade un usuario al ticket actual")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres añadir")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) {
      return interaction.reply({
        content: "❌ Este comando solo puede utilizarse dentro de un servidor.",
        ephemeral: true
      });
    }

    if (!interaction.channel.name.startsWith("ticket-")) {
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

    const usuario = interaction.options.getUser("usuario");

    if (!usuario) {
      return interaction.reply({
        content: "❌ No se encontró el usuario.",
        ephemeral: true
      });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(usuario.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true
      });

      const embed = new EmbedBuilder()
        .setTitle("👤 Usuario añadido")
        .setDescription(
          `${usuario} fue añadido correctamente a este ticket.`
        )
        .setColor(0x57f287)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Error añadiendo usuario al ticket:", error);

      await interaction.reply({
        content:
          "❌ No pude añadir al usuario. Comprueba que tengo permisos para gestionar los permisos del canal.",
        ephemeral: true
      });
    }
  }
};
