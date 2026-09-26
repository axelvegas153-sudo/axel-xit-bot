const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverstats")
    .setDescription("Muestra estadísticas generales del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    await guild.members.fetch();

    const total = guild.memberCount;
    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humanos = total - bots;
    const online = guild.members.cache.filter(
      m => m.presence?.status && m.presence.status !== "offline"
    ).size;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Estadísticas de ${guild.name}`)
      .addFields(
        { name: "👥 Miembros", value: `${total}`, inline: true },
        { name: "👤 Humanos", value: `${humanos}`, inline: true },
        { name: "🤖 Bots", value: `${bots}`, inline: true },
        { name: "🟢 Activos", value: `${online}`, inline: true },
        { name: "💬 Canales", value: `${guild.channels.cache.size}`, inline: true },
        { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true }
      )
      .setThumbnail(guild.iconURL({ size: 512 }))
      .setColor(0x5865F2)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
