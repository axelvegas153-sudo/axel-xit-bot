const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rolecolorinfo")
    .setDescription("Muestra información del color de un rol")
    .addRoleOption(option =>
      option
        .setName("rol")
        .setDescription("Rol")
        .setRequired(true)
    ),

  async execute(interaction) {
    const rol = interaction.options.getRole("rol");

    const embed = new EmbedBuilder()
      .setTitle(`🎨 Color de ${rol.name}`)
      .addFields(
        {
          name: "Color",
          value: `\`${rol.hexColor}\``,
          inline: true
        },
        {
          name: "Posición",
          value: `${rol.position}`,
          inline: true
        },
        {
          name: "Usuarios",
          value: `${rol.members.size}`,
          inline: true
        }
      )
      .setColor(rol.color || 0x5865F2);

    await interaction.reply({ embeds: [embed] });
  }
};
