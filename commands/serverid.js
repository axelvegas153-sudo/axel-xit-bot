const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverid")
    .setDescription("Muestra el ID del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle("🆔 ID del servidor")
      .setDescription(`\`${guild.id}\``)
      .setColor(0x5865f2)
      .setFooter({ text: "Axel XIT • Información" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
