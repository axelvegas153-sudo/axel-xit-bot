const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverpermissions")
    .setDescription("Muestra los permisos principales de Axel XIT"),

  async execute(interaction) {
    const permisos = interaction.guild.members.me?.permissions;

    if (!permisos) {
      return interaction.reply({
        content: "❌ No pude comprobar mis permisos.",
        ephemeral: true
      });
    }

    const principales = [
      ["Ver canales", PermissionsBitField.Flags.ViewChannel],
      ["Enviar mensajes", PermissionsBitField.Flags.SendMessages],
      ["Gestionar mensajes", PermissionsBitField.Flags.ManageMessages],
      ["Gestionar roles", PermissionsBitField.Flags.ManageRoles],
      ["Gestionar canales", PermissionsBitField.Flags.ManageChannels],
      ["Expulsar miembros", PermissionsBitField.Flags.KickMembers],
      ["Banear miembros", PermissionsBitField.Flags.BanMembers]
    ];

    const lista = principales
      .map(([nombre, permiso]) =>
        `${permisos.has(permiso) ? "✅" : "❌"} ${nombre}`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("🔐 Permisos de Axel XIT")
      .setDescription(lista)
      .setColor(0x5865f2)
      .setFooter({ text: "Axel XIT • Permisos" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
