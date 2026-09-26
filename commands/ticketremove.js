const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticketremove")
    .setDescription("Quita un usuario del ticket actual")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres quitar")
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

    if (usuario.id === interaction.user.id) {
      return interaction.reply({
        content: "❌ No puedes quitarte a ti mismo del ticket.",
        ephemeral: true
      });
    }

    try {
      await interaction.channel.permissionOverwrites.edit(usuario.id, {
        ViewChannel: false,
        SendMessages: false,
        ReadMessageHistory: false
      });

      const embed = new EmbedBuilder()
        .setTitle("👤 Usuario eliminado")
        .setDescription(
          `${usuario} ya no puede acceder a este ticket.`
        )
        .setColor(0xed4245)
        .setTimestamp();

      await interaction.reply({
        embeds: [embed]
      });
    } catch (error) {
      console.error("Error quitando usuario del ticket:", error);

      await interaction.reply({
        content:
          "❌ No pude quitar al usuario. Comprueba mis permisos para gestionar el canal.",
        ephemeral: true
      });
    }
  }
};
