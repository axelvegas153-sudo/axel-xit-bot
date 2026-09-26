const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Muestra información del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply({
        content: "❌ Este comando solo puede utilizarse dentro de un servidor.",
        ephemeral: true
      });
    }

    const owner = await guild.fetchOwner();

    const miembros = guild.memberCount;
    const bots = guild.members.cache.filter(
      member => member.user.bot
    ).size;

    const humanos = Math.max(miembros - bots, 0);

    const canales = guild.channels.cache;
    const texto = canales.filter(channel => channel.isTextBased()).size;
    const voz = canales.filter(channel => channel.isVoiceBased()).size;

    const roles = guild.roles.cache.filter(
      role => role.id !== guild.id
    ).size;

    const fecha = Math.floor(guild.createdTimestamp / 1000);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        {
          name: "🆔 ID",
          value: `\`${guild.id}\``,
          inline: true
        },
        {
          name: "👑 Dueño",
          value: `${owner.user.tag}`,
          inline: true
        },
        {
          name: "👥 Miembros",
          value: `\`${miembros}\``,
          inline: true
        },
        {
          name: "👤 Usuarios",
          value: `\`${humanos}\``,
          inline: true
        },
        {
          name: "🤖 Bots",
          value: `\`${bots}\``,
          inline: true
        },
        {
          name: "💬 Canales",
          value: `\`${canales.size}\``,
          inline: true
        },
        {
          name: "📝 Texto",
          value: `\`${texto}\``,
          inline: true
        },
        {
          name: "🔊 Voz",
          value: `\`${voz}\``,
          inline: true
        },
        {
          name: "🎭 Roles",
          value: `\`${roles}\``,
          inline: true
        },
        {
          name: "📅 Creado",
          value: `<t:${fecha}:F>`,
          inline: false
        }
      )
      .setFooter({
        text: "Axel XIT • Información del servidor"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
