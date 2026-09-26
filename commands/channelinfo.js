const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("Muestra información detallada de un canal")
    .addChannelOption(option =>
      option
        .setName("canal")
        .setDescription("El canal que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const canal =
      interaction.options.getChannel("canal") || interaction.channel;

    const tipos = {
      [ChannelType.GuildText]: "💬 Texto",
      [ChannelType.GuildVoice]: "🔊 Voz",
      [ChannelType.GuildCategory]: "📁 Categoría",
      [ChannelType.GuildAnnouncement]: "📢 Anuncios",
      [ChannelType.GuildStageVoice]: "🎤 Escenario",
      [ChannelType.GuildForum]: "📝 Foro",
      [ChannelType.GuildMedia]: "🖼️ Media"
    };

    const tipo = tipos[canal.type] || "❓ Otro";

    const embed = new EmbedBuilder()
      .setTitle("📺 Información del canal")
      .setColor(0x5865f2)
      .addFields(
        {
          name: "📛 Nombre",
          value: canal.name || "Sin nombre",
          inline: true
        },
        {
          name: "🆔 ID",
          value: canal.id,
          inline: true
        },
        {
          name: "📂 Tipo",
          value: tipo,
          inline: true
        },
        {
          name: "📌 Posición",
          value: `${canal.position ?? "N/A"}`,
          inline: true
        },
        {
          name: "📁 Categoría",
          value: canal.parent ? canal.parent.name : "Sin categoría",
          inline: true
        },
        {
          name: "🔗 Mención",
          value: `<#${canal.id}>`,
          inline: true
        }
      )
      .setFooter({
        text: "Axel XIT • Información de canales"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
