const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("banner")
    .setDescription("Muestra el banner del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const banner = guild.bannerURL({
      size: 4096,
      extension: "png"
    });

    if (!banner) {
      return interaction.reply({
        content: "❌ Este servidor no tiene un banner.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Banner de ${guild.name}`)
      .setDescription(`[🔗 Abrir banner](${banner})`)
      .setImage(banner)
      .setColor(0x5865f2)
      .setFooter({
        text: "Axel XIT • Banner del servidor"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
