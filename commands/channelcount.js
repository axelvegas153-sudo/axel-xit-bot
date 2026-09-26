const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelcount")
    .setDescription("Muestra la cantidad de canales del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;
    const canales = guild.channels.cache;

    const texto = canales.filter(
      channel => channel.type === ChannelType.GuildText
    ).size;

    const voz = canales.filter(
      channel => channel.type === ChannelType.GuildVoice
    ).size;

    const categorias = canales.filter(
      channel => channel.type === ChannelType.GuildCategory
    ).size;

    const anuncios = canales.filter(
      channel => channel.type === ChannelType.GuildAnnouncement
    ).size;

    const foros = canales.filter(
      channel => channel.type === ChannelType.GuildForum
    ).size;

    const total = canales.size;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Canales de ${guild.name}`)
      .setDescription("Estadísticas actuales de los canales del servidor.")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "📺 Total",
          value: `${total}`,
          inline: true
        },
        {
          name: "💬 Texto",
          value: `${texto}`,
          inline: true
        },
        {
          name: "🔊 Voz",
          value: `${voz}`,
          inline: true
        },
        {
          name: "📁 Categorías",
          value: `${categorias}`,
          inline: true
        },
        {
          name: "📢 Anuncios",
          value: `${anuncios}`,
          inline: true
        },
        {
          name: "📝 Foros",
          value: `${foros}`,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Estadísticas de canales"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
