const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botstats")
    .setDescription("Muestra estadísticas del bot"),

  async execute(interaction) {
    const client = interaction.client;

    const memoria = process.memoryUsage().heapUsed / 1024 / 1024;
    const uptime = Math.floor(process.uptime());

    const dias = Math.floor(uptime / 86400);
    const horas = Math.floor((uptime % 86400) / 3600);
    const minutos = Math.floor((uptime % 3600) / 60);

    const embed = new EmbedBuilder()
      .setTitle("🤖 Estadísticas de Axel XIT")
      .addFields(
        { name: "🏠 Servidores", value: `${client.guilds.cache.size}`, inline: true },
        { name: "👥 Usuarios", value: `${client.users.cache.size}`, inline: true },
        { name: "📡 Ping", value: `${client.ws.ping} ms`, inline: true },
        { name: "💾 RAM", value: `${memoria.toFixed(2)} MB`, inline: true },
        { name: "⏱️ Uptime", value: `${dias}d ${horas}h ${minutos}m`, inline: true },
        { name: "⚡ Comandos", value: `${client.commands?.size || 0}`, inline: true }
      )
      .setColor(0x5865F2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
