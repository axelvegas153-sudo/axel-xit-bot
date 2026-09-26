const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("dado")
    .setDescription("Lanza un dado")
    .addIntegerOption(option =>
      option
        .setName("caras")
        .setDescription("Cantidad de caras del dado")
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(false)
    ),

  async execute(interaction) {
    const caras = interaction.options.getInteger("caras") || 6;
    const resultado = Math.floor(Math.random() * caras) + 1;

    await interaction.reply(
      `🎲 **Dado de ${caras} caras**\n\n` +
      `🎯 Resultado: **${resultado}**`
    );
  }
};
