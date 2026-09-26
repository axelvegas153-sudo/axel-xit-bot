const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("where")
    .setDescription("Muestra el canal donde ejecutaste el comando"),

  async execute(interaction) {
    await interaction.reply(
      `📍 Estás en el canal ${interaction.channel}.`
    );
  }
};
