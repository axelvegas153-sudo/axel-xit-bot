const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Muestra cuánto tiempo lleva activo el bot"),

  async execute(interaction) {
    const segundos = Math.floor(process.uptime());

    const dias = Math.floor(segundos / 86400);
    const horas = Math.floor((segundos % 86400) / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;

    await interaction.reply(
      `⏱️ **Axel XIT lleva activo:**\n\n` +
      `📅 ${dias} días\n` +
      `🕐 ${horas} horas\n` +
      `⏰ ${minutos} minutos\n` +
      `⏱️ ${secs} segundos`
    );
  }
};
