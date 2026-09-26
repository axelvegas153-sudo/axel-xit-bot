const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("topchannels")
    .setDescription("Muestra información de los canales del servidor"),

  async execute(interaction) {
    const canales = interaction.guild.channels.cache
      .filter(channel =>
        channel.type === ChannelType.GuildText ||
        channel.type === ChannelType.GuildAnnouncement
      )
      .sort((a, b) => a.position - b.position)
      .first(15);

    if (!canales.length) {
      return interaction.reply("❌ No hay canales de texto.");
    }

    const lista = canales
      .map((channel, index) =>
        `**${index + 1}.** ${channel} — posición ${channel.position}`
      )
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle("📚 Canales del servidor")
      .setDescription(lista)
      .setColor(0x5865F2);

    await interaction.reply({ embeds: [embed] });
  }
};
