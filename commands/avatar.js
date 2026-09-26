const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Muestra el avatar de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario del que quieres ver el avatar")
        .setRequired(false)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario") || interaction.user;

    const avatar = usuario.displayAvatarURL({
      size: 1024,
      extension: "png"
    });

    const embed = new EmbedBuilder()
      .setTitle(`🖼️ Avatar de ${usuario.username}`)
      .setDescription(`[Abrir imagen](${avatar})`)
      .setImage(avatar)
      .setFooter({
        text: "Axel XIT • Avatar"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};
