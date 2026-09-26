const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("Muestra el icono del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const icon = guild.iconURL({
      size: 4096,
      extension: "png"
    });

    if (!icon) {
      return interaction.reply({
        content: "❌ Este servidor no tiene un icono.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Icono de ${guild.name}`)
      .setImage(icon)
      .setDescription(`[🔗 Abrir imagen](${icon})`)
      .setColor(0x5865f2)
      .setFooter({
        text: "Axel XIT • Icono del servidor"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
