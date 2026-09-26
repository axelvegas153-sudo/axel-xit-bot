const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("contar")
    .setDescription("Cuenta caracteres y palabras")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto que quieres analizar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");

    const caracteres = texto.length;
    const palabras = texto.trim()
      ? texto.trim().split(/\s+/).length
      : 0;

    await interaction.reply(
      `📊 **Análisis del texto**\n\n` +
      `🔤 Caracteres: **${caracteres}**\n` +
      `📝 Palabras: **${palabras}**`
    );
  }
};
