const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverfeatures")
    .setDescription("Muestra las funciones activadas del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const features = guild.features || [];

    const texto = features.length
      ? features.map(feature => `• ${feature}`).join("\n")
      : "No hay funciones especiales disponibles.";

    const embed = new EmbedBuilder()
      .setTitle(`⚙️ Funciones de ${guild.name}`)
      .setDescription(texto.slice(0, 4000))
      .setColor(0x5865f2)
      .setFooter({ text: "Axel XIT • Funciones del servidor" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
