const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mention")
    .setDescription("Genera una mención de un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario = interaction.options.getUser("usuario");

    await interaction.reply(
      `📢 Mención: ${usuario}\n🆔 ID: \`${usuario.id}\``
    );
  }
};
