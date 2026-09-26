const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverregion")
    .setDescription("Muestra información de la región del servidor"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🌎 Región del servidor")
      .setDescription(
        "Discord gestiona automáticamente la región de voz de los servidores."
      )
      .setColor(0x5865f2)
      .setFooter({ text: "Axel XIT • Información" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
