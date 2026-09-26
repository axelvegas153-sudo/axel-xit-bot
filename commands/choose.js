const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("choose")
    .setDescription("Elige aleatoriamente entre varias opciones")
    .addStringOption(option =>
      option
        .setName("opciones")
        .setDescription("Opciones separadas por comas")
        .setRequired(true)
    ),

  async execute(interaction) {
    const texto = interaction.options.getString("opciones");

    const opciones = texto
      .split(",")
      .map(opcion => opcion.trim())
      .filter(Boolean);

    if (opciones.length < 2) {
      return interaction.reply(
        "❌ Necesitas al menos **2 opciones** separadas por comas."
      );
    }

    const elegida = opciones[Math.floor(Math.random() * opciones.length)];

    await interaction.reply(
      `🎯 Elegí entre **${opciones.length} opciones**.\n\n` +
      `✨ Resultado: **${elegida}**`
    );
  }
};
