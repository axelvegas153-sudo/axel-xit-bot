const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botcount")
    .setDescription("Cuenta los bots del servidor"),

  async execute(interaction) {
    await interaction.guild.members.fetch();

    const bots = interaction.guild.members.cache.filter(
      member => member.user.bot
    ).size;

    const total = interaction.guild.memberCount;

    const embed = new EmbedBuilder()
      .setTitle("🤖 Conteo de bots")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "🤖 Bots",
          value: `${bots}`,
          inline: true
        },
        {
          name: "👥 Miembros totales",
          value: `${total}`,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Estadísticas"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
