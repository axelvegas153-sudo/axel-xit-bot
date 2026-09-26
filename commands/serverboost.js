const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverboost")
    .setDescription("Muestra información de los boosts del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const nivel = guild.premiumTier || 0;
    const boosts = guild.premiumSubscriptionCount || 0;

    const embed = new EmbedBuilder()
      .setTitle(`🚀 Boosts de ${guild.name}`)
      .setColor(0x5865f2)
      .addFields(
        {
          name: "🚀 Nivel",
          value: `${nivel}`,
          inline: true
        },
        {
          name: "💎 Boosts",
          value: `${boosts}`,
          inline: true
        }
      )
      .setFooter({ text: "Axel XIT • Boosts" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
