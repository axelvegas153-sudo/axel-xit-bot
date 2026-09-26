const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channellist")
    .setDescription("Muestra la lista de canales del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const canales = guild.channels.cache;

    const texto = canales
      .filter(c => c.type === ChannelType.GuildText)
      .sort((a, b) => a.position - b.position)
      .map(c => `💬 ${c} — \`${c.id}\``)
      .join("\n");

    const voz = canales
      .filter(c => c.type === ChannelType.GuildVoice)
      .sort((a, b) => a.position - b.position)
      .map(c => `🔊 ${c.name} — \`${c.id}\``)
      .join("\n");

    const categorias = canales
      .filter(c => c.type === ChannelType.GuildCategory)
      .sort((a, b) => a.position - b.position)
      .map(c => `📁 ${c.name} — \`${c.id}\``)
      .join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`📺 Canales de ${guild.name}`)
      .setColor(0x5865f2)
      .addFields(
        {
          name: `💬 Texto (${canales.filter(c => c.type === ChannelType.GuildText).size})`,
          value: texto || "Ninguno",
        },
        {
          name: `🔊 Voz (${canales.filter(c => c.type === ChannelType.GuildVoice).size})`,
          value: voz || "Ninguno",
        },
        {
          name: `📁 Categorías (${canales.filter(c => c.type === ChannelType.GuildCategory).size})`,
          value: categorias || "Ninguna",
        }
      )
      .setFooter({
        text: "Axel XIT • Lista de canales"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
