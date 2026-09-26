const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reverso")
    .setDescription("Invierte un texto")
    .addStringOption(option =>
      option
        .setName("texto")
        .setDescription("Texto que quieres invertir")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("texto");

    const invertido = [...texto].reverse().join("");

    await interaction.reply(
      `🔄 **Texto invertido:**\n\`${invertido}\``
    );
  }
};
