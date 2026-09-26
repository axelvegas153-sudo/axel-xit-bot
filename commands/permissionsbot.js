const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("permissionsbot")
    .setDescription("Muestra los permisos principales de Axel XIT"),

  async execute(interaction) {
    const miembro = interaction.guild.members.me;

    const permisos = [
      ["Administrador", "Administrator"],
      ["Gestionar servidor", "ManageGuild"],
      ["Gestionar canales", "ManageChannels"],
      ["Gestionar roles", "ManageRoles"],
      ["Gestionar mensajes", "ManageMessages"],
      ["Expulsar miembros", "KickMembers"],
      ["Banear miembros", "BanMembers"],
      ["Gestionar miembros", "ModerateMembers"],
      ["Ver canales", "ViewChannel"],
      ["Enviar mensajes", "SendMessages"]
    ];

    const lista = permisos
      .map(([nombre, permiso]) =>
        `${miembro.permissions.has(permiso) ? "✅" : "❌"} ${nombre}`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🤖 Permisos de Axel XIT")
      .setDescription(lista)
      .setColor(0x5865F2);

    await interaction.reply({ embeds: [embed] });
  }
};
