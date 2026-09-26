const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("latencia")
    .setDescription("Muestra la latencia de Axel XIT"),

  async execute(interaction) {
    const inicio = Date.now();

    await interaction.deferReply();

    const respuesta = Date.now() - inicio;
    const api = Math.round(interaction.client.ws.ping);

    const estado =
      api < 100 ? "🟢 Excelente" :
      api < 200 ? "🟡 Buena" :
      api < 400 ? "🟠 Regular" :
      "🔴 Alta";

    const embed = new EmbedBuilder()
      .setTitle("🏓 Axel XIT")
      .setDescription("Información de conexión del bot")
      .addFields(
        {
          name: "⚡ Latencia",
          value: `\`${respuesta}ms\``,
          inline: true
        },
        {
          name: "💓 Discord API",
          value: `\`${api}ms\``,
          inline: true
        },
        {
          name: "📡 Estado",
          value: estado,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Sistema de latencia"
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed]
    });
  }
};
