const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("decirid")
    .setDescription("Muestra tu ID de Discord"),

  async execute(interaction) {
    await interaction.reply(
      `🆔 Tu ID de Discord es:\n\`${interaction.user.id}\``
    );
  }
};
