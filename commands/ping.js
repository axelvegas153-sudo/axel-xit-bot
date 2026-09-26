const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Muestra el ping del bot"),

  async execute(interaction) {
    const inicio = Date.now();

    await interaction.reply("🏓 Calculando...");

    const latencia = Date.now() - inicio;
    const websocket = interaction.client.ws.ping;

    await interaction.editReply(
      `🏓 **Pong!**\n` +
      `📡 Mensaje: **${latencia}ms**\n` +
      `🌐 Discord: **${websocket}ms**`
    );
  }
};
