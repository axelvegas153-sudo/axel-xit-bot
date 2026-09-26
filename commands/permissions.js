const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("permissions")
    .setDescription("Muestra tus permisos principales en este servidor"),

  async execute(interaction) {
    const miembro = interaction.member;

    const permisos = [
      ["Administrador", PermissionFlagsBits.Administrator],
      ["Gestionar servidor", PermissionFlagsBits.ManageGuild],
      ["Gestionar canales", PermissionFlagsBits.ManageChannels],
      ["Gestionar roles", PermissionFlagsBits.ManageRoles],
      ["Gestionar mensajes", PermissionFlagsBits.ManageMessages],
      ["Expulsar miembros", PermissionFlagsBits.KickMembers],
      ["Banear miembros", PermissionFlagsBits.BanMembers],
      ["Gestionar miembros", PermissionFlagsBits.ModerateMembers]
    ];

    const lista = permisos
      .map(([nombre, permiso]) =>
        `${miembro.permissions.has(permiso) ? "✅" : "❌"} ${nombre}`
      )
      .join("\n");

    await interaction.reply(
      `🔐 **Tus permisos principales**\n\n${lista}`
    );
  }
};
