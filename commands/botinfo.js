const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Muestra información de Axel XIT"),

  async execute(interaction) {
    const client = interaction.client;

    const uptime = Math.floor(client.uptime / 1000);

    const dias = Math.floor(uptime / 86400);
    const horas = Math.floor((uptime % 86400) / 3600);
    const minutos = Math.floor((uptime % 3600) / 60);
    const segundos = uptime % 60;

    const embed = new EmbedBuilder()
      .setTitle("🤖 Axel XIT")
      .setDescription("Información del bot")
      .addFields(
        {
          name: "🆔 Nombre",
          value: "`Axel XIT`",
          inline: true
        },
        {
          name: "🏠 Servidores",
          value: `\`${client.guilds.cache.size}\``,
          inline: true
        },
        {
          name: "👥 Usuarios",
          value: `\`${client.guilds.cache.reduce(
            (total, guild) => total + guild.memberCount,
            0
          )}\``,
          inline: true
        },
        {
          name: "⚡ Latencia",
          value: `\`${Math.round(client.ws.ping)}ms\``,
          inline: true
        },
        {
          name: "⏱️ Tiempo activo",
          value: `\`${dias}d ${horas}h ${minutos}m ${segundos}s\``,
          inline: true
        },
        {
          name: "📦 Comandos",
          value: `\`${client.commands?.size ?? 0}\``,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Información del bot"
      })
      .setTimestamp();

    if (client.user.displayAvatarURL()) {
      embed.setThumbnail(client.user.displayAvatarURL({ size: 256 }));
    }

    await interaction.reply({
      embeds: [embed]
    });
  }
};
