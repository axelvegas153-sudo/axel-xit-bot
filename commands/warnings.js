const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("Muestra las advertencias de un usuario")
    .addUserOption(option =>
      option.setName("usuario")
        .setDescription("Usuario que quieres consultar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Advertencias de ${usuario.username}`)
      .setColor(0x5865f2)
      .setDescription(
        "El sistema de advertencias todavía no tiene almacenamiento configurado."
      )
      .setFooter({ text: "Axel XIT • Moderación" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
