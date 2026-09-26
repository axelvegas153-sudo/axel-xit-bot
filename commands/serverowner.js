const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverowner")
    .setDescription("Muestra al propietario del servidor"),

  async execute(interaction) {
    const guild = interaction.guild;

    try {
      const owner = await guild.fetchOwner();

      const embed = new EmbedBuilder()
        .setTitle(`👑 Propietario de ${guild.name}`)
        .setColor(0x5865f2)
        .setThumbnail(owner.user.displayAvatarURL({
          size: 512,
          extension: "png"
        }))
        .addFields(
          {
            name: "👤 Usuario",
            value: `${owner}`,
            inline: true
          },
          {
            name: "📝 Nombre",
            value: owner.user.username,
            inline: true
          },
          {
            name: "🆔 ID",
            value: owner.id,
            inline: true
          },
          {
            name: "📅 Cuenta creada",
            value: `<t:${Math.floor(
              owner.user.createdTimestamp / 1000
            )}:F>`,
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
    } catch (error) {
      console.error("Error en /serverowner:", error);

      await interaction.reply({
        content: "❌ No pude obtener al propietario del servidor.",
        ephemeral: true
      });
    }
  }
};
