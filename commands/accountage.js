const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("accountage")
    .setDescription("Muestra la antigüedad de una cuenta")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const timestamp = Math.floor(
      usuario.createdTimestamp / 1000
    );

    const embed = new EmbedBuilder()
      .setTitle(`⏳ Antigüedad de ${usuario.username}`)
      .setThumbnail(usuario.displayAvatarURL({ size: 512 }))
      .setColor(0x5865f2)
      .addFields({
        name: "📅 Cuenta creada",
        value: `<t:${timestamp}:F>\n<t:${timestamp}:R>`
      })
      .setFooter({
        text: "Axel XIT • Antigüedad"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
