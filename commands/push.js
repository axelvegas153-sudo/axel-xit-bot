const {
  SlashCommandBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("push")
    .setDescription("Empuja a un usuario")
    .addUserOption(option =>
      option
        .setName("usuario")
        .setDescription("Usuario que quieres empujar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const usuario =
      interaction.options.getUser("usuario");

    await interaction.reply(
      `💨 **${interaction.user.username}** empujó a **${usuario.username}** 😂`
    );
  }
};
