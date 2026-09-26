const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription("Genera un timestamp de Discord")
    .addIntegerOption(option =>
      option
        .setName("minutos")
        .setDescription("Minutos desde ahora")
        .setRequired(false)
    ),

  async execute(interaction) {
    const minutos = interaction.options.getInteger("minutos") || 0;

    const fecha = new Date(Date.now() + minutos * 60 * 1000);
    const unix = Math.floor(fecha.getTime() / 1000);

    await interaction.reply(
      `⏰ **Timestamp generado**\n\n` +
      `Normal: <t:${unix}:F>\n` +
      `Relativo: <t:${unix}:R>\n\n` +
      `Código: \`<t:${unix}:F>\``
    );
  }
};
