const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servercreated")
    .setDescription("Muestra cuándo fue creado el servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    const timestamp = Math.floor(
      guild.createdTimestamp / 1000
    );

    const embed = new EmbedBuilder()
      .setTitle(`📅 Creación de ${guild.name}`)
      .setColor(0x5865f2)
      .setThumbnail(
        guild.iconURL({
          size: 512,
          extension: "png"
        })
      )
      .addFields(
        {
          name: "📅 Fecha",
          value: `<t:${timestamp}:F>`,
          inline: false
        },
        {
          name: "⏳ Hace",
          value: `<t:${timestamp}:R>`,
          inline: true
        },
        {
          name: "🆔 ID del servidor",
          value: guild.id,
          inline: true
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
